import { describe, it, expect, beforeEach } from "vitest";
import { logActivity, getActivity } from "../lib/activity";

describe("activity", () => {
  beforeEach(() => {
    // clear by logging enough to overwrite (activity store is module-scoped)
  });

  it("logs and retrieves an event", () => {
    const issue = { id: "iss-1", product_id: "prod-1" };
    const event = logActivity(issue, "created", '"Test issue"');
    expect(event.action).toBe("created");
    expect(event.detail).toBe('"Test issue"');
    expect(event.issue_id).toBe("iss-1");
    expect(event.product_id).toBe("prod-1");

    const events = getActivity({ issue_id: "iss-1" });
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].id).toBe(event.id);
  });

  it("filters by product_id", () => {
    logActivity({ id: "iss-2", product_id: "prod-a" }, "status_changed", "open");
    logActivity({ id: "iss-3", product_id: "prod-b" }, "created", "new");

    const prodA = getActivity({ product_id: "prod-a" });
    const allHaveA = prodA.every((e) => e.product_id === "prod-a");
    expect(allHaveA).toBe(true);
  });

  it("respects limit", () => {
    for (let i = 0; i < 10; i++) {
      logActivity({ id: `iss-${i}`, product_id: "prod-x" }, "updated", `update ${i}`);
    }
    const limited = getActivity({ product_id: "prod-x", limit: 3 });
    expect(limited.length).toBe(3);
  });

  it("stores newest first", () => {
    logActivity({ id: "first", product_id: "p" }, "created", "first");
    logActivity({ id: "second", product_id: "p" }, "created", "second");
    const events = getActivity({ limit: 2 });
    expect(events[0].detail).toBe("second");
  });
});
