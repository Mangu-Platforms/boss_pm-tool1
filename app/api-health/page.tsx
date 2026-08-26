"use client";

import { useEffect, useState } from "react";

type Endpoint = { id: string; service_id: string; method: string; path: string; status: string; response_time_ms: number; uptime_pct: number; error_rate_pct: number; requests_per_minute: number; last_checked: string };
type Summary = { total: number; by_status: Record<string, number>; avg_response_ms: number; avg_uptime: number };

export default function ApiHealthPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/api-health${q}`).then((r) => r.json()).then(setEndpoints);
    fetch("/api/api-health?summary").then((r) => r.json()).then(setSummary);
  }, [filter]);

  const statusColor: Record<string, string> = { healthy: "var(--engine)", degraded: "var(--gold)", down: "var(--danger)", unknown: "var(--mute)" };

  return (
    <div className="page">
      <h1>API Health</h1>
      {summary && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{summary.total}</span><span className="ru-stat-label">Endpoints</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--engine)" }}>{summary.avg_uptime}%</span><span className="ru-stat-label">Avg Uptime</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{summary.avg_response_ms}ms</span><span className="ru-stat-label">Avg Response</span></div>
          {Object.entries(summary.by_status).map(([s, count]) => (
            <div key={s} className="ru-stat"><span className="ru-stat-val" style={{ color: statusColor[s] }}>{count}</span><span className="ru-stat-label">{s}</span></div>
          ))}
        </div>
      )}
      <div className="rc-filters">
        {["", "healthy", "degraded", "down", "unknown"].map((s) => (
          <button key={s} className={`rc-filter-btn ${filter === s ? "rc-filter-active" : ""}`} onClick={() => setFilter(s)}>{s || "All"}</button>
        ))}
      </div>
      <table className="ru-table">
        <thead>
          <tr><th>Service</th><th>Method</th><th>Path</th><th>Status</th><th>Response</th><th>Uptime</th><th>Error Rate</th><th>RPM</th></tr>
        </thead>
        <tbody>
          {endpoints.map((ep) => (
            <tr key={ep.id}>
              <td>{ep.service_id}</td>
              <td><code>{ep.method}</code></td>
              <td><code>{ep.path}</code></td>
              <td style={{ color: statusColor[ep.status] }}>{ep.status}</td>
              <td>{ep.response_time_ms}ms</td>
              <td>{ep.uptime_pct}%</td>
              <td style={{ color: ep.error_rate_pct > 1 ? "var(--danger)" : "var(--mute)" }}>{ep.error_rate_pct}%</td>
              <td>{ep.requests_per_minute}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
