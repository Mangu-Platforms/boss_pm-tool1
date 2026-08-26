import { describe, it, expect } from "vitest";
import { sprintPlan, backlogIssues, planningStats } from "../lib/sprint-planning";
import { createSprint, addIssueToSprint } from "../lib/sprints";

describe("sprint-planning", () => {
  it("returns sprint plan", () => {
    const sp = createSprint("Plan Test", "test goal", "2025-10-01", "2025-10-14");
    addIssueToSprint(sp.id, "plan-i1");
    const plan = sprintPlan(sp.id);
    expect(plan).not.toBeNull();
    expect(plan!.sprint_name).toBe("Plan Test");
    expect(plan!.issues).toHaveLength(1);
  });

  it("calculates remaining capacity", () => {
    const sp = createSprint("Cap Test", "", "2025-11-01", "2025-11-14");
    const plan = sprintPlan(sp.id, 30);
    expect(plan).not.toBeNull();
    expect(plan!.remaining_capacity).toBe(30);
  });

  it("returns null for invalid sprint", () => {
    expect(sprintPlan("nonexistent")).toBeNull();
  });

  it("returns backlog issues", () => {
    const backlog = backlogIssues();
    expect(Array.isArray(backlog)).toBe(true);
    backlog.forEach((i) => {
      expect(i.status).toBe("backlog");
    });
  });

  it("returns planning stats", () => {
    const stats = planningStats();
    expect(typeof stats.total_backlog).toBe("number");
    expect(typeof stats.total_sprints).toBe("number");
    expect(typeof stats.active_sprints).toBe("number");
  });
});
