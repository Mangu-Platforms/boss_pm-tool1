import { describe, it, expect } from "vitest";
import { listRunbooks, getRunbook, createRunbook, executeRunbook, deleteRunbook, totalEstimatedTime } from "../lib/runbooks";

describe("runbooks", () => {
  it("lists all runbooks sorted by title", () => {
    const all = listRunbooks();
    expect(all.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].title.localeCompare(all[i].title)).toBeLessThanOrEqual(0);
    }
  });

  it("filters by service_id", () => {
    const svc1 = listRunbooks("svc-1");
    expect(svc1.every((r) => r.service_id === "svc-1")).toBe(true);
  });

  it("gets by id", () => {
    const rb = getRunbook("rb-1");
    expect(rb).not.toBeNull();
    expect(rb!.title).toBe("API Gateway Restart");
  });

  it("creates runbook", () => {
    const rb = createRunbook("Test RB", "desc", "svc-2", "sev-3", "max", [{ order: 1, type: "manual", title: "Step 1", instructions: "Do it", expected_duration_minutes: 5 }]);
    expect(rb.steps).toHaveLength(1);
    expect(rb.times_used).toBe(0);
  });

  it("executes runbook", () => {
    const before = getRunbook("rb-1")!.times_used;
    const rb = executeRunbook("rb-1");
    expect(rb).not.toBeNull();
    expect(rb!.times_used).toBe(before + 1);
  });

  it("calculates total estimated time", () => {
    const time = totalEstimatedTime("rb-1");
    expect(time).toBe(20);
  });

  it("deletes runbook", () => {
    const rb = createRunbook("ToDel", "d", "svc-1", "sev-4", "max", []);
    expect(deleteRunbook(rb.id)).toBe(true);
    expect(getRunbook(rb.id)).toBeNull();
  });
});
