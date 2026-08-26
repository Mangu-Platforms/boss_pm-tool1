import { describe, it, expect } from "vitest";
import { listBudgets, getBudget, createBudget, addLineItem, recordExpense, deleteBudget, budgetSummary } from "../lib/project-budgets";

describe("project-budgets", () => {
  it("lists all budgets", () => {
    const budgets = listBudgets();
    expect(budgets.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by project", () => {
    const budgets = listBudgets("proj-1");
    expect(budgets.every((b) => b.project_id === "proj-1")).toBe(true);
  });

  it("gets budget by id", () => {
    const b = getBudget("budget-1");
    expect(b).not.toBeNull();
    expect(b!.name).toBe("Q1 Development");
  });

  it("creates a budget", () => {
    const b = createBudget("proj-3", "Q3 Ops", 25000);
    expect(b.total_budget).toBe(25000);
    expect(b.status).toBe("under_budget");
  });

  it("adds line item and updates total", () => {
    const b = createBudget("proj-4", "Test", 0);
    const item = addLineItem(b.id, "Dev", 10000);
    expect(item).not.toBeNull();
    const updated = getBudget(b.id);
    expect(updated!.total_budget).toBe(10000);
  });

  it("records expense and updates status", () => {
    const b = createBudget("proj-5", "Small", 1000);
    const item = addLineItem(b.id, "Tools", 1000);
    expect(recordExpense(b.id, item!.id, 950)).toBe(true);
    const updated = getBudget(b.id);
    expect(updated!.status).toBe("at_risk");
  });

  it("returns budget summary", () => {
    const summary = budgetSummary();
    expect(typeof summary.total_budgets).toBe("number");
    expect(typeof summary.total_planned).toBe("number");
    expect(typeof summary.total_spent).toBe("number");
  });

  it("deletes budget", () => {
    const b = createBudget("proj-6", "Del", 500);
    expect(deleteBudget(b.id)).toBe(true);
    expect(getBudget(b.id)).toBeNull();
  });
});
