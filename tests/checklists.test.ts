import { describe, it, expect } from "vitest";
import {
  listChecklists,
  getChecklist,
  createChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklist,
  checklistProgress,
} from "@/lib/checklists";

describe("checklists", () => {
  it("lists seed checklists", () => {
    const cls = listChecklists();
    expect(cls.length).toBeGreaterThanOrEqual(1);
  });

  it("filters by issue_id", () => {
    const cls = listChecklists("BOSS-1");
    expect(cls.every((c) => c.issue_id === "BOSS-1")).toBe(true);
  });

  it("gets checklist by id", () => {
    const cl = getChecklist("cl-1");
    expect(cl).not.toBeNull();
    expect(cl!.title).toBe("Launch Checklist");
  });

  it("creates a checklist with items", () => {
    const cl = createChecklist("BOSS-50", "Deploy Checklist", ["Build", "Test", "Deploy"]);
    expect(cl.items.length).toBe(3);
    expect(cl.items[0].text).toBe("Build");
    expect(cl.items[0].checked).toBe(false);
  });

  it("adds an item to a checklist", () => {
    const cl = createChecklist("BOSS-51", "Simple", []);
    const updated = addChecklistItem(cl.id, "New item");
    expect(updated).not.toBeNull();
    expect(updated!.items.length).toBe(1);
  });

  it("toggles a checklist item", () => {
    const cl = createChecklist("BOSS-52", "Toggle test", ["Item A"]);
    const itemId = cl.items[0].id;
    const toggled = toggleChecklistItem(cl.id, itemId);
    expect(toggled!.items[0].checked).toBe(true);
    const again = toggleChecklistItem(cl.id, itemId);
    expect(again!.items[0].checked).toBe(false);
  });

  it("calculates progress", () => {
    const cl = createChecklist("BOSS-53", "Progress test", ["A", "B", "C", "D"]);
    toggleChecklistItem(cl.id, cl.items[0].id);
    toggleChecklistItem(cl.id, cl.items[1].id);
    const prog = checklistProgress(cl.id);
    expect(prog.total).toBe(4);
    expect(prog.checked).toBe(2);
    expect(prog.percent).toBe(50);
  });

  it("deletes a checklist", () => {
    const cl = createChecklist("BOSS-54", "Delete me", []);
    expect(deleteChecklist(cl.id)).toBe(true);
    expect(deleteChecklist(cl.id)).toBe(false);
  });
});
