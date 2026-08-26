import { describe, it, expect } from "vitest";
import { listViews, createView, deleteView, getView } from "@/lib/views";

describe("saved views", () => {
  it("lists default views", () => {
    const views = listViews();
    expect(views.length).toBeGreaterThanOrEqual(3);
  });

  it("creates a new view", () => {
    const v = createView("High priority open", { status: "open", priority: "high" }, "priority");
    expect(v.name).toBe("High priority open");
    expect(v.filters.status).toBe("open");
    expect(v.sort).toBe("priority");
  });

  it("gets a view by id", () => {
    const views = listViews();
    const v = getView(views[0].id);
    expect(v).toBeTruthy();
    expect(v?.name).toBe(views[0].name);
  });

  it("returns null for unknown view", () => {
    expect(getView("fake-id")).toBeNull();
  });

  it("deletes a view", () => {
    const v = createView("Temp view", {});
    expect(deleteView(v.id)).toBe(true);
    expect(getView(v.id)).toBeNull();
  });

  it("returns false for unknown delete", () => {
    expect(deleteView("fake")).toBe(false);
  });
});
