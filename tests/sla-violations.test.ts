import { describe, it, expect } from "vitest";
import { listViolations, getViolation, createViolation, updateViolation, violationStats } from "../lib/sla-violations";

describe("sla-violations", () => {
  it("lists violations newest first", () => {
    const all = listViolations();
    expect(all.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].detected_at >= all[i].detected_at).toBe(true);
    }
  });

  it("filters by status", () => {
    const open = listViolations("open");
    expect(open.every((v) => v.status === "open")).toBe(true);
  });

  it("filters by service", () => {
    const svc1 = listViolations(undefined, "svc-1");
    expect(svc1.every((v) => v.service_id === "svc-1")).toBe(true);
  });

  it("gets by id", () => {
    const v = getViolation("slav-1");
    expect(v).not.toBeNull();
    expect(v!.sla_metric).toBe("uptime_pct");
  });

  it("creates violation", () => {
    const v = createViolation("svc-5", "response_time_ms", 200, 500, "major", "Slow responses");
    expect(v.status).toBe("open");
  });

  it("updates with resolution timestamp", () => {
    const v = updateViolation("slav-2", { status: "resolved", root_cause: "Queue overflow" });
    expect(v).not.toBeNull();
    expect(v!.resolved_at).not.toBeNull();
    expect(v!.root_cause).toBe("Queue overflow");
  });

  it("returns stats", () => {
    const stats = violationStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.avg_resolution_minutes).toBe("number");
  });
});
