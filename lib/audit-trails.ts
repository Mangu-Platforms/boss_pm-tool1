export type AuditAction = "create" | "update" | "delete" | "login" | "logout" | "permission_change" | "export" | "api_access";
export type AuditResource = "issue" | "project" | "user" | "sprint" | "deployment" | "setting" | "api_key" | "role";

export type AuditEntry = {
  id: string;
  actor: string;
  action: AuditAction;
  resource_type: AuditResource;
  resource_id: string;
  details: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
};

let nextId = 16;

const entries: AuditEntry[] = [
  { id: "at-1", actor: "max", action: "create", resource_type: "project", resource_id: "proj-1", details: "Created project Boss PM", ip_address: "192.168.1.100", user_agent: "Chrome/120", timestamp: "2025-01-25T10:00:00Z" },
  { id: "at-2", actor: "sami", action: "update", resource_type: "issue", resource_id: "ISS-42", details: "Changed status to doing", ip_address: "10.0.0.55", user_agent: "Firefox/121", timestamp: "2025-01-25T09:30:00Z" },
  { id: "at-3", actor: "alex", action: "delete", resource_type: "sprint", resource_id: "sp-3", details: "Deleted empty sprint", ip_address: "172.16.0.10", user_agent: "Safari/17", timestamp: "2025-01-25T09:00:00Z" },
  { id: "at-4", actor: "max", action: "login", resource_type: "user", resource_id: "user-1", details: "SSO login via Google", ip_address: "192.168.1.100", user_agent: "Chrome/120", timestamp: "2025-01-25T08:00:00Z" },
  { id: "at-5", actor: "pat", action: "permission_change", resource_type: "role", resource_id: "role-2", details: "Granted admin to sami", ip_address: "10.0.0.80", user_agent: "Chrome/120", timestamp: "2025-01-24T16:00:00Z" },
  { id: "at-6", actor: "sami", action: "export", resource_type: "issue", resource_id: "all", details: "Exported 150 issues to CSV", ip_address: "10.0.0.55", user_agent: "Firefox/121", timestamp: "2025-01-24T15:00:00Z" },
  { id: "at-7", actor: "system", action: "api_access", resource_type: "api_key", resource_id: "key-1", details: "API key used: 342 requests", ip_address: "54.23.111.200", user_agent: "curl/8.4", timestamp: "2025-01-24T14:00:00Z" },
  { id: "at-8", actor: "max", action: "create", resource_type: "deployment", resource_id: "dep-5", details: "Deployed v2.3.0 to production", ip_address: "192.168.1.100", user_agent: "Chrome/120", timestamp: "2025-01-24T12:00:00Z" },
  { id: "at-9", actor: "alex", action: "update", resource_type: "setting", resource_id: "org-settings", details: "Changed 2FA requirement to mandatory", ip_address: "172.16.0.10", user_agent: "Safari/17", timestamp: "2025-01-24T11:00:00Z" },
  { id: "at-10", actor: "sami", action: "create", resource_type: "issue", resource_id: "ISS-99", details: "Created critical bug report", ip_address: "10.0.0.55", user_agent: "Firefox/121", timestamp: "2025-01-24T10:00:00Z" },
  { id: "at-11", actor: "max", action: "delete", resource_type: "api_key", resource_id: "key-2", details: "Revoked compromised API key", ip_address: "192.168.1.100", user_agent: "Chrome/120", timestamp: "2025-01-23T18:00:00Z" },
  { id: "at-12", actor: "pat", action: "update", resource_type: "project", resource_id: "proj-2", details: "Updated project description", ip_address: "10.0.0.80", user_agent: "Chrome/120", timestamp: "2025-01-23T16:00:00Z" },
  { id: "at-13", actor: "alex", action: "logout", resource_type: "user", resource_id: "user-3", details: "Manual logout", ip_address: "172.16.0.10", user_agent: "Safari/17", timestamp: "2025-01-23T17:30:00Z" },
  { id: "at-14", actor: "system", action: "create", resource_type: "deployment", resource_id: "dep-6", details: "Auto-deploy from CI", ip_address: "54.23.111.200", user_agent: "GitHub-Hookshot", timestamp: "2025-01-23T15:00:00Z" },
  { id: "at-15", actor: "sami", action: "permission_change", resource_type: "role", resource_id: "role-1", details: "Removed viewer access for temp-user", ip_address: "10.0.0.55", user_agent: "Firefox/121", timestamp: "2025-01-23T14:00:00Z" },
];

export function listAuditEntries(actor?: string, action?: AuditAction, resource_type?: AuditResource, limit?: number): AuditEntry[] {
  let result = [...entries];
  if (actor) result = result.filter((e) => e.actor === actor);
  if (action) result = result.filter((e) => e.action === action);
  if (resource_type) result = result.filter((e) => e.resource_type === resource_type);
  result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (limit) result = result.slice(0, limit);
  return result;
}

export function getAuditEntry(id: string): AuditEntry | null {
  return entries.find((e) => e.id === id) || null;
}

export function createAuditEntry(actor: string, action: AuditAction, resource_type: AuditResource, resource_id: string, details: string, ip_address?: string, user_agent?: string): AuditEntry {
  const e: AuditEntry = {
    id: `at-${nextId++}`,
    actor,
    action,
    resource_type,
    resource_id,
    details,
    ip_address: ip_address || "unknown",
    user_agent: user_agent || "unknown",
    timestamp: new Date().toISOString(),
  };
  entries.push(e);
  return e;
}

export function auditStats() {
  const total = entries.length;
  const by_action: Record<string, number> = {};
  const by_actor: Record<string, number> = {};
  const by_resource: Record<string, number> = {};
  entries.forEach((e) => {
    by_action[e.action] = (by_action[e.action] || 0) + 1;
    by_actor[e.actor] = (by_actor[e.actor] || 0) + 1;
    by_resource[e.resource_type] = (by_resource[e.resource_type] || 0) + 1;
  });
  return { total, by_action, by_actor, by_resource };
}
