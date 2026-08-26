export type BudgetPeriod = "weekly" | "monthly" | "quarterly";
export type BudgetStatus = "healthy" | "warning" | "critical" | "exhausted";

export type ErrorBudget = {
  id: string;
  service_id: string;
  metric: string;
  slo_target: number;
  period: BudgetPeriod;
  period_start: string;
  period_end: string;
  budget_total_minutes: number;
  budget_consumed_minutes: number;
  budget_remaining_pct: number;
  status: BudgetStatus;
  burn_rate: number;
  created_at: string;
};

export type BurnEvent = {
  id: string;
  budget_id: string;
  minutes_consumed: number;
  reason: string;
  timestamp: string;
};

let nextId = 7;
let nextEventId = 10;

function calcStatus(remaining_pct: number): BudgetStatus {
  if (remaining_pct <= 0) return "exhausted";
  if (remaining_pct <= 10) return "critical";
  if (remaining_pct <= 30) return "warning";
  return "healthy";
}

const budgets: ErrorBudget[] = [
  { id: "eb-1", service_id: "svc-1", metric: "availability", slo_target: 99.9, period: "monthly", period_start: "2025-01-01", period_end: "2025-01-31", budget_total_minutes: 43.2, budget_consumed_minutes: 12.5, budget_remaining_pct: 71.1, status: "healthy", burn_rate: 0.4, created_at: "2025-01-01T00:00:00Z" },
  { id: "eb-2", service_id: "svc-2", metric: "availability", slo_target: 99.95, period: "monthly", period_start: "2025-01-01", period_end: "2025-01-31", budget_total_minutes: 21.6, budget_consumed_minutes: 18.2, budget_remaining_pct: 15.7, status: "warning", burn_rate: 1.2, created_at: "2025-01-01T00:00:00Z" },
  { id: "eb-3", service_id: "svc-3", metric: "latency_p99", slo_target: 99.0, period: "weekly", period_start: "2025-01-20", period_end: "2025-01-26", budget_total_minutes: 100.8, budget_consumed_minutes: 95.0, budget_remaining_pct: 5.8, status: "critical", burn_rate: 3.1, created_at: "2025-01-20T00:00:00Z" },
  { id: "eb-4", service_id: "svc-1", metric: "error_rate", slo_target: 99.5, period: "monthly", period_start: "2025-01-01", period_end: "2025-01-31", budget_total_minutes: 216.0, budget_consumed_minutes: 45.0, budget_remaining_pct: 79.2, status: "healthy", burn_rate: 0.3, created_at: "2025-01-01T00:00:00Z" },
  { id: "eb-5", service_id: "svc-4", metric: "availability", slo_target: 99.9, period: "quarterly", period_start: "2025-01-01", period_end: "2025-03-31", budget_total_minutes: 129.6, budget_consumed_minutes: 129.6, budget_remaining_pct: 0, status: "exhausted", burn_rate: 5.0, created_at: "2025-01-01T00:00:00Z" },
  { id: "eb-6", service_id: "svc-5", metric: "availability", slo_target: 99.99, period: "monthly", period_start: "2025-01-01", period_end: "2025-01-31", budget_total_minutes: 4.32, budget_consumed_minutes: 1.0, budget_remaining_pct: 76.9, status: "healthy", burn_rate: 0.2, created_at: "2025-01-01T00:00:00Z" },
];

const burnEvents: BurnEvent[] = [
  { id: "be-1", budget_id: "eb-1", minutes_consumed: 5.0, reason: "Auth service restart", timestamp: "2025-01-05T10:00:00Z" },
  { id: "be-2", budget_id: "eb-1", minutes_consumed: 7.5, reason: "Deploy rollback", timestamp: "2025-01-15T14:00:00Z" },
  { id: "be-3", budget_id: "eb-2", minutes_consumed: 10.0, reason: "DB failover", timestamp: "2025-01-10T08:00:00Z" },
  { id: "be-4", budget_id: "eb-2", minutes_consumed: 8.2, reason: "Network partition", timestamp: "2025-01-18T16:00:00Z" },
  { id: "be-5", budget_id: "eb-3", minutes_consumed: 45.0, reason: "Cache invalidation storm", timestamp: "2025-01-22T09:00:00Z" },
  { id: "be-6", budget_id: "eb-3", minutes_consumed: 50.0, reason: "Slow query regression", timestamp: "2025-01-24T11:00:00Z" },
  { id: "be-7", budget_id: "eb-5", minutes_consumed: 80.0, reason: "Major outage", timestamp: "2025-01-15T03:00:00Z" },
  { id: "be-8", budget_id: "eb-5", minutes_consumed: 49.6, reason: "Cascading failure", timestamp: "2025-02-02T07:00:00Z" },
  { id: "be-9", budget_id: "eb-6", minutes_consumed: 1.0, reason: "Brief hiccup", timestamp: "2025-01-20T12:00:00Z" },
];

export function listBudgets(service_id?: string, status?: BudgetStatus): ErrorBudget[] {
  let result = [...budgets];
  if (service_id) result = result.filter((b) => b.service_id === service_id);
  if (status) result = result.filter((b) => b.status === status);
  return result.sort((a, b) => a.budget_remaining_pct - b.budget_remaining_pct);
}

export function getBudget(id: string): ErrorBudget | null {
  return budgets.find((b) => b.id === id) || null;
}

export function createBudget(service_id: string, metric: string, slo_target: number, period: BudgetPeriod, period_start: string, period_end: string): ErrorBudget {
  const start = new Date(period_start).getTime();
  const end = new Date(period_end).getTime();
  const total_minutes_in_period = (end - start) / 60000;
  const budget_total_minutes = total_minutes_in_period * ((100 - slo_target) / 100);
  const eb: ErrorBudget = {
    id: `eb-${nextId++}`,
    service_id,
    metric,
    slo_target,
    period,
    period_start,
    period_end,
    budget_total_minutes: Math.round(budget_total_minutes * 100) / 100,
    budget_consumed_minutes: 0,
    budget_remaining_pct: 100,
    status: "healthy",
    burn_rate: 0,
    created_at: new Date().toISOString(),
  };
  budgets.push(eb);
  return eb;
}

export function recordBurn(budgetId: string, minutes: number, reason: string): BurnEvent | null {
  const budget = budgets.find((b) => b.id === budgetId);
  if (!budget) return null;
  const event: BurnEvent = { id: `be-${nextEventId++}`, budget_id: budgetId, minutes_consumed: minutes, reason, timestamp: new Date().toISOString() };
  burnEvents.push(event);
  budget.budget_consumed_minutes = Math.round((budget.budget_consumed_minutes + minutes) * 100) / 100;
  budget.budget_remaining_pct = Math.max(0, Math.round(((budget.budget_total_minutes - budget.budget_consumed_minutes) / budget.budget_total_minutes) * 1000) / 10);
  budget.status = calcStatus(budget.budget_remaining_pct);
  const events = burnEvents.filter((e) => e.budget_id === budgetId);
  budget.burn_rate = events.length > 1 ? Math.round((budget.budget_consumed_minutes / events.length) * 10) / 10 : budget.budget_consumed_minutes;
  return event;
}

export function budgetBurnEvents(budgetId: string): BurnEvent[] {
  return burnEvents.filter((e) => e.budget_id === budgetId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function deleteBudget(id: string): boolean {
  const idx = budgets.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  budgets.splice(idx, 1);
  return true;
}

export function budgetSummary() {
  const total = budgets.length;
  const by_status: Record<string, number> = {};
  budgets.forEach((b) => {
    by_status[b.status] = (by_status[b.status] || 0) + 1;
  });
  const avg_remaining = budgets.length ? Math.round(budgets.reduce((s, b) => s + b.budget_remaining_pct, 0) / budgets.length * 10) / 10 : 0;
  return { total, by_status, avg_remaining };
}
