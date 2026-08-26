import { describe, it, expect } from "vitest";
import { listBudgets, getBudget, createBudget, recordBurn, budgetBurnEvents, deleteBudget, budgetSummary } from "../lib/error-budgets";

describe("error-budgets", () => {
  it("lists budgets sorted by remaining pct", () => {
    const all = listBudgets();
    expect(all.length).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].budget_remaining_pct <= all[i].budget_remaining_pct).toBe(true);
    }
  });

  it("filters by service", () => {
    const svc1 = listBudgets("svc-1");
    expect(svc1.every((b) => b.service_id === "svc-1")).toBe(true);
  });

  it("filters by status", () => {
    const healthy = listBudgets(undefined, "healthy");
    expect(healthy.every((b) => b.status === "healthy")).toBe(true);
  });

  it("gets by id", () => {
    const b = getBudget("eb-1");
    expect(b).not.toBeNull();
    expect(b!.metric).toBe("availability");
  });

  it("creates budget with calculated total", () => {
    const b = createBudget("svc-test", "availability", 99.9, "monthly", "2025-02-01", "2025-02-28");
    expect(b.budget_total_minutes).toBeGreaterThan(0);
    expect(b.budget_remaining_pct).toBe(100);
    expect(b.status).toBe("healthy");
  });

  it("records burn and updates status", () => {
    const b = createBudget("svc-burn", "availability", 99.9, "weekly", "2025-02-01", "2025-02-07");
    const event = recordBurn(b.id, b.budget_total_minutes * 0.8, "Major outage");
    expect(event).not.toBeNull();
    const updated = getBudget(b.id);
    expect(updated!.budget_remaining_pct).toBeLessThanOrEqual(20);
    expect(["warning", "critical"]).toContain(updated!.status);
  });

  it("tracks burn events", () => {
    const events = budgetBurnEvents("eb-1");
    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  it("deletes budget", () => {
    const b = createBudget("svc-del", "latency", 99.5, "monthly", "2025-03-01", "2025-03-31");
    expect(deleteBudget(b.id)).toBe(true);
    expect(getBudget(b.id)).toBeNull();
  });

  it("returns summary", () => {
    const s = budgetSummary();
    expect(s.total).toBeGreaterThan(0);
    expect(typeof s.avg_remaining).toBe("number");
    expect(typeof s.by_status).toBe("object");
  });
});
