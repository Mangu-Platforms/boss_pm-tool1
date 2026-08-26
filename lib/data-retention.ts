export type RetentionCategory = "audit_logs" | "user_data" | "analytics" | "backups" | "temp_files" | "archived_projects" | "session_data";
export type RetentionStatus = "active" | "review_needed" | "expiring_soon" | "expired";

export type RetentionPolicy = {
  id: string;
  name: string;
  category: RetentionCategory;
  retention_days: number;
  status: RetentionStatus;
  auto_delete: boolean;
  description: string;
  last_cleanup: string | null;
  next_cleanup: string;
  records_affected: number;
  storage_bytes: number;
  created_at: string;
};

let nextId = 9;

const policies: RetentionPolicy[] = [
  { id: "rp-1", name: "Audit Log Retention", category: "audit_logs", retention_days: 365, status: "active", auto_delete: false, description: "Keep audit logs for 1 year per compliance", last_cleanup: "2025-01-01T00:00:00Z", next_cleanup: "2025-04-01T00:00:00Z", records_affected: 15000, storage_bytes: 52428800, created_at: "2024-01-01T00:00:00Z" },
  { id: "rp-2", name: "User Session Cleanup", category: "session_data", retention_days: 30, status: "active", auto_delete: true, description: "Auto-delete expired sessions after 30 days", last_cleanup: "2025-01-20T00:00:00Z", next_cleanup: "2025-02-20T00:00:00Z", records_affected: 8500, storage_bytes: 10485760, created_at: "2024-06-01T00:00:00Z" },
  { id: "rp-3", name: "Analytics Data", category: "analytics", retention_days: 90, status: "active", auto_delete: true, description: "Aggregate after 90 days, delete raw events", last_cleanup: "2025-01-15T00:00:00Z", next_cleanup: "2025-02-15T00:00:00Z", records_affected: 2500000, storage_bytes: 1073741824, created_at: "2024-03-01T00:00:00Z" },
  { id: "rp-4", name: "Database Backups", category: "backups", retention_days: 180, status: "active", auto_delete: false, description: "Keep daily backups for 6 months", last_cleanup: "2025-01-01T00:00:00Z", next_cleanup: "2025-07-01T00:00:00Z", records_affected: 180, storage_bytes: 10737418240, created_at: "2024-01-01T00:00:00Z" },
  { id: "rp-5", name: "Temp Upload Cleanup", category: "temp_files", retention_days: 7, status: "active", auto_delete: true, description: "Delete orphaned uploads after 7 days", last_cleanup: "2025-01-24T00:00:00Z", next_cleanup: "2025-01-31T00:00:00Z", records_affected: 342, storage_bytes: 209715200, created_at: "2024-09-01T00:00:00Z" },
  { id: "rp-6", name: "Archived Projects", category: "archived_projects", retention_days: 730, status: "review_needed", auto_delete: false, description: "Keep archived projects for 2 years", last_cleanup: null, next_cleanup: "2025-03-01T00:00:00Z", records_affected: 12, storage_bytes: 524288000, created_at: "2024-01-01T00:00:00Z" },
  { id: "rp-7", name: "GDPR User Data", category: "user_data", retention_days: 90, status: "expiring_soon", auto_delete: false, description: "Deleted user data must be purged within 90 days", last_cleanup: "2024-12-01T00:00:00Z", next_cleanup: "2025-02-01T00:00:00Z", records_affected: 45, storage_bytes: 15728640, created_at: "2024-06-01T00:00:00Z" },
  { id: "rp-8", name: "Old Analytics Events", category: "analytics", retention_days: 30, status: "expired", auto_delete: true, description: "Legacy event format cleanup", last_cleanup: "2024-10-01T00:00:00Z", next_cleanup: "2024-11-01T00:00:00Z", records_affected: 0, storage_bytes: 0, created_at: "2024-01-01T00:00:00Z" },
];

export function listPolicies(category?: RetentionCategory, status?: RetentionStatus): RetentionPolicy[] {
  let result = [...policies];
  if (category) result = result.filter((p) => p.category === category);
  if (status) result = result.filter((p) => p.status === status);
  return result.sort((a, b) => a.next_cleanup.localeCompare(b.next_cleanup));
}

export function getPolicy(id: string): RetentionPolicy | null {
  return policies.find((p) => p.id === id) || null;
}

export function createPolicy(name: string, category: RetentionCategory, retention_days: number, auto_delete: boolean, description: string): RetentionPolicy {
  const now = new Date();
  const next = new Date(now.getTime() + retention_days * 86400000);
  const p: RetentionPolicy = {
    id: `rp-${nextId++}`,
    name,
    category,
    retention_days,
    status: "active",
    auto_delete,
    description,
    last_cleanup: null,
    next_cleanup: next.toISOString(),
    records_affected: 0,
    storage_bytes: 0,
    created_at: now.toISOString(),
  };
  policies.push(p);
  return p;
}

export function updatePolicy(id: string, updates: Partial<Pick<RetentionPolicy, "name" | "retention_days" | "auto_delete" | "status" | "description" | "records_affected" | "storage_bytes">>): RetentionPolicy | null {
  const p = policies.find((po) => po.id === id);
  if (!p) return null;
  Object.assign(p, updates);
  return p;
}

export function recordCleanup(id: string, records_removed: number, bytes_freed: number): RetentionPolicy | null {
  const p = policies.find((po) => po.id === id);
  if (!p) return null;
  p.last_cleanup = new Date().toISOString();
  const next = new Date(Date.now() + p.retention_days * 86400000);
  p.next_cleanup = next.toISOString();
  p.records_affected = Math.max(0, p.records_affected - records_removed);
  p.storage_bytes = Math.max(0, p.storage_bytes - bytes_freed);
  return p;
}

export function deletePolicy(id: string): boolean {
  const idx = policies.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  policies.splice(idx, 1);
  return true;
}

export function retentionSummary() {
  const total = policies.length;
  const total_storage = policies.reduce((s, p) => s + p.storage_bytes, 0);
  const total_records = policies.reduce((s, p) => s + p.records_affected, 0);
  const auto_delete_count = policies.filter((p) => p.auto_delete).length;
  const by_status: Record<string, number> = {};
  policies.forEach((p) => { by_status[p.status] = (by_status[p.status] || 0) + 1; });
  return { total, total_storage_gb: Math.round(total_storage / 1073741824 * 100) / 100, total_records, auto_delete_count, by_status };
}
