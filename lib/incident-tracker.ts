export type IncidentSeverity = "sev-1" | "sev-2" | "sev-3" | "sev-4";
export type IncidentStatus = "detected" | "investigating" | "mitigating" | "resolved" | "postmortem";

export type IncidentUpdate = {
  timestamp: string;
  message: string;
  author: string;
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service_ids: string[];
  commander: string;
  updates: IncidentUpdate[];
  started_at: string;
  resolved_at: string | null;
  created_at: string;
};

const incidents: Incident[] = [
  { id: "inc-1", title: "API latency spike", description: "P95 latency exceeded 2s for 15 minutes", severity: "sev-2", status: "resolved", service_ids: ["svc-1"], commander: "max", updates: [{ timestamp: "2025-08-10T14:00:00Z", message: "Detected via monitoring", author: "system" }, { timestamp: "2025-08-10T14:15:00Z", message: "Root cause: connection pool exhaustion", author: "max" }, { timestamp: "2025-08-10T14:30:00Z", message: "Resolved by increasing pool size", author: "max" }], started_at: "2025-08-10T14:00:00Z", resolved_at: "2025-08-10T14:30:00Z", created_at: "2025-08-10T14:00:00Z" },
  { id: "inc-2", title: "Notification delivery delays", description: "Push notifications delayed by 30+ minutes", severity: "sev-3", status: "investigating", service_ids: ["svc-3"], commander: "priya", updates: [{ timestamp: "2025-08-25T09:00:00Z", message: "Users reporting delayed notifications", author: "priya" }], started_at: "2025-08-25T09:00:00Z", resolved_at: null, created_at: "2025-08-25T09:00:00Z" },
  { id: "inc-3", title: "Auth service outage", description: "Complete auth failure for 5 minutes", severity: "sev-1", status: "postmortem", service_ids: ["svc-2", "svc-1"], commander: "sami", updates: [{ timestamp: "2025-07-15T03:00:00Z", message: "All auth requests failing", author: "system" }, { timestamp: "2025-07-15T03:02:00Z", message: "Certificate expired", author: "sami" }, { timestamp: "2025-07-15T03:05:00Z", message: "Cert renewed, service restored", author: "sami" }], started_at: "2025-07-15T03:00:00Z", resolved_at: "2025-07-15T03:05:00Z", created_at: "2025-07-15T03:00:00Z" },
];

let nextId = 4;

export function listIncidents(status?: IncidentStatus): Incident[] {
  let result = [...incidents];
  if (status) result = result.filter((i) => i.status === status);
  return result.sort((a, b) => b.started_at.localeCompare(a.started_at));
}

export function getIncident(id: string): Incident | null {
  return incidents.find((i) => i.id === id) || null;
}

export function createIncident(title: string, description: string, severity: IncidentSeverity, serviceIds: string[], commander: string): Incident {
  const now = new Date().toISOString();
  const inc: Incident = {
    id: `inc-${nextId++}`,
    title,
    description,
    severity,
    status: "detected",
    service_ids: serviceIds,
    commander,
    updates: [{ timestamp: now, message: "Incident created", author: commander }],
    started_at: now,
    resolved_at: null,
    created_at: now,
  };
  incidents.push(inc);
  return inc;
}

export function updateIncidentStatus(id: string, status: IncidentStatus): Incident | null {
  const inc = incidents.find((i) => i.id === id);
  if (!inc) return null;
  inc.status = status;
  if (status === "resolved") inc.resolved_at = new Date().toISOString();
  return inc;
}

export function addIncidentUpdate(id: string, message: string, author: string): Incident | null {
  const inc = incidents.find((i) => i.id === id);
  if (!inc) return null;
  inc.updates.push({ timestamp: new Date().toISOString(), message, author });
  return inc;
}

export function incidentMetrics(): { total: number; open: number; mttr_minutes: number; by_severity: Record<string, number> } {
  const open = incidents.filter((i) => i.status !== "resolved" && i.status !== "postmortem").length;
  const resolved = incidents.filter((i) => i.resolved_at);
  const mttr = resolved.length > 0
    ? Math.round(resolved.reduce((sum, i) => sum + (new Date(i.resolved_at!).getTime() - new Date(i.started_at).getTime()) / 60000, 0) / resolved.length)
    : 0;
  const bySeverity: Record<string, number> = {};
  for (const inc of incidents) {
    bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
  }
  return { total: incidents.length, open, mttr_minutes: mttr, by_severity: bySeverity };
}
