import { describe, it, expect } from "vitest";
import { dashboardSummary, sprintBurndown, velocityData } from "../lib/dashboard-analytics";

describe("dashboard-analytics", () => {
  it("returns dashboard summary", () => {
    const s = dashboardSummary();
    expect(s.total_issues).toBeGreaterThan(0);
    expect(s.by_status).toBeDefined();
    expect(s.by_priority).toBeDefined();
    expect(typeof s.overdue_count).toBe("number");
    expect(typeof s.unassigned_count).toBe("number");
  });

  it("summary has milestone progress", () => {
    const s = dashboardSummary();
    expect(Array.isArray(s.milestone_progress)).toBe(true);
  });

  it("returns sprint burndown", () => {
    const b = sprintBurndown("sprint-1");
    expect(b).not.toBeNull();
    expect(b!.sprint_name).toBe("Sprint 1");
    expect(b!.days.length).toBeGreaterThan(0);
    expect(b!.total_points).toBeGreaterThan(0);
  });

  it("burndown returns null for unknown sprint", () => {
    expect(sprintBurndown("nonexistent")).toBeNull();
  });

  it("returns velocity data", () => {
    const v = velocityData();
    expect(Array.isArray(v.sprints)).toBe(true);
    expect(v.sprints.length).toBeGreaterThan(0);
    expect(typeof v.average_velocity).toBe("number");
  });

  it("velocity sprint entries have points", () => {
    const v = velocityData();
    for (const s of v.sprints) {
      expect(s.name).toBeDefined();
      expect(typeof s.committed_points).toBe("number");
      expect(typeof s.completed_points).toBe("number");
    }
  });
});
