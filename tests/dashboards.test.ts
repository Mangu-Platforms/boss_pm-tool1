import { describe, it, expect } from "vitest";
import { listDashboards, getDashboard, createDashboard, addWidget, removeWidget, deleteDashboard, getDefaultDashboard } from "@/lib/dashboards";

describe("dashboards", () => {
  it("lists seed dashboards", () => {
    expect(listDashboards().length).toBeGreaterThanOrEqual(2);
  });

  it("filters by owner", () => {
    const dashboards = listDashboards("max");
    expect(dashboards.every((d) => d.owner === "max")).toBe(true);
  });

  it("gets dashboard by id", () => {
    const d = getDashboard("dash-1");
    expect(d).not.toBeNull();
    expect(d!.name).toBe("Overview");
  });

  it("creates a dashboard", () => {
    const d = createDashboard("Test Dash", "max");
    expect(d.widgets.length).toBe(0);
    expect(d.is_default).toBe(false);
  });

  it("adds a widget", () => {
    const d = createDashboard("Widget Test", "max");
    const updated = addWidget(d.id, "counter", "Test Counter", { value: 42 }, { x: 0, y: 0, w: 3, h: 2 });
    expect(updated!.widgets.length).toBe(1);
  });

  it("removes a widget", () => {
    const d = createDashboard("Remove Widget Test", "max");
    addWidget(d.id, "chart", "Chart", {}, { x: 0, y: 0, w: 6, h: 4 });
    const wId = getDashboard(d.id)!.widgets[0].id;
    const updated = removeWidget(d.id, wId);
    expect(updated!.widgets.length).toBe(0);
  });

  it("gets default dashboard", () => {
    const d = getDefaultDashboard("max");
    expect(d).not.toBeNull();
    expect(d!.is_default).toBe(true);
  });

  it("deletes a dashboard", () => {
    const d = createDashboard("Del Test", "max");
    expect(deleteDashboard(d.id)).toBe(true);
    expect(deleteDashboard(d.id)).toBe(false);
  });
});
