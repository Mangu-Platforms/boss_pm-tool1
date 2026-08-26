"use client";

import { useEffect, useState } from "react";

type ErrorBudget = { id: string; service_id: string; metric: string; slo_target: number; period: string; budget_total_minutes: number; budget_consumed_minutes: number; budget_remaining_pct: number; status: string; burn_rate: number };
type Summary = { total: number; by_status: Record<string, number>; avg_remaining: number };

export default function ErrorBudgetsPage() {
  const [budgets, setBudgets] = useState<ErrorBudget[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/error-budgets${q}`).then((r) => r.json()).then(setBudgets);
    fetch("/api/error-budgets?summary").then((r) => r.json()).then(setSummary);
  }, [filter]);

  const statusColor: Record<string, string> = { healthy: "var(--engine)", warning: "var(--gold)", critical: "var(--danger)", exhausted: "var(--danger)" };

  return (
    <div className="page">
      <h1>Error Budgets</h1>
      {summary && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{summary.total}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--engine)" }}>{summary.avg_remaining}%</span><span className="ru-stat-label">Avg Remaining</span></div>
          {Object.entries(summary.by_status).map(([s, count]) => (
            <div key={s} className="ru-stat"><span className="ru-stat-val" style={{ color: statusColor[s] }}>{count}</span><span className="ru-stat-label">{s}</span></div>
          ))}
        </div>
      )}
      <div className="rc-filters">
        {["", "healthy", "warning", "critical", "exhausted"].map((s) => (
          <button key={s} className={`rc-filter-btn ${filter === s ? "rc-filter-active" : ""}`} onClick={() => setFilter(s)}>{s || "All"}</button>
        ))}
      </div>
      <table className="ru-table">
        <thead>
          <tr><th>Service</th><th>Metric</th><th>SLO</th><th>Period</th><th>Budget</th><th>Consumed</th><th>Remaining</th><th>Status</th><th>Burn Rate</th></tr>
        </thead>
        <tbody>
          {budgets.map((b) => (
            <tr key={b.id}>
              <td>{b.service_id}</td>
              <td>{b.metric}</td>
              <td>{b.slo_target}%</td>
              <td>{b.period}</td>
              <td>{b.budget_total_minutes}m</td>
              <td>{b.budget_consumed_minutes}m</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 60, height: 6, background: "var(--ink-3)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${b.budget_remaining_pct}%`, height: "100%", background: statusColor[b.status], borderRadius: 3 }} />
                  </div>
                  <span>{b.budget_remaining_pct}%</span>
                </div>
              </td>
              <td style={{ color: statusColor[b.status] }}>{b.status}</td>
              <td>{b.burn_rate}x</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
