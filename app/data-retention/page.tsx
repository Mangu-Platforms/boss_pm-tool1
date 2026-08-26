"use client";

import { useEffect, useState } from "react";

type Policy = { id: string; name: string; category: string; retention_days: number; status: string; auto_delete: boolean; description: string; last_cleanup: string | null; next_cleanup: string; records_affected: number; storage_bytes: number };
type Summary = { total: number; total_storage_gb: number; total_records: number; auto_delete_count: number; by_status: Record<string, number> };

function fmtBytes(b: number) {
  if (b >= 1073741824) return `${(b / 1073741824).toFixed(1)} GB`;
  if (b >= 1048576) return `${(b / 1048576).toFixed(0)} MB`;
  return `${(b / 1024).toFixed(0)} KB`;
}

export default function DataRetentionPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/data-retention").then((r) => r.json()).then(setPolicies);
    fetch("/api/data-retention?summary").then((r) => r.json()).then(setSummary);
  }, []);

  const statusColor: Record<string, string> = { active: "var(--engine)", review_needed: "var(--gold)", expiring_soon: "var(--lab)", expired: "var(--danger)" };

  return (
    <div className="page">
      <h1>Data Retention</h1>
      {summary && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{summary.total}</span><span className="ru-stat-label">Policies</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{summary.total_storage_gb} GB</span><span className="ru-stat-label">Total Storage</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{summary.total_records.toLocaleString()}</span><span className="ru-stat-label">Records</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{summary.auto_delete_count}</span><span className="ru-stat-label">Auto-Delete</span></div>
        </div>
      )}
      <table className="ru-table">
        <thead>
          <tr><th>Name</th><th>Category</th><th>Retention</th><th>Status</th><th>Auto</th><th>Records</th><th>Storage</th><th>Next Cleanup</th></tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.id}>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td>{p.category.replace(/_/g, " ")}</td>
              <td>{p.retention_days}d</td>
              <td style={{ color: statusColor[p.status] }}>{p.status.replace(/_/g, " ")}</td>
              <td>{p.auto_delete ? "Yes" : "No"}</td>
              <td>{p.records_affected.toLocaleString()}</td>
              <td>{fmtBytes(p.storage_bytes)}</td>
              <td style={{ fontSize: 11, fontFamily: "var(--mono)" }}>{new Date(p.next_cleanup).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
