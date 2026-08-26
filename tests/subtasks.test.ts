import { describe, it, expect } from "vitest";
import { addSubtask, listSubtasks, toggleSubtask, removeSubtask, subtaskProgress } from "@/lib/subtasks";

describe("subtasks", () => {
  const issueId = "st-test-" + Math.random().toString(36).slice(2);

  it("adds a subtask", () => {
    const st = addSubtask(issueId, "Write unit tests");
    expect(st.title).toBe("Write unit tests");
    expect(st.done).toBe(false);
    expect(st.issue_id).toBe(issueId);
  });

  it("lists subtasks in order", () => {
    addSubtask(issueId, "Second task");
    const list = listSubtasks(issueId);
    expect(list.length).toBe(2);
    expect(list[0].title).toBe("Write unit tests");
    expect(list[1].title).toBe("Second task");
  });

  it("toggles done state", () => {
    const list = listSubtasks(issueId);
    const toggled = toggleSubtask(list[0].id);
    expect(toggled?.done).toBe(true);
    const toggled2 = toggleSubtask(list[0].id);
    expect(toggled2?.done).toBe(false);
  });

  it("returns null for unknown toggle", () => {
    expect(toggleSubtask("nonexistent")).toBeNull();
  });

  it("tracks progress", () => {
    const list = listSubtasks(issueId);
    toggleSubtask(list[0].id);
    const progress = subtaskProgress(issueId);
    expect(progress.total).toBe(2);
    expect(progress.done).toBe(1);
  });

  it("removes a subtask", () => {
    const list = listSubtasks(issueId);
    expect(removeSubtask(list[1].id)).toBe(true);
    expect(listSubtasks(issueId).length).toBe(1);
    expect(removeSubtask("fake")).toBe(false);
  });
});
