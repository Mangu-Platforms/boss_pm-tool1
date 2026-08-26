export type WorkstreamStatus = "active" | "paused" | "completed" | "archived";
export type WorkstreamPriority = "critical" | "high" | "medium" | "low";

export type Workstream = {
  id: string;
  name: string;
  description: string;
  status: WorkstreamStatus;
  priority: WorkstreamPriority;
  owner: string;
  product_id: string;
  issue_ids: string[];
  progress: number;
  start_date: string;
  target_date: string | null;
  created_at: string;
};

const workstreams: Workstream[] = [
  { id: "ws-1", name: "Auth Overhaul", description: "Migrate to OAuth2 + PKCE", status: "active", priority: "critical", owner: "max", product_id: "boss-pm", issue_ids: ["iss-1", "iss-2"], progress: 45, start_date: "2025-07-01", target_date: "2025-09-15", created_at: "2025-07-01T00:00:00Z" },
  { id: "ws-2", name: "Performance Sprint", description: "Sub-200ms p95 latency", status: "active", priority: "high", owner: "sami", product_id: "boss-pm", issue_ids: ["iss-3"], progress: 70, start_date: "2025-08-01", target_date: "2025-08-31", created_at: "2025-08-01T00:00:00Z" },
  { id: "ws-3", name: "Mobile Responsive", description: "Full mobile support for all pages", status: "paused", priority: "medium", owner: "priya", product_id: "boss-pm", issue_ids: [], progress: 20, start_date: "2025-06-15", target_date: "2025-10-01", created_at: "2025-06-15T00:00:00Z" },
  { id: "ws-4", name: "Data Export", description: "CSV and PDF export for all views", status: "completed", priority: "low", owner: "carlos", product_id: "boss-pm", issue_ids: [], progress: 100, start_date: "2025-05-01", target_date: "2025-07-15", created_at: "2025-05-01T00:00:00Z" },
  { id: "ws-5", name: "AI Integration", description: "Agent-powered issue triage", status: "active", priority: "high", owner: "max", product_id: "boss-pm", issue_ids: ["iss-4", "iss-5"], progress: 30, start_date: "2025-08-10", target_date: "2025-11-01", created_at: "2025-08-10T00:00:00Z" },
];

let nextId = 6;

export function listWorkstreams(status?: WorkstreamStatus): Workstream[] {
  let result = [...workstreams];
  if (status) result = result.filter((w) => w.status === status);
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function getWorkstream(id: string): Workstream | null {
  return workstreams.find((w) => w.id === id) || null;
}

export function createWorkstream(name: string, description: string, priority: WorkstreamPriority, owner: string, productId: string, startDate: string, targetDate?: string): Workstream {
  const ws: Workstream = {
    id: `ws-${nextId++}`,
    name,
    description,
    status: "active",
    priority,
    owner,
    product_id: productId,
    issue_ids: [],
    progress: 0,
    start_date: startDate,
    target_date: targetDate || null,
    created_at: new Date().toISOString(),
  };
  workstreams.push(ws);
  return ws;
}

export function updateWorkstream(id: string, updates: Partial<Pick<Workstream, "name" | "description" | "status" | "priority" | "progress" | "target_date">>): Workstream | null {
  const ws = workstreams.find((w) => w.id === id);
  if (!ws) return null;
  Object.assign(ws, updates);
  return ws;
}

export function addIssueToWorkstream(wsId: string, issueId: string): Workstream | null {
  const ws = workstreams.find((w) => w.id === wsId);
  if (!ws) return null;
  if (!ws.issue_ids.includes(issueId)) ws.issue_ids.push(issueId);
  return ws;
}

export function removeIssueFromWorkstream(wsId: string, issueId: string): Workstream | null {
  const ws = workstreams.find((w) => w.id === wsId);
  if (!ws) return null;
  ws.issue_ids = ws.issue_ids.filter((id) => id !== issueId);
  return ws;
}

export function deleteWorkstream(id: string): boolean {
  const idx = workstreams.findIndex((w) => w.id === id);
  if (idx < 0) return false;
  workstreams.splice(idx, 1);
  return true;
}

export function workstreamStats(): { total: number; active: number; completed: number; avg_progress: number } {
  const active = workstreams.filter((w) => w.status === "active").length;
  const completed = workstreams.filter((w) => w.status === "completed").length;
  const avgProgress = workstreams.length > 0 ? Math.round(workstreams.reduce((s, w) => s + w.progress, 0) / workstreams.length) : 0;
  return { total: workstreams.length, active, completed, avg_progress: avgProgress };
}
