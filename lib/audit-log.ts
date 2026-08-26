export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "export"
  | "import"
  | "webhook_sent"
  | "automation_triggered";

export type AuditEntry = {
  id: string;
  actor: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string | null;
  created_at: string;
};

const store: AuditEntry[] = [
  { id: "audit-1", actor: "Max", action: "create", resource_type: "project", resource_id: "boss-pm", details: "Created product Boss PM", ip_address: null, created_at: "2025-01-05T10:00:00.000Z" },
  { id: "audit-2", actor: "Alice", action: "create", resource_type: "issue", resource_id: "BOSS-1", details: "Created issue: Build MVP dashboard", ip_address: null, created_at: "2025-01-06T11:00:00.000Z" },
  { id: "audit-3", actor: "Max", action: "create", resource_type: "member", resource_id: "Bob", details: "Added Bob to the workspace", ip_address: null, created_at: "2025-01-07T09:00:00.000Z" },
  { id: "audit-4", actor: "Max", action: "create", resource_type: "sprint", resource_id: "sprint-1", details: "Created Sprint 1", ip_address: null, created_at: "2025-01-14T08:00:00.000Z" },
  { id: "audit-5", actor: "Max", action: "update", resource_type: "decision", resource_id: "adr-001", details: "Accepted ADR-001: Use Next.js", ip_address: null, created_at: "2025-01-07T14:00:00.000Z" },
  { id: "audit-6", actor: "Alice", action: "create", resource_type: "risk", resource_id: "risk-security", details: "Registered risk: Data breach", ip_address: null, created_at: "2025-01-12T10:00:00.000Z" },
];

export function logAudit(
  actor: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  details: string,
  ipAddress?: string
): AuditEntry {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    actor,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: ipAddress || null,
    created_at: new Date().toISOString(),
  };
  store.push(entry);
  return entry;
}

export function listAuditLog(options?: {
  actor?: string;
  action?: AuditAction;
  resource_type?: string;
  limit?: number;
}): AuditEntry[] {
  let results = [...store];
  if (options?.actor) results = results.filter((e) => e.actor === options.actor);
  if (options?.action) results = results.filter((e) => e.action === options.action);
  if (options?.resource_type) results = results.filter((e) => e.resource_type === options.resource_type);
  results.sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (options?.limit) results = results.slice(0, options.limit);
  return results;
}

export function auditCount(): number {
  return store.length;
}
