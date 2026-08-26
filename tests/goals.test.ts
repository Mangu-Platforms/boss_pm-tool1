import { describe, it, expect } from "vitest";
import { listGoals, getGoal, createGoal, updateGoal, deleteGoal, addKeyResult, updateKeyResult } from "@/lib/goals";

describe("goals", () => {
  it("lists default goals", () => {
    const goals = listGoals();
    expect(goals.length).toBeGreaterThanOrEqual(2);
  });

  it("gets goal by id", () => {
    const goal = getGoal("goal-revenue");
    expect(goal).toBeTruthy();
    expect(goal!.title).toContain("MRR");
  });

  it("creates a goal", () => {
    const goal = createGoal("New Objective", "A big goal", "Alice");
    expect(goal.status).toBe("on_track");
    expect(goal.progress).toBe(0);
  });

  it("updates a goal", () => {
    const goal = createGoal("Update Me");
    const updated = updateGoal(goal.id, { status: "at_risk", progress: 50 });
    expect(updated!.status).toBe("at_risk");
    expect(updated!.progress).toBe(50);
  });

  it("deletes a goal", () => {
    const goal = createGoal("Delete Me");
    expect(deleteGoal(goal.id)).toBe(true);
    expect(getGoal(goal.id)).toBeNull();
  });

  it("adds key results and recalculates progress", () => {
    const goal = createGoal("With KRs");
    addKeyResult(goal.id, "First KR", 100, "units");
    addKeyResult(goal.id, "Second KR", 50, "%");
    const fetched = getGoal(goal.id)!;
    expect(fetched.key_results.length).toBe(2);
    expect(fetched.progress).toBe(0);
  });

  it("updates key result and recalculates progress", () => {
    const goal = createGoal("KR Update");
    const kr = addKeyResult(goal.id, "Progress KR", 100, "items");
    updateKeyResult(goal.id, kr!.id, 50);
    const fetched = getGoal(goal.id)!;
    expect(fetched.progress).toBe(50);
  });
});
