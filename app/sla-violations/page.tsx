"use client";

import { useEffect, useState } from "react";

type SLAViolation = { id: string; service_id: string; sla_metric: string; threshold: number; actual_value: number; severity: string; status: string; impact_description: string; root_cause: string | null; detected_at: string; resolved_at: string | null };
type Stats = { total: number; open: number; resolved: number; avg_resolution_minutes: number };

export default function SLAViolationsPage() {
  const [violations, setViolations] = useState<SLAViolation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/sla-violations${q}`).then((r) => r.json()).then(setViolations);
    fetch("/api/sla-violations?stats").then((r) => r.json()).then(setStats);
  }, [filter]);

  const sevColor: Record<string, string> = { minor: "var(--gold)", major: "var(--lab)", critical: "var(--danger)" };

  return (
    <div className="page">
      <h1>SLA Violations</h1>
      {stats && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{stats.total}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{stats.open}</span><span className="ru-stat-label">Open</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--engine)" }}>{stats.resolved}</span><span className="ru-stat-label">Resolved</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{stats.avg_resolution_minutes}m</span><span className="ru-stat-label">Avg Resolution</span></div>
        </div>
      )}
      <div className="rc-filters">
        {["", "open", "acknowledged", "mitigated", "resolved"].map((s) => (
          <button key={s} className={`rc-filter-btn ${filter === s ? "rc-filter-active" : ""}`} onClick={() => setFilter(s)}>{s || "All"}</button>
        ))}
      </div>
      <div className="cr-list">
        {violations.map((v) => (
          <div key={v.id} className="cr-card" style={{ borderLeftColor: sevColor[v.severity] || "var(--line)" }}>
            <div className="cr-header">
              <span className="cr-title">{v.sla_metric}: {v.actual_value} (threshold: {v.threshold})</span>
              <span style={{ color: sevColor[v.severity] }}>{v.severity}</span>
            </div>
            <div className="cr-desc">{v.impact_description}</div>
            <div className="cr-meta">
              <span>{v.service_id}</span>
              <span className="cr-status">{v.status}</span>
              {v.root_cause && <span>Cause: {v.root_cause}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
