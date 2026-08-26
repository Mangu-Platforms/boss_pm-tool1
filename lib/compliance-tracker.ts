export type ComplianceStatus = "compliant" | "non_compliant" | "in_progress" | "not_assessed";
export type ComplianceFramework = "SOC2" | "GDPR" | "HIPAA" | "ISO27001" | "PCI_DSS";

export type ComplianceControl = {
  id: string;
  framework: ComplianceFramework;
  control_id: string;
  title: string;
  description: string;
  status: ComplianceStatus;
  owner: string;
  evidence_url: string | null;
  last_assessed: string | null;
  next_review: string;
  created_at: string;
};

const controls: ComplianceControl[] = [
  { id: "cc-1", framework: "SOC2", control_id: "CC6.1", title: "Access Control", description: "Logical access to information assets", status: "compliant", owner: "sami", evidence_url: "https://docs/soc2/cc6.1", last_assessed: "2025-07-15", next_review: "2026-01-15", created_at: "2025-01-01T00:00:00Z" },
  { id: "cc-2", framework: "SOC2", control_id: "CC7.2", title: "System Monitoring", description: "Monitoring of system components", status: "in_progress", owner: "max", evidence_url: null, last_assessed: "2025-06-01", next_review: "2025-09-01", created_at: "2025-01-01T00:00:00Z" },
  { id: "cc-3", framework: "GDPR", control_id: "Art.17", title: "Right to Erasure", description: "Data deletion upon request", status: "compliant", owner: "priya", evidence_url: "https://docs/gdpr/art17", last_assessed: "2025-08-01", next_review: "2026-02-01", created_at: "2025-03-01T00:00:00Z" },
  { id: "cc-4", framework: "GDPR", control_id: "Art.25", title: "Privacy by Design", description: "Data protection by design and default", status: "non_compliant", owner: "max", evidence_url: null, last_assessed: "2025-05-01", next_review: "2025-09-15", created_at: "2025-03-01T00:00:00Z" },
  { id: "cc-5", framework: "ISO27001", control_id: "A.12.4", title: "Logging and Monitoring", description: "Event logging and monitoring", status: "compliant", owner: "carlos", evidence_url: "https://docs/iso/a124", last_assessed: "2025-07-01", next_review: "2026-01-01", created_at: "2025-02-01T00:00:00Z" },
  { id: "cc-6", framework: "SOC2", control_id: "CC8.1", title: "Change Management", description: "Changes to infrastructure and software", status: "not_assessed", owner: "sami", evidence_url: null, last_assessed: null, next_review: "2025-09-01", created_at: "2025-04-01T00:00:00Z" },
];

let nextId = 7;

export function listControls(framework?: ComplianceFramework, status?: ComplianceStatus): ComplianceControl[] {
  let result = [...controls];
  if (framework) result = result.filter((c) => c.framework === framework);
  if (status) result = result.filter((c) => c.status === status);
  return result.sort((a, b) => a.framework.localeCompare(b.framework) || a.control_id.localeCompare(b.control_id));
}

export function getControl(id: string): ComplianceControl | null {
  return controls.find((c) => c.id === id) || null;
}

export function createControl(framework: ComplianceFramework, controlId: string, title: string, description: string, owner: string, nextReview: string): ComplianceControl {
  const ctrl: ComplianceControl = {
    id: `cc-${nextId++}`,
    framework,
    control_id: controlId,
    title,
    description,
    status: "not_assessed",
    owner,
    evidence_url: null,
    last_assessed: null,
    next_review: nextReview,
    created_at: new Date().toISOString(),
  };
  controls.push(ctrl);
  return ctrl;
}

export function updateControl(id: string, updates: Partial<Pick<ComplianceControl, "status" | "evidence_url" | "owner" | "next_review">>): ComplianceControl | null {
  const ctrl = controls.find((c) => c.id === id);
  if (!ctrl) return null;
  if (updates.status && updates.status !== ctrl.status) ctrl.last_assessed = new Date().toISOString().slice(0, 10);
  Object.assign(ctrl, updates);
  return ctrl;
}

export function deleteControl(id: string): boolean {
  const idx = controls.findIndex((c) => c.id === id);
  if (idx < 0) return false;
  controls.splice(idx, 1);
  return true;
}

export function complianceSummary(framework?: ComplianceFramework): { total: number; compliant: number; non_compliant: number; in_progress: number; not_assessed: number; compliance_pct: number } {
  const filtered = framework ? controls.filter((c) => c.framework === framework) : controls;
  const compliant = filtered.filter((c) => c.status === "compliant").length;
  return {
    total: filtered.length,
    compliant,
    non_compliant: filtered.filter((c) => c.status === "non_compliant").length,
    in_progress: filtered.filter((c) => c.status === "in_progress").length,
    not_assessed: filtered.filter((c) => c.status === "not_assessed").length,
    compliance_pct: filtered.length > 0 ? Math.round((compliant / filtered.length) * 100) : 0,
  };
}

export function overdueControls(): ComplianceControl[] {
  const today = new Date().toISOString().slice(0, 10);
  return controls.filter((c) => c.next_review <= today && c.status !== "compliant");
}
