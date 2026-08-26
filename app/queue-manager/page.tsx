"use client";

import { useEffect, useState } from "react";

type Queue = { id: string; name: string; service_id: string; status: string; pending_jobs: number; processing_jobs: number; completed_jobs: number; failed_jobs: number; avg_processing_ms: number; max_concurrency: number };
type Stats = { total_queues: number; total_pending: number; total_processing: number; total_failed: number; by_status: Record<string, number> };

export default function QueueManagerPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/queue-manager").then((r) => r.json()).then(setQueues);
    fetch("/api/queue-manager?stats").then((r) => r.json()).then(setStats);
  }, []);

  const statusColor: Record<string, string> = { active: "var(--engine)", paused: "var(--gold)", draining: "var(--lab)", idle: "var(--mute)" };

  return (
    <div className="page">
      <h1>Queue Manager</h1>
      {stats && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{stats.total_queues}</span><span className="ru-stat-label">Queues</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--gold)" }}>{stats.total_pending}</span><span className="ru-stat-label">Pending</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--lab)" }}>{stats.total_processing}</span><span className="ru-stat-label">Processing</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{stats.total_failed}</span><span className="ru-stat-label">Failed</span></div>
        </div>
      )}
      <table className="ru-table">
        <thead>
          <tr><th>Name</th><th>Service</th><th>Status</th><th>Pending</th><th>Processing</th><th>Completed</th><th>Failed</th><th>Avg Time</th><th>Concurrency</th></tr>
        </thead>
        <tbody>
          {queues.map((q) => (
            <tr key={q.id}>
              <td style={{ fontWeight: 600 }}>{q.name}</td>
              <td>{q.service_id}</td>
              <td style={{ color: statusColor[q.status] }}>{q.status}</td>
              <td>{q.pending_jobs}</td>
              <td>{q.processing_jobs}</td>
              <td>{q.completed_jobs.toLocaleString()}</td>
              <td style={{ color: q.failed_jobs > 0 ? "var(--danger)" : "var(--mute)" }}>{q.failed_jobs}</td>
              <td>{q.avg_processing_ms}ms</td>
              <td>{q.max_concurrency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
