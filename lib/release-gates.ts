export type GateType = "manual_approval" | "test_pass" | "security_scan" | "performance_check" | "change_request" | "compliance_check";
export type GateStatus = "pending" | "passed" | "failed" | "skipped" | "blocked";

export type ReleaseGate = {
  id: string;
  release_id: string;
  name: string;
  type: GateType;
  status: GateStatus;
  required: boolean;
  approver: string | null;
  details: string;
  evaluated_at: string | null;
  created_at: string;
};

let nextId = 13;

const gates: ReleaseGate[] = [
  { id: "rg-1", release_id: "rel-1", name: "Unit Tests", type: "test_pass", status: "passed", required: true, approver: null, details: "All 809 tests passing", evaluated_at: "2025-01-20T10:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "rg-2", release_id: "rel-1", name: "Security Scan", type: "security_scan", status: "passed", required: true, approver: null, details: "No critical vulnerabilities", evaluated_at: "2025-01-20T11:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "rg-3", release_id: "rel-1", name: "Tech Lead Approval", type: "manual_approval", status: "passed", required: true, approver: "max", details: "Approved for release", evaluated_at: "2025-01-20T14:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "rg-4", release_id: "rel-1", name: "Performance Check", type: "performance_check", status: "passed", required: false, approver: null, details: "P99 latency within budget", evaluated_at: "2025-01-20T12:00:00Z", created_at: "2025-01-15T00:00:00Z" },
  { id: "rg-5", release_id: "rel-2", name: "Unit Tests", type: "test_pass", status: "passed", required: true, approver: null, details: "All tests passing", evaluated_at: "2025-01-25T10:00:00Z", created_at: "2025-01-22T00:00:00Z" },
  { id: "rg-6", release_id: "rel-2", name: "Security Scan", type: "security_scan", status: "failed", required: true, approver: null, details: "2 high severity findings", evaluated_at: "2025-01-25T11:00:00Z", created_at: "2025-01-22T00:00:00Z" },
  { id: "rg-7", release_id: "rel-2", name: "VP Approval", type: "manual_approval", status: "pending", required: true, approver: null, details: "Awaiting VP sign-off", evaluated_at: null, created_at: "2025-01-22T00:00:00Z" },
  { id: "rg-8", release_id: "rel-2", name: "Change Request", type: "change_request", status: "passed", required: true, approver: "sami", details: "CR-2025-001 approved", evaluated_at: "2025-01-24T09:00:00Z", created_at: "2025-01-22T00:00:00Z" },
  { id: "rg-9", release_id: "rel-3", name: "Integration Tests", type: "test_pass", status: "pending", required: true, approver: null, details: "Not yet run", evaluated_at: null, created_at: "2025-01-26T00:00:00Z" },
  { id: "rg-10", release_id: "rel-3", name: "Compliance Check", type: "compliance_check", status: "pending", required: true, approver: null, details: "SOC2 review pending", evaluated_at: null, created_at: "2025-01-26T00:00:00Z" },
  { id: "rg-11", release_id: "rel-3", name: "Security Scan", type: "security_scan", status: "pending", required: true, approver: null, details: "Scheduled", evaluated_at: null, created_at: "2025-01-26T00:00:00Z" },
  { id: "rg-12", release_id: "rel-3", name: "Staging Verification", type: "manual_approval", status: "blocked", required: true, approver: null, details: "Blocked by test gate", evaluated_at: null, created_at: "2025-01-26T00:00:00Z" },
];

export function listGates(release_id?: string, status?: GateStatus, type?: GateType): ReleaseGate[] {
  let result = [...gates];
  if (release_id) result = result.filter((g) => g.release_id === release_id);
  if (status) result = result.filter((g) => g.status === status);
  if (type) result = result.filter((g) => g.type === type);
  return result.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function getGate(id: string): ReleaseGate | null {
  return gates.find((g) => g.id === id) || null;
}

export function createGate(release_id: string, name: string, type: GateType, required: boolean, details?: string): ReleaseGate {
  const g: ReleaseGate = {
    id: `rg-${nextId++}`,
    release_id,
    name,
    type,
    status: "pending",
    required,
    approver: null,
    details: details || "",
    evaluated_at: null,
    created_at: new Date().toISOString(),
  };
  gates.push(g);
  return g;
}

export function evaluateGate(id: string, status: GateStatus, approver?: string, details?: string): ReleaseGate | null {
  const g = gates.find((ga) => ga.id === id);
  if (!g) return null;
  g.status = status;
  if (approver) g.approver = approver;
  if (details) g.details = details;
  g.evaluated_at = new Date().toISOString();
  return g;
}

export function deleteGate(id: string): boolean {
  const idx = gates.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  gates.splice(idx, 1);
  return true;
}

export function releaseReadiness(release_id: string) {
  const releaseGates = gates.filter((g) => g.release_id === release_id);
  const total = releaseGates.length;
  const passed = releaseGates.filter((g) => g.status === "passed").length;
  const failed = releaseGates.filter((g) => g.status === "failed").length;
  const pending = releaseGates.filter((g) => g.status === "pending" || g.status === "blocked").length;
  const required_passed = releaseGates.filter((g) => g.required && g.status === "passed").length;
  const required_total = releaseGates.filter((g) => g.required).length;
  const ready = required_passed === required_total && required_total > 0 && failed === 0;
  return { release_id, total, passed, failed, pending, required_passed, required_total, ready };
}
