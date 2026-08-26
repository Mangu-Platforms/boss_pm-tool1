export type ViolationSeverity = "minor" | "major" | "critical";
export type ViolationStatus = "open" | "acknowledged" | "mitigated" | "resolved";

export type SLAViolation = {
  id: string;
  service_id: string;
  sla_metric: string;
  threshold: number;
  actual_value: number;
  severity: ViolationSeverity;
  status: ViolationStatus;
  impact_description: string;
  root_cause: string | null;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
};

const violations: SLAViolation[] = [
  { id: "slav-1", service_id: "svc-1", sla_metric: "uptime_pct", threshold: 99.99, actual_value: 99.95, severity: "major", status: "resolved", impact_description: "4 minutes downtime", root_cause: "Deployment rollback", detected_at: "2025-08-10T14:00:00Z", resolved_at: "2025-08-10T14:04:00Z", created_at: "2025-08-10T14:00:00Z" },
  { id: "slav-2", service_id: "svc-3", sla_metric: "delivery_latency_ms", threshold: 5000, actual_value: 35000, severity: "critical", status: "open", impact_description: "Push notifications delayed 30+ seconds", root_cause: null, detected_at: "2025-08-25T09:00:00Z", resolved_at: null, created_at: "2025-08-25T09:00:00Z" },
  { id: "slav-3", service_id: "svc-2", sla_metric: "uptime_pct", threshold: 99.99, actual_value: 99.98, severity: "minor", status: "resolved", impact_description: "Brief auth degradation", root_cause: "Certificate renewal delay", detected_at: "2025-07-15T03:00:00Z", resolved_at: "2025-07-15T03:05:00Z", created_at: "2025-07-15T03:00:00Z" },
  { id: "slav-4", service_id: "svc-4", sla_metric: "processing_time_ms", threshold: 30000, actual_value: 45000, severity: "major", status: "acknowledged", impact_description: "Analytics pipeline 50% slower", root_cause: "Data volume spike", detected_at: "2025-08-20T11:00:00Z", resolved_at: null, created_at: "2025-08-20T11:00:00Z" },
];

let nextId = 5;

export function listViolations(status?: ViolationStatus, serviceId?: string): SLAViolation[] {
  let result = [...violations];
  if (status) result = result.filter((v) => v.status === status);
  if (serviceId) result = result.filter((v) => v.service_id === serviceId);
  return result.sort((a, b) => b.detected_at.localeCompare(a.detected_at));
}

export function getViolation(id: string): SLAViolation | null {
  return violations.find((v) => v.id === id) || null;
}

export function createViolation(serviceId: string, slaMetric: string, threshold: number, actualValue: number, severity: ViolationSeverity, impactDescription: string): SLAViolation {
  const now = new Date().toISOString();
  const v: SLAViolation = { id: `slav-${nextId++}`, service_id: serviceId, sla_metric: slaMetric, threshold, actual_value: actualValue, severity, status: "open", impact_description: impactDescription, root_cause: null, detected_at: now, resolved_at: null, created_at: now };
  violations.push(v);
  return v;
}

export function updateViolation(id: string, updates: Partial<Pick<SLAViolation, "status" | "root_cause">>): SLAViolation | null {
  const v = violations.find((vio) => vio.id === id);
  if (!v) return null;
  if (updates.status === "resolved") v.resolved_at = new Date().toISOString();
  Object.assign(v, updates);
  return v;
}

export function violationStats(): { total: number; open: number; resolved: number; avg_resolution_minutes: number } {
  const resolved = violations.filter((v) => v.resolved_at);
  const avgRes = resolved.length > 0 ? Math.round(resolved.reduce((s, v) => s + (new Date(v.resolved_at!).getTime() - new Date(v.detected_at).getTime()) / 60000, 0) / resolved.length) : 0;
  return { total: violations.length, open: violations.filter((v) => v.status === "open" || v.status === "acknowledged").length, resolved: resolved.length, avg_resolution_minutes: avgRes };
}
