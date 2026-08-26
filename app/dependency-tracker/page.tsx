"use client";

import { useEffect, useState } from "react";

type Dependency = { id: string; service_id: string; name: string; current_version: string; latest_version: string; type: string; status: string; license: string; direct: boolean };
type Stats = { total: number; direct: number; transitive: number; by_status: Record<string, number>; by_type: Record<string, number> };

export default function DependencyTrackerPage() {
  const [deps, setDeps] = useState<Dependency[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const q = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/dependency-tracker${q}`).then((r) => r.json()).then(setDeps);
    fetch("/api/dependency-tracker?stats").then((r) => r.json()).then(setStats);
  }, [statusFilter]);

  const statusColor: Record<string, string> = { current: "var(--engine)", outdated: "var(--gold)", vulnerable: "var(--danger)", deprecated: "var(--lab)" };

  return (
    <div className="page">
      <h1>Dependency Tracker</h1>
      {stats && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{stats.total}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{stats.direct}</span><span className="ru-stat-label">Direct</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{stats.transitive}</span><span className="ru-stat-label">Transitive</span></div>
          {Object.entries(stats.by_status).map(([s, count]) => (
            <div key={s} className="ru-stat"><span className="ru-stat-val" style={{ color: statusColor[s] }}>{count}</span><span className="ru-stat-label">{s}</span></div>
          ))}
        </div>
      )}
      <div className="rc-filters">
        {["", "vulnerable", "deprecated", "outdated", "current"].map((s) => (
          <button key={s} className={`rc-filter-btn ${statusFilter === s ? "rc-filter-active" : ""}`} onClick={() => setStatusFilter(s)}>{s || "All"}</button>
        ))}
      </div>
      <table className="ru-table">
        <thead>
          <tr><th>Name</th><th>Service</th><th>Type</th><th>Current</th><th>Latest</th><th>Status</th><th>License</th><th>Direct</th></tr>
        </thead>
        <tbody>
          {deps.map((d) => (
            <tr key={d.id}>
              <td style={{ fontWeight: 600 }}>{d.name}</td>
              <td>{d.service_id}</td>
              <td>{d.type}</td>
              <td><code>{d.current_version}</code></td>
              <td><code>{d.latest_version}</code></td>
              <td style={{ color: statusColor[d.status] }}>{d.status}</td>
              <td style={{ fontSize: 11, color: "var(--mute)" }}>{d.license}</td>
              <td>{d.direct ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
