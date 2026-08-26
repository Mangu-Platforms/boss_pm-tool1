export type ScanType = "dependency" | "sast" | "dast" | "container" | "secret";
export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";
export type FindingStatus = "open" | "acknowledged" | "false_positive" | "fixed";

export type SecurityFinding = {
  id: string;
  scan_type: ScanType;
  service_id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  cve_id: string | null;
  file_path: string | null;
  line_number: number | null;
  remediation: string;
  found_at: string;
  fixed_at: string | null;
};

let nextId = 11;

const findings: SecurityFinding[] = [
  { id: "sf-1", scan_type: "dependency", service_id: "svc-1", title: "lodash prototype pollution", description: "lodash < 4.17.21 vulnerable to prototype pollution", severity: "high", status: "fixed", cve_id: "CVE-2021-23337", file_path: "package.json", line_number: null, remediation: "Upgrade lodash to >= 4.17.21", found_at: "2025-01-10T00:00:00Z", fixed_at: "2025-01-12T00:00:00Z" },
  { id: "sf-2", scan_type: "sast", service_id: "svc-1", title: "SQL injection risk", description: "Unsanitized user input in query builder", severity: "critical", status: "open", cve_id: null, file_path: "src/db/queries.ts", line_number: 42, remediation: "Use parameterized queries", found_at: "2025-01-15T00:00:00Z", fixed_at: null },
  { id: "sf-3", scan_type: "secret", service_id: "svc-2", title: "Hardcoded API key", description: "API key found in source code", severity: "critical", status: "acknowledged", cve_id: null, file_path: "src/config/api.ts", line_number: 15, remediation: "Move to environment variable", found_at: "2025-01-18T00:00:00Z", fixed_at: null },
  { id: "sf-4", scan_type: "container", service_id: "svc-3", title: "Alpine base image CVE", description: "Base image has known vulnerabilities", severity: "medium", status: "open", cve_id: "CVE-2024-12345", file_path: "Dockerfile", line_number: 1, remediation: "Update base image to latest", found_at: "2025-01-20T00:00:00Z", fixed_at: null },
  { id: "sf-5", scan_type: "dast", service_id: "svc-1", title: "Missing CSRF token", description: "Form submission endpoint lacks CSRF protection", severity: "high", status: "open", cve_id: null, file_path: null, line_number: null, remediation: "Implement CSRF token validation", found_at: "2025-01-22T00:00:00Z", fixed_at: null },
  { id: "sf-6", scan_type: "dependency", service_id: "svc-2", title: "express-fileupload path traversal", description: "File upload allows directory traversal", severity: "high", status: "open", cve_id: "CVE-2024-98765", file_path: "package.json", line_number: null, remediation: "Upgrade to patched version", found_at: "2025-01-23T00:00:00Z", fixed_at: null },
  { id: "sf-7", scan_type: "sast", service_id: "svc-1", title: "XSS in template rendering", description: "User content rendered without escaping", severity: "high", status: "false_positive", cve_id: null, file_path: "src/views/profile.tsx", line_number: 88, remediation: "Use safe rendering functions", found_at: "2025-01-08T00:00:00Z", fixed_at: null },
  { id: "sf-8", scan_type: "container", service_id: "svc-4", title: "Running as root", description: "Container runs as root user", severity: "medium", status: "open", cve_id: null, file_path: "Dockerfile", line_number: null, remediation: "Add USER directive", found_at: "2025-01-19T00:00:00Z", fixed_at: null },
  { id: "sf-9", scan_type: "secret", service_id: "svc-1", title: "Leaked JWT secret", description: "JWT signing secret committed to repo", severity: "critical", status: "fixed", cve_id: null, file_path: ".env.example", line_number: 3, remediation: "Rotate secret, remove from repo", found_at: "2025-01-05T00:00:00Z", fixed_at: "2025-01-06T00:00:00Z" },
  { id: "sf-10", scan_type: "dependency", service_id: "svc-3", title: "yaml parser RCE", description: "js-yaml < 3.13.1 allows code execution", severity: "critical", status: "open", cve_id: "CVE-2023-44487", file_path: "package-lock.json", line_number: null, remediation: "Upgrade js-yaml", found_at: "2025-01-24T00:00:00Z", fixed_at: null },
];

export function listFindings(scan_type?: ScanType, severity?: FindingSeverity, status?: FindingStatus, service_id?: string): SecurityFinding[] {
  let result = [...findings];
  if (scan_type) result = result.filter((f) => f.scan_type === scan_type);
  if (severity) result = result.filter((f) => f.severity === severity);
  if (status) result = result.filter((f) => f.status === status);
  if (service_id) result = result.filter((f) => f.service_id === service_id);
  const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return result.sort((a, b) => (sevOrder[a.severity] ?? 5) - (sevOrder[b.severity] ?? 5));
}

export function getFinding(id: string): SecurityFinding | null {
  return findings.find((f) => f.id === id) || null;
}

export function createFinding(scan_type: ScanType, service_id: string, title: string, description: string, severity: FindingSeverity, remediation: string, cve_id?: string, file_path?: string, line_number?: number): SecurityFinding {
  const f: SecurityFinding = {
    id: `sf-${nextId++}`,
    scan_type,
    service_id,
    title,
    description,
    severity,
    status: "open",
    cve_id: cve_id || null,
    file_path: file_path || null,
    line_number: line_number || null,
    remediation,
    found_at: new Date().toISOString(),
    fixed_at: null,
  };
  findings.push(f);
  return f;
}

export function updateFinding(id: string, updates: Partial<Pick<SecurityFinding, "status" | "remediation">>): SecurityFinding | null {
  const f = findings.find((fi) => fi.id === id);
  if (!f) return null;
  Object.assign(f, updates);
  if (updates.status === "fixed" && !f.fixed_at) f.fixed_at = new Date().toISOString();
  return f;
}

export function deleteFinding(id: string): boolean {
  const idx = findings.findIndex((f) => f.id === id);
  if (idx === -1) return false;
  findings.splice(idx, 1);
  return true;
}

export function securityStats() {
  const total = findings.length;
  const open = findings.filter((f) => f.status === "open").length;
  const critical_open = findings.filter((f) => f.status === "open" && f.severity === "critical").length;
  const by_severity: Record<string, number> = {};
  const by_scan_type: Record<string, number> = {};
  findings.filter((f) => f.status === "open").forEach((f) => {
    by_severity[f.severity] = (by_severity[f.severity] || 0) + 1;
    by_scan_type[f.scan_type] = (by_scan_type[f.scan_type] || 0) + 1;
  });
  return { total, open, critical_open, by_severity, by_scan_type };
}
