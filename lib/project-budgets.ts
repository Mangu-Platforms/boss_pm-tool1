export type BudgetStatus = "under_budget" | "on_track" | "at_risk" | "over_budget";

export type BudgetLineItem = {
  id: string;
  category: string;
  planned: number;
  actual: number;
  notes: string;
};

export type ProjectBudget = {
  id: string;
  project_id: string;
  name: string;
  total_budget: number;
  spent: number;
  status: BudgetStatus;
  line_items: BudgetLineItem[];
  created_at: string;
};

let nextId = 4;
let nextLineId = 10;
function genId() { return `budget-${nextId++}`; }
function genLineId() { return `line-${nextLineId++}`; }

function calcStatus(spent: number, total: number): BudgetStatus {
  const pct = total > 0 ? spent / total : 0;
  if (pct <= 0.7) return "under_budget";
  if (pct <= 0.9) return "on_track";
  if (pct <= 1.0) return "at_risk";
  return "over_budget";
}

const store: ProjectBudget[] = [
  {
    id: "budget-1", project_id: "proj-1", name: "Q1 Development", total_budget: 50000, spent: 32000, status: "on_track",
    line_items: [
      { id: "line-1", category: "Engineering", planned: 30000, actual: 22000, notes: "" },
      { id: "line-2", category: "Design", planned: 10000, actual: 6000, notes: "" },
      { id: "line-3", category: "Infrastructure", planned: 10000, actual: 4000, notes: "" },
    ],
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "budget-2", project_id: "proj-1", name: "Q2 Marketing", total_budget: 20000, spent: 18500, status: "at_risk",
    line_items: [
      { id: "line-4", category: "Ads", planned: 12000, actual: 11000, notes: "Exceeded CPC targets" },
      { id: "line-5", category: "Content", planned: 8000, actual: 7500, notes: "" },
    ],
    created_at: "2025-04-01T10:00:00Z",
  },
  {
    id: "budget-3", project_id: "proj-2", name: "Infrastructure Upgrade", total_budget: 15000, spent: 5000, status: "under_budget",
    line_items: [
      { id: "line-6", category: "Cloud", planned: 10000, actual: 3500, notes: "" },
      { id: "line-7", category: "Tools", planned: 5000, actual: 1500, notes: "" },
    ],
    created_at: "2025-03-01T10:00:00Z",
  },
];

export function listBudgets(projectId?: string): ProjectBudget[] {
  if (projectId) return store.filter((b) => b.project_id === projectId);
  return [...store];
}

export function getBudget(id: string): ProjectBudget | null {
  return store.find((b) => b.id === id) || null;
}

export function createBudget(projectId: string, name: string, totalBudget: number): ProjectBudget {
  const budget: ProjectBudget = {
    id: genId(), project_id: projectId, name, total_budget: totalBudget,
    spent: 0, status: "under_budget", line_items: [], created_at: new Date().toISOString(),
  };
  store.push(budget);
  return budget;
}

export function addLineItem(budgetId: string, category: string, planned: number): BudgetLineItem | null {
  const b = store.find((bg) => bg.id === budgetId);
  if (!b) return null;
  const item: BudgetLineItem = { id: genLineId(), category, planned, actual: 0, notes: "" };
  b.line_items.push(item);
  b.total_budget = b.line_items.reduce((sum, li) => sum + li.planned, 0);
  b.status = calcStatus(b.spent, b.total_budget);
  return item;
}

export function recordExpense(budgetId: string, lineItemId: string, amount: number): boolean {
  const b = store.find((bg) => bg.id === budgetId);
  if (!b) return false;
  const item = b.line_items.find((li) => li.id === lineItemId);
  if (!item) return false;
  item.actual += amount;
  b.spent = b.line_items.reduce((sum, li) => sum + li.actual, 0);
  b.status = calcStatus(b.spent, b.total_budget);
  return true;
}

export function deleteBudget(id: string): boolean {
  const idx = store.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function budgetSummary(): { total_budgets: number; total_planned: number; total_spent: number; over_budget_count: number } {
  return {
    total_budgets: store.length,
    total_planned: store.reduce((sum, b) => sum + b.total_budget, 0),
    total_spent: store.reduce((sum, b) => sum + b.spent, 0),
    over_budget_count: store.filter((b) => b.status === "over_budget").length,
  };
}
