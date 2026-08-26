"use client";

import { useEffect, useState } from "react";

type Finding = { id: string; scan_type: string; service_id: string; title: string; description: string; severity: string; status: string; cve_id: string | null; file_path: string | null; line_number: number | null; remediation: string; found_at: string };
type Stats = { total: number; open: number; critical_open: number; by_severity: Record<string, number>; by_scan_type: Record<string, number> };

export default function SecurityScanningPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [sevFilter, setSevFilter] = useState("");

  useEffect(() => {
    const q = sevFilter ? `?severity=${sevFilter}` : "";
    fetch(`/api/security-scanning${q}`).then((r) => r.json()).then(setFindings);
    fetch("/api/security-scanning?stats").then((r) => r.json()).then(setStats);
  }, [sevFilter]);

  const sevColor: Record<string, string> = { info: "var(--mute)", low: "var(--mute)", medium: "var(--gold)", high: "var(--lab)", critical: "var(--danger)" };

  return (
    <div className="page">
      <h1>Security Scanning</h1>
      {stats && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{stats.total}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{stats.open}</span><span className="ru-stat-label">Open</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{stats.critical_open}</span><span className="ru-stat-label">Critical Open</span></div>
        </div>
      )}
      <div className="rc-filters">
        {["", "critical", "high", "medium", "low", "info"].map((s) => (
          <button key={s} className={`rc-filter-btn ${sevFilter === s ? "rc-filter-active" : ""}`} onClick={() => setSevFilter(s)}>{s || "All"}</button>
        ))}
      </div>
      <div className="cr-list">
        {findings.map((f) => (
          <div key={f.id} className="cr-card" style={{ borderLeftColor: sevColor[f.severity] || "var(--line)" }}>
            <div className="cr-header">
              <span className="cr-title">{f.title}</span>
              <span style={{ color: sevColor[f.severity] }}>{f.severity}</span>
            </div>
            <div className="cr-desc">{f.description}</div>
            <div className="cr-meta">
              <span>{f.service_id}</span>
              <span>{f.scan_type}</span>
              <span className="cr-status">{f.status}</span>
              {f.cve_id && <span>{f.cve_id}</span>}
              {f.file_path && <span><code>{f.file_path}{f.line_number ? `:${f.line_number}` : ""}</code></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
