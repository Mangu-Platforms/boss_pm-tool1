import { describe, it, expect } from "vitest";
import { listDashboards, getDashboard, getDefaultDashboard, createDashboard, updateDashboard, addWidget, removeWidget, deleteDashboard } from "../lib/custom-dashboards";

describe("custom-dashboards", () => {
  it("lists all dashboards", () => {
    const all = listDashboards();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by owner", () => {
    const mine = listDashboards("max");
    expect(mine.every((d) => d.owner === "max")).toBe(true);
  });

  it("gets dashboard by id", () => {
    const d = getDashboard("dash-1");
    expect(d).not.toBeNull();
    expect(d!.name).toBe("Sprint Overview");
  });

  it("gets default dashboard", () => {
    const d = getDefaultDashboard();
    expect(d).not.toBeNull();
    expect(d!.is_default).toBe(true);
  });

  it("creates dashboard", () => {
    const d = createDashboard("My Board", "test desc", "bob");
    expect(d.name).toBe("My Board");
    expect(d.widgets).toHaveLength(0);
  });

  it("updates dashboard and sets default", () => {
    const d = updateDashboard("dash-2", { is_default: true });
    expect(d).not.toBeNull();
    expect(d!.is_default).toBe(true);
    const old = getDashboard("dash-1");
    expect(old!.is_default).toBe(false);
  });

  it("adds and removes widget", () => {
    const w = addWidget("dash-1", "metric", "Test Widget", { source: "test" });
    expect(w).not.toBeNull();
    expect(w!.type).toBe("metric");
    const removed = removeWidget("dash-1", w!.id);
    expect(removed).toBe(true);
  });

  it("deletes dashboard", () => {
    const d = createDashboard("Del me", "", "max");
    expect(deleteDashboard(d.id)).toBe(true);
    expect(getDashboard(d.id)).toBeNull();
  });
});
