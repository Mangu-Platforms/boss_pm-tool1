export type DebtCategory = "code_quality" | "architecture" | "testing" | "documentation" | "infrastructure" | "security";
export type DebtPriority = "low" | "medium" | "high" | "critical";
export type DebtStatus = "identified" | "accepted" | "planned" | "in_progress" | "resolved";

export type TechDebt = {
  id: string;
  title: string;
  description: string;
  category: DebtCategory;
  priority: DebtPriority;
  status: DebtStatus;
  effort_days: number;
  impact_score: number;
  service_id: string;
  owner: string | null;
  created_at: string;
  resolved_at: string | null;
  related_issues: string[];
};

let nextId = 9;

const items: TechDebt[] = [
  { id: "td-1", title: "Monolith decomposition", description: "Core API is a monolith that should be split into microservices", category: "architecture", priority: "high", status: "planned", effort_days: 30, impact_score: 9, service_id: "svc-1", owner: "max", created_at: "2024-12-01T00:00:00Z", resolved_at: null, related_issues: ["ISS-10", "ISS-22"] },
  { id: "td-2", title: "Legacy auth module", description: "Auth uses deprecated OAuth library with known CVEs", category: "security", priority: "critical", status: "in_progress", effort_days: 5, impact_score: 10, service_id: "svc-1", owner: "sami", created_at: "2024-11-15T00:00:00Z", resolved_at: null, related_issues: ["ISS-44"] },
  { id: "td-3", title: "Missing integration tests", description: "API endpoints lack integration test coverage", category: "testing", priority: "medium", status: "accepted", effort_days: 10, impact_score: 7, service_id: "svc-2", owner: null, created_at: "2024-12-10T00:00:00Z", resolved_at: null, related_issues: [] },
  { id: "td-4", title: "Deprecated Node.js version", description: "Running Node 16 which is EOL", category: "infrastructure", priority: "high", status: "planned", effort_days: 3, impact_score: 8, service_id: "svc-3", owner: "alex", created_at: "2024-11-01T00:00:00Z", resolved_at: null, related_issues: [] },
  { id: "td-5", title: "Inconsistent error handling", description: "No standardized error response format across APIs", category: "code_quality", priority: "medium", status: "identified", effort_days: 7, impact_score: 6, service_id: "svc-1", owner: null, created_at: "2025-01-05T00:00:00Z", resolved_at: null, related_issues: [] },
  { id: "td-6", title: "Stale API documentation", description: "API docs are 6 months behind current implementation", category: "documentation", priority: "low", status: "identified", effort_days: 4, impact_score: 4, service_id: "svc-2", owner: null, created_at: "2025-01-10T00:00:00Z", resolved_at: null, related_issues: [] },
  { id: "td-7", title: "Database query optimization", description: "Several N+1 queries in report generation", category: "code_quality", priority: "high", status: "accepted", effort_days: 5, impact_score: 8, service_id: "svc-1", owner: "pat", created_at: "2024-12-20T00:00:00Z", resolved_at: null, related_issues: ["ISS-55"] },
  { id: "td-8", title: "CI pipeline speed", description: "Build takes 25 min, should be under 10", category: "infrastructure", priority: "medium", status: "resolved", effort_days: 3, impact_score: 5, service_id: "svc-1", owner: "max", created_at: "2024-10-01T00:00:00Z", resolved_at: "2024-12-15T00:00:00Z", related_issues: [] },
];

export function listTechDebt(category?: DebtCategory, status?: DebtStatus, priority?: DebtPriority): TechDebt[] {
  let result = [...items];
  if (category) result = result.filter((d) => d.category === category);
  if (status) result = result.filter((d) => d.status === status);
  if (priority) result = result.filter((d) => d.priority === priority);
  return result.sort((a, b) => b.impact_score - a.impact_score);
}

export function getTechDebt(id: string): TechDebt | null {
  return items.find((d) => d.id === id) || null;
}

export function createTechDebt(title: string, description: string, category: DebtCategory, priority: DebtPriority, effort_days: number, impact_score: number, service_id: string, owner?: string): TechDebt {
  const d: TechDebt = {
    id: `td-${nextId++}`,
    title,
    description,
    category,
    priority,
    status: "identified",
    effort_days,
    impact_score,
    service_id,
    owner: owner || null,
    created_at: new Date().toISOString(),
    resolved_at: null,
    related_issues: [],
  };
  items.push(d);
  return d;
}

export function updateTechDebt(id: string, updates: Partial<Pick<TechDebt, "title" | "description" | "category" | "priority" | "status" | "effort_days" | "impact_score" | "owner" | "related_issues">>): TechDebt | null {
  const d = items.find((i) => i.id === id);
  if (!d) return null;
  Object.assign(d, updates);
  if (updates.status === "resolved" && !d.resolved_at) {
    d.resolved_at = new Date().toISOString();
  }
  return d;
}

export function deleteTechDebt(id: string): boolean {
  const idx = items.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  return true;
}

export function techDebtStats() {
  const total = items.length;
  const unresolved = items.filter((d) => d.status !== "resolved").length;
  const total_effort_days = items.filter((d) => d.status !== "resolved").reduce((s, d) => s + d.effort_days, 0);
  const by_category: Record<string, number> = {};
  const by_priority: Record<string, number> = {};
  items.filter((d) => d.status !== "resolved").forEach((d) => {
    by_category[d.category] = (by_category[d.category] || 0) + 1;
    by_priority[d.priority] = (by_priority[d.priority] || 0) + 1;
  });
  const avg_impact = unresolved ? Math.round(items.filter((d) => d.status !== "resolved").reduce((s, d) => s + d.impact_score, 0) / unresolved * 10) / 10 : 0;
  return { total, unresolved, total_effort_days, by_category, by_priority, avg_impact };
}
