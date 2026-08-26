export type PostMortemStatus = "draft" | "in_review" | "published" | "archived";
export type PostMortemSeverity = "minor" | "major" | "critical";

export type ActionItem = {
  id: string;
  description: string;
  owner: string;
  status: "open" | "in_progress" | "done";
  due_date: string | null;
};

export type PostMortem = {
  id: string;
  incident_id: string | null;
  title: string;
  summary: string;
  severity: PostMortemSeverity;
  status: PostMortemStatus;
  timeline: string;
  root_cause: string;
  contributing_factors: string[];
  action_items: ActionItem[];
  lessons_learned: string[];
  author: string;
  reviewers: string[];
  created_at: string;
  published_at: string | null;
};

let nextId = 6;
let nextActionId = 20;

const postMortems: PostMortem[] = [
  { id: "pm-1", incident_id: "inc-1", title: "Auth service outage", summary: "Complete auth failure for 45 minutes", severity: "critical", status: "published", timeline: "10:00 Alert fired → 10:15 On-call paged → 10:45 Root cause found → 11:00 Deployed fix", root_cause: "Certificate expiry not monitored", contributing_factors: ["No cert rotation automation", "Alert gap"], action_items: [{ id: "ai-1", description: "Automate cert rotation", owner: "sami", status: "done", due_date: "2025-02-01" }, { id: "ai-2", description: "Add cert expiry alerts", owner: "alex", status: "in_progress", due_date: "2025-02-15" }], lessons_learned: ["Need automated certificate management", "Runbook was outdated"], author: "max", reviewers: ["sami", "alex"], created_at: "2025-01-20T12:00:00Z", published_at: "2025-01-22T09:00:00Z" },
  { id: "pm-2", incident_id: "inc-2", title: "Database connection pool exhaustion", summary: "Connection pool saturated causing cascading failures", severity: "major", status: "in_review", timeline: "14:00 Slow queries detected → 14:30 Pool exhaustion → 15:00 Manual pool reset → 15:15 Recovered", root_cause: "Connection leak in batch processor", contributing_factors: ["No connection timeout", "Missing pool metrics"], action_items: [{ id: "ai-3", description: "Fix connection leak", owner: "max", status: "done", due_date: "2025-01-25" }, { id: "ai-4", description: "Add pool size monitoring", owner: "pat", status: "open", due_date: "2025-02-10" }], lessons_learned: ["Always set connection timeouts", "Monitor pool utilization"], author: "sami", reviewers: ["max"], created_at: "2025-01-18T16:00:00Z", published_at: null },
  { id: "pm-3", incident_id: null, title: "Deployment rollback procedure review", summary: "Near-miss during production deploy revealed rollback gaps", severity: "minor", status: "draft", timeline: "09:00 Deploy started → 09:10 Error rate spike → 09:12 Rollback initiated → 09:20 Rollback complete", root_cause: "Rollback script did not handle DB migrations", contributing_factors: ["No rollback testing", "Missing pre-deploy checklist"], action_items: [{ id: "ai-5", description: "Add rollback to deploy pipeline", owner: "alex", status: "open", due_date: "2025-03-01" }], lessons_learned: ["Test rollbacks as part of deploy process"], author: "alex", reviewers: [], created_at: "2025-01-15T10:00:00Z", published_at: null },
  { id: "pm-4", incident_id: "inc-3", title: "CDN cache poisoning", summary: "Stale content served for 2 hours due to cache config error", severity: "major", status: "published", timeline: "08:00 User reports → 08:30 Confirmed stale content → 09:00 Cache purged → 10:00 Config fixed", root_cause: "Cache-Control header misconfigured during deploy", contributing_factors: ["No cache validation in CI", "Manual header configuration"], action_items: [{ id: "ai-6", description: "Automate cache header validation", owner: "max", status: "open", due_date: "2025-02-20" }, { id: "ai-7", description: "Add cache purge to deploy pipeline", owner: "sami", status: "done", due_date: "2025-02-01" }], lessons_learned: ["Cache configs need automated validation", "Include cache purge in deploy steps"], author: "pat", reviewers: ["max", "sami"], created_at: "2025-01-12T11:00:00Z", published_at: "2025-01-14T14:00:00Z" },
  { id: "pm-5", incident_id: null, title: "API rate limiting failure", summary: "Rate limiter bypass allowed excessive traffic", severity: "critical", status: "in_review", timeline: "16:00 Traffic spike → 16:05 Rate limiter bypassed → 16:20 Manual block applied → 16:30 Fix deployed", root_cause: "Rate limiter checked wrong header for client identification", contributing_factors: ["No rate limit testing under load", "Proxy header trust misconfigured"], action_items: [{ id: "ai-8", description: "Fix header inspection logic", owner: "sami", status: "done", due_date: "2025-01-20" }, { id: "ai-9", description: "Add rate limit load tests", owner: "pat", status: "open", due_date: "2025-02-28" }], lessons_learned: ["Rate limiters need load testing", "Document proxy trust chain"], author: "max", reviewers: ["alex", "pat"], created_at: "2025-01-10T17:00:00Z", published_at: null },
];

export function listPostMortems(status?: PostMortemStatus, severity?: PostMortemSeverity): PostMortem[] {
  let result = [...postMortems];
  if (status) result = result.filter((p) => p.status === status);
  if (severity) result = result.filter((p) => p.severity === severity);
  return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getPostMortem(id: string): PostMortem | null {
  return postMortems.find((p) => p.id === id) || null;
}

export function createPostMortem(title: string, summary: string, severity: PostMortemSeverity, root_cause: string, timeline: string, author: string, incident_id?: string): PostMortem {
  const pm: PostMortem = {
    id: `pm-${nextId++}`,
    incident_id: incident_id || null,
    title,
    summary,
    severity,
    status: "draft",
    timeline,
    root_cause,
    contributing_factors: [],
    action_items: [],
    lessons_learned: [],
    author,
    reviewers: [],
    created_at: new Date().toISOString(),
    published_at: null,
  };
  postMortems.push(pm);
  return pm;
}

export function updatePostMortem(id: string, updates: Partial<Pick<PostMortem, "title" | "summary" | "severity" | "status" | "timeline" | "root_cause" | "contributing_factors" | "lessons_learned" | "reviewers">>): PostMortem | null {
  const pm = postMortems.find((p) => p.id === id);
  if (!pm) return null;
  Object.assign(pm, updates);
  if (updates.status === "published" && !pm.published_at) {
    pm.published_at = new Date().toISOString();
  }
  return pm;
}

export function addActionItem(pmId: string, description: string, owner: string, due_date?: string): ActionItem | null {
  const pm = postMortems.find((p) => p.id === pmId);
  if (!pm) return null;
  const item: ActionItem = { id: `ai-${nextActionId++}`, description, owner, status: "open", due_date: due_date || null };
  pm.action_items.push(item);
  return item;
}

export function updateActionItem(pmId: string, actionId: string, updates: Partial<Pick<ActionItem, "status" | "description" | "owner" | "due_date">>): ActionItem | null {
  const pm = postMortems.find((p) => p.id === pmId);
  if (!pm) return null;
  const item = pm.action_items.find((a) => a.id === actionId);
  if (!item) return null;
  Object.assign(item, updates);
  return item;
}

export function deletePostMortem(id: string): boolean {
  const idx = postMortems.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  postMortems.splice(idx, 1);
  return true;
}

export function postMortemStats() {
  const total = postMortems.length;
  const open_actions = postMortems.reduce((sum, pm) => sum + pm.action_items.filter((a) => a.status !== "done").length, 0);
  const published = postMortems.filter((p) => p.status === "published").length;
  const by_severity: Record<string, number> = {};
  postMortems.forEach((p) => {
    by_severity[p.severity] = (by_severity[p.severity] || 0) + 1;
  });
  return { total, published, open_actions, by_severity };
}
