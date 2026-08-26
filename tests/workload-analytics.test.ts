import { describe, it, expect } from "vitest";
import { memberWorkloads, priorityBreakdown, agingIssues } from "../lib/workload-analytics";

describe("workload-analytics", () => {
  it("returns member workloads", () => {
    const workloads = memberWorkloads();
    expect(workloads.length).toBeGreaterThan(0);
    expect(workloads[0].member).toBeDefined();
    expect(workloads[0].total).toBeGreaterThan(0);
  });

  it("workloads include status and priority breakdown", () => {
    const workloads = memberWorkloads();
    for (const w of workloads) {
      expect(w.by_status).toBeDefined();
      expect(w.by_priority).toBeDefined();
      expect(typeof w.overdue).toBe("number");
    }
  });

  it("returns priority breakdown", () => {
    const breakdown = priorityBreakdown();
    expect(breakdown.length).toBeGreaterThan(0);
    for (const b of breakdown) {
      expect(b.priority).toBeDefined();
      expect(typeof b.count).toBe("number");
      expect(typeof b.pct_done).toBe("number");
    }
  });

  it("returns aging issues", () => {
    const aging = agingIssues(0);
    expect(Array.isArray(aging)).toBe(true);
    for (const a of aging) {
      expect(a.id).toBeDefined();
      expect(typeof a.age_days).toBe("number");
    }
  });

  it("aging sorted by age descending", () => {
    const aging = agingIssues(0);
    for (let i = 1; i < aging.length; i++) {
      expect(aging[i - 1].age_days).toBeGreaterThanOrEqual(aging[i].age_days);
    }
  });

  it("aging filters by min days", () => {
    const aging = agingIssues(999);
    expect(aging.every((a) => a.age_days >= 999)).toBe(true);
  });
});
