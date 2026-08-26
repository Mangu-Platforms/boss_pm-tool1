import { describe, it, expect } from "vitest";
import { listCostEntries, getCostEntry, createCostEntry, deleteCostEntry, costSummary, formatCents } from "@/lib/cost-tracking";

describe("cost-tracking", () => {
  it("lists seed entries", () => {
    expect(listCostEntries().length).toBeGreaterThanOrEqual(4);
  });

  it("filters by issue_id", () => {
    const entries = listCostEntries("BOSS-1");
    expect(entries.every((e) => e.issue_id === "BOSS-1")).toBe(true);
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it("gets entry by id", () => {
    const e = getCostEntry("cost-1");
    expect(e).not.toBeNull();
    expect(e!.amount_cents).toBe(50000);
  });

  it("creates an entry", () => {
    const e = createCostEntry("BOSS-99", "infrastructure", 5000, "Test cost", "max");
    expect(e.category).toBe("infrastructure");
  });

  it("calculates summary", () => {
    const s = costSummary();
    expect(s.total_cents).toBeGreaterThan(0);
    expect(s.entry_count).toBeGreaterThanOrEqual(4);
    expect(s.by_category.development).toBeGreaterThan(0);
  });

  it("calculates summary per issue", () => {
    const s = costSummary("BOSS-1");
    expect(s.total_cents).toBe(51200);
  });

  it("formats cents", () => {
    expect(formatCents(12345)).toBe("$123.45");
    expect(formatCents(0)).toBe("$0.00");
  });

  it("deletes an entry", () => {
    const e = createCostEntry("BOSS-99", "other", 100, "Del", "max");
    expect(deleteCostEntry(e.id)).toBe(true);
    expect(deleteCostEntry(e.id)).toBe(false);
  });
});
