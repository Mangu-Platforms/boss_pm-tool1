import { describe, it, expect } from "vitest";
import { sprintMetrics, allSprintMetrics, cumulativeFlowData } from "../lib/sprint-metrics";

describe("sprint-metrics", () => {
  it("returns metrics for sprint", () => {
    const m = sprintMetrics("sprint-1");
    expect(m).not.toBeNull();
    expect(m!.sprint_name).toBe("Sprint 1");
    expect(typeof m!.completion_rate).toBe("number");
  });

  it("returns null for unknown sprint", () => {
    expect(sprintMetrics("nonexistent")).toBeNull();
  });

  it("returns all sprint metrics", () => {
    const all = allSprintMetrics();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it("metrics have required fields", () => {
    const all = allSprintMetrics();
    for (const m of all) {
      expect(m.sprint_id).toBeDefined();
      expect(typeof m.total_issues).toBe("number");
      expect(typeof m.completed).toBe("number");
      expect(typeof m.in_progress).toBe("number");
    }
  });

  it("returns cumulative flow data", () => {
    const flow = cumulativeFlowData("sprint-1");
    expect(flow.length).toBeGreaterThan(0);
    for (const d of flow) {
      expect(d.date).toBeDefined();
      expect(typeof d.backlog).toBe("number");
      expect(typeof d.done).toBe("number");
    }
  });

  it("returns empty flow for unknown sprint", () => {
    expect(cumulativeFlowData("nonexistent")).toEqual([]);
  });
});
