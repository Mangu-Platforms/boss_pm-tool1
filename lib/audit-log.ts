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

const store: AuditEntry[] = [];

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
