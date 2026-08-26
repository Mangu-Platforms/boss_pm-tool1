import { describe, it, expect } from "vitest";
import { listRecurringTasks, getRecurringTask, createRecurringTask, updateRecurringTask, triggerRecurringTask, deleteRecurringTask, dueRecurringTasks } from "../lib/recurring-tasks";

describe("recurring-tasks", () => {
  it("lists all recurring tasks", () => {
    const all = listRecurringTasks();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by active", () => {
    const active = listRecurringTasks(true);
    expect(active.every((t) => t.active)).toBe(true);
  });

  it("gets by id", () => {
    const t = getRecurringTask("rt-1");
    expect(t).not.toBeNull();
    expect(t!.title).toBe("Weekly standup prep");
  });

  it("creates recurring task", () => {
    const t = createRecurringTask("Test task", "body", "high", "bob", "daily", "2025-12-01");
    expect(t.pattern).toBe("daily");
    expect(t.active).toBe(true);
  });

  it("updates recurring task", () => {
    const t = updateRecurringTask("rt-1", { priority: "critical" });
    expect(t).not.toBeNull();
    expect(t!.priority).toBe("critical");
  });

  it("triggers and advances date", () => {
    const t = createRecurringTask("Trigger test", "", "medium", "", "weekly", "2025-06-01");
    const result = triggerRecurringTask(t.id);
    expect(result).not.toBeNull();
    expect(result!.nextDue).toBe("2025-06-08");
  });

  it("returns due tasks", () => {
    const due = dueRecurringTasks();
    expect(Array.isArray(due)).toBe(true);
  });

  it("deletes recurring task", () => {
    const t = createRecurringTask("Del test", "", "low", "", "monthly", "2026-01-01");
    expect(deleteRecurringTask(t.id)).toBe(true);
    expect(getRecurringTask(t.id)).toBeNull();
  });
});
