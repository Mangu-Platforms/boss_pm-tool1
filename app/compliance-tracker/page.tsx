"use client";

import { useEffect, useState } from "react";

type ComplianceControl = {
  id: string;
  framework: string;
  control_id: string;
  title: string;
  description: string;
  status: string;
  owner: string;
  evidence_url: string | null;
  last_assessed: string | null;
  next_review: string;
};
type Summary = { total: number; compliant: number; non_compliant: number; in_progress: number; not_assessed: number; compliance_pct: number };

export default function ComplianceTrackerPage() {
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [fwFilter, setFwFilter] = useState("");

  useEffect(() => {
    const q = fwFilter ? `?framework=${fwFilter}` : "";
    fetch(`/api/compliance-tracker${q}`).then((r) => r.json()).then(setControls);
    fetch(`/api/compliance-tracker?summary${fwFilter ? `&framework=${fwFilter}` : ""}`).then((r) => r.json()).then(setSummary);
  }, [fwFilter]);

  const statusColor: Record<string, string> = { compliant: "var(--engine)", non_compliant: "var(--danger)", in_progress: "var(--gold)", not_assessed: "var(--mute)" };

  return (
    <div className="page">
      <h1>Compliance Tracker</h1>

      {summary && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{summary.compliance_pct}%</span><span className="ru-stat-label">Compliant</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--engine)" }}>{summary.compliant}</span><span className="ru-stat-label">Pass</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{summary.non_compliant}</span><span className="ru-stat-label">Fail</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--gold)" }}>{summary.in_progress}</span><span className="ru-stat-label">In Progress</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{summary.not_assessed}</span><span className="ru-stat-label">Unassessed</span></div>
        </div>
      )}

      <div className="rc-filters">
        {["", "SOC2", "GDPR", "HIPAA", "ISO27001", "PCI_DSS"].map((fw) => (
          <button key={fw} className={`rc-filter-btn ${fwFilter === fw ? "rc-filter-active" : ""}`} onClick={() => setFwFilter(fw)}>{fw || "All"}</button>
        ))}
      </div>

      <table className="ru-table">
        <thead>
          <tr><th>Framework</th><th>Control</th><th>Title</th><th>Status</th><th>Owner</th><th>Next Review</th></tr>
        </thead>
        <tbody>
          {controls.map((c) => (
            <tr key={c.id}>
              <td><code>{c.framework}</code></td>
              <td><code>{c.control_id}</code></td>
              <td>{c.title}</td>
              <td style={{ color: statusColor[c.status] }}>{c.status.replace("_", " ")}</td>
              <td>{c.owner}</td>
              <td>{c.next_review}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
