"use client";

import { useEffect, useState } from "react";

type Deployment = { id: string; service_id: string; version: string; environment: string; status: string; deployer: string; commit_sha: string; duration_seconds: number | null; started_at: string };
type Metrics = { total: number; success_rate: number; avg_duration_seconds: number; failed: number };

export default function DeploymentTrackingPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [envFilter, setEnvFilter] = useState("");

  useEffect(() => {
    const q = envFilter ? `?env=${envFilter}` : "";
    fetch(`/api/deployment-tracking${q}`).then((r) => r.json()).then(setDeployments);
    fetch(`/api/deployment-tracking?metrics${envFilter ? `&env=${envFilter}` : ""}`).then((r) => r.json()).then(setMetrics);
  }, [envFilter]);

  const statusColor: Record<string, string> = { pending: "var(--mute)", in_progress: "var(--lab)", success: "var(--engine)", failed: "var(--danger)", rolled_back: "var(--gold)" };

  return (
    <div className="page">
      <h1>Deployment Tracking</h1>
      {metrics && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{metrics.total}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--engine)" }}>{metrics.success_rate}%</span><span className="ru-stat-label">Success</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{metrics.avg_duration_seconds}s</span><span className="ru-stat-label">Avg Duration</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{metrics.failed}</span><span className="ru-stat-label">Failed</span></div>
        </div>
      )}
      <div className="rc-filters">
        {["", "development", "staging", "production"].map((e) => (
          <button key={e} className={`rc-filter-btn ${envFilter === e ? "rc-filter-active" : ""}`} onClick={() => setEnvFilter(e)}>{e || "All"}</button>
        ))}
      </div>
      <table className="ru-table">
        <thead>
          <tr><th>Service</th><th>Version</th><th>Env</th><th>Status</th><th>Deployer</th><th>SHA</th><th>Duration</th></tr>
        </thead>
        <tbody>
          {deployments.map((d) => (
            <tr key={d.id}>
              <td>{d.service_id}</td>
              <td><code>{d.version}</code></td>
              <td>{d.environment}</td>
              <td style={{ color: statusColor[d.status] }}>{d.status.replace("_", " ")}</td>
              <td>{d.deployer}</td>
              <td><code>{d.commit_sha.slice(0, 7)}</code></td>
              <td>{d.duration_seconds !== null ? `${d.duration_seconds}s` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
