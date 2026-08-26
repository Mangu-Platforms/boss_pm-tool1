import { describe, it, expect } from "vitest";
import { listCosts, getCost, createCost, deleteCost, costSummary } from "../lib/cost-allocation";

describe("cost-allocation", () => {
  it("lists costs sorted by amount descending", () => {
    const all = listCosts();
    expect(all.length).toBeGreaterThanOrEqual(12);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].amount_cents >= all[i].amount_cents).toBe(true);
    }
  });

  it("filters by team", () => {
    const data = listCosts(undefined, "data");
    expect(data.every((c) => c.team === "data")).toBe(true);
  });

  it("filters by category", () => {
    const compute = listCosts(undefined, undefined, "compute");
    expect(compute.every((c) => c.category === "compute")).toBe(true);
  });

  it("gets by id", () => {
    const c = getCost("ca-1");
    expect(c).not.toBeNull();
    expect(c!.amount_cents).toBe(450000);
  });

  it("creates cost entry", () => {
    const c = createCost("svc-test", "infra", "compute", 100000, "monthly", "Mar 2025", "Test compute");
    expect(c.amount_cents).toBe(100000);
  });

  it("deletes cost entry", () => {
    const c = createCost("svc-del", "data", "storage", 50000, "monthly", "Mar 2025", "To delete");
    expect(deleteCost(c.id)).toBe(true);
    expect(getCost(c.id)).toBeNull();
  });

  it("returns summary", () => {
    const s = costSummary();
    expect(s.total_cents).toBeGreaterThan(0);
    expect(typeof s.by_team).toBe("object");
    expect(typeof s.by_category).toBe("object");
  });

  it("filters summary by period", () => {
    const s = costSummary("Jan 2025");
    expect(s.entry_count).toBeGreaterThan(0);
    expect(s.total_cents).toBeGreaterThan(0);
  });
});
