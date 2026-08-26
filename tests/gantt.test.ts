import { describe, it, expect } from "vitest";
import { ganttItems, ganttDateRange } from "../lib/gantt";

describe("gantt", () => {
  it("returns gantt items", () => {
    const items = ganttItems();
    expect(items.length).toBeGreaterThan(0);
  });

  it("includes issues", () => {
    const items = ganttItems();
    expect(items.some((i) => i.type === "issue")).toBe(true);
  });

  it("includes milestones", () => {
    const items = ganttItems();
    expect(items.some((i) => i.type === "milestone")).toBe(true);
  });

  it("items have progress", () => {
    const items = ganttItems();
    items.forEach((i) => {
      expect(i.progress).toBeGreaterThanOrEqual(0);
      expect(i.progress).toBeLessThanOrEqual(100);
    });
  });

  it("items sorted by start date", () => {
    const items = ganttItems();
    for (let i = 1; i < items.length; i++) {
      const a = items[i - 1].start_date || "9999";
      const b = items[i].start_date || "9999";
      expect(a <= b).toBe(true);
    }
  });

  it("returns date range", () => {
    const range = ganttDateRange();
    expect(range.min).toBeDefined();
    expect(range.max).toBeDefined();
    expect(range.min <= range.max).toBe(true);
  });
});
