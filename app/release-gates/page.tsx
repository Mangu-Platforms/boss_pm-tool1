"use client";

import { useEffect, useState } from "react";

type Gate = { id: string; release_id: string; name: string; type: string; status: string; required: boolean; approver: string | null; details: string; evaluated_at: string | null };
type Readiness = { release_id: string; total: number; passed: number; failed: number; pending: number; required_passed: number; required_total: number; ready: boolean };

export default function ReleaseGatesPage() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [releaseFilter, setReleaseFilter] = useState("");
  const [readiness, setReadiness] = useState<Readiness | null>(null);

  useEffect(() => {
    const q = releaseFilter ? `?release_id=${releaseFilter}` : "";
    fetch(`/api/release-gates${q}`).then((r) => r.json()).then(setGates);
    if (releaseFilter) {
      fetch(`/api/release-gates?readiness=${releaseFilter}`).then((r) => r.json()).then(setReadiness);
    } else {
      setReadiness(null);
    }
  }, [releaseFilter]);

  const statusColor: Record<string, string> = { passed: "var(--engine)", failed: "var(--danger)", pending: "var(--gold)", blocked: "var(--mute)", skipped: "var(--mute)" };
  const releases = ["", "rel-1", "rel-2", "rel-3"];

  return (
    <div className="page">
      <h1>Release Gates</h1>
      {readiness && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: readiness.ready ? "var(--engine)" : "var(--danger)" }}>{readiness.ready ? "READY" : "NOT READY"}</span><span className="ru-stat-label">Status</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--engine)" }}>{readiness.passed}</span><span className="ru-stat-label">Passed</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{readiness.failed}</span><span className="ru-stat-label">Failed</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--gold)" }}>{readiness.pending}</span><span className="ru-stat-label">Pending</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{readiness.required_passed}/{readiness.required_total}</span><span className="ru-stat-label">Required</span></div>
        </div>
      )}
      <div className="rc-filters">
        {releases.map((r) => (
          <button key={r} className={`rc-filter-btn ${releaseFilter === r ? "rc-filter-active" : ""}`} onClick={() => setReleaseFilter(r)}>{r || "All"}</button>
        ))}
      </div>
      <div className="rb-list">
        {gates.map((g) => (
          <div key={g.id} className="rb-card" style={{ borderLeftColor: statusColor[g.status] || "var(--line)" }}>
            <div className="rb-header">
              <span className="rb-severity" style={{ color: statusColor[g.status] }}>{g.status}</span>
              <span className="rb-title">{g.name}{g.required ? " *" : ""}</span>
              <span className="rb-uses">{g.type.replace(/_/g, " ")}</span>
            </div>
            <div className="rb-desc">
              {g.details}
              {g.approver && <span style={{ marginLeft: 8, color: "var(--mute)" }}>by {g.approver}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
