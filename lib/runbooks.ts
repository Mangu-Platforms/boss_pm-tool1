export type RunbookSeverity = "sev-1" | "sev-2" | "sev-3" | "sev-4";
export type StepType = "manual" | "automated" | "decision" | "notification";

export type RunbookStep = {
  order: number;
  type: StepType;
  title: string;
  instructions: string;
  expected_duration_minutes: number;
};

export type Runbook = {
  id: string;
  title: string;
  description: string;
  service_id: string;
  severity: RunbookSeverity;
  steps: RunbookStep[];
  owner: string;
  last_used: string | null;
  times_used: number;
  created_at: string;
  updated_at: string;
};

const runbooks: Runbook[] = [
  { id: "rb-1", title: "API Gateway Restart", description: "Steps to safely restart the API gateway", service_id: "svc-1", severity: "sev-2", steps: [{ order: 1, type: "notification", title: "Notify on-call", instructions: "Post in #incidents channel", expected_duration_minutes: 2 }, { order: 2, type: "manual", title: "Drain connections", instructions: "Run: kubectl drain api-gateway", expected_duration_minutes: 5 }, { order: 3, type: "automated", title: "Rolling restart", instructions: "Trigger deploy pipeline", expected_duration_minutes: 10 }, { order: 4, type: "manual", title: "Verify health", instructions: "Check /health endpoint returns 200", expected_duration_minutes: 3 }], owner: "max", last_used: "2025-08-10", times_used: 12, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-08-10T00:00:00Z" },
  { id: "rb-2", title: "Database Failover", description: "Promote read replica to primary", service_id: "svc-1", severity: "sev-1", steps: [{ order: 1, type: "notification", title: "Page engineering lead", instructions: "Escalate to VP Engineering", expected_duration_minutes: 1 }, { order: 2, type: "decision", title: "Assess data loss risk", instructions: "Check replication lag", expected_duration_minutes: 5 }, { order: 3, type: "automated", title: "Promote replica", instructions: "Run failover script", expected_duration_minutes: 3 }], owner: "sami", last_used: "2025-07-15", times_used: 3, created_at: "2025-02-01T00:00:00Z", updated_at: "2025-07-15T00:00:00Z" },
  { id: "rb-3", title: "Clear Notification Queue", description: "Flush stuck notification queue", service_id: "svc-3", severity: "sev-3", steps: [{ order: 1, type: "manual", title: "Check queue depth", instructions: "Query Redis queue length", expected_duration_minutes: 2 }, { order: 2, type: "automated", title: "Flush dead letters", instructions: "Run queue cleanup job", expected_duration_minutes: 5 }], owner: "priya", last_used: "2025-08-25", times_used: 8, created_at: "2025-04-01T00:00:00Z", updated_at: "2025-08-25T00:00:00Z" },
];

let nextId = 4;

export function listRunbooks(serviceId?: string): Runbook[] {
  let result = [...runbooks];
  if (serviceId) result = result.filter((r) => r.service_id === serviceId);
  return result.sort((a, b) => a.title.localeCompare(b.title));
}

export function getRunbook(id: string): Runbook | null {
  return runbooks.find((r) => r.id === id) || null;
}

export function createRunbook(title: string, description: string, serviceId: string, severity: RunbookSeverity, owner: string, steps: RunbookStep[]): Runbook {
  const now = new Date().toISOString();
  const rb: Runbook = { id: `rb-${nextId++}`, title, description, service_id: serviceId, severity, steps, owner, last_used: null, times_used: 0, created_at: now, updated_at: now };
  runbooks.push(rb);
  return rb;
}

export function executeRunbook(id: string): Runbook | null {
  const rb = runbooks.find((r) => r.id === id);
  if (!rb) return null;
  rb.times_used++;
  rb.last_used = new Date().toISOString().slice(0, 10);
  rb.updated_at = new Date().toISOString();
  return rb;
}

export function deleteRunbook(id: string): boolean {
  const idx = runbooks.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  runbooks.splice(idx, 1);
  return true;
}

export function totalEstimatedTime(id: string): number {
  const rb = runbooks.find((r) => r.id === id);
  if (!rb) return 0;
  return rb.steps.reduce((sum, s) => sum + s.expected_duration_minutes, 0);
}
