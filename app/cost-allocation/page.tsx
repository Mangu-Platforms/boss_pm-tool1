"use client";

import { useEffect, useState } from "react";

type CostEntry = { id: string; service_id: string; team: string; category: string; amount_cents: number; period: string; period_label: string; description: string };
type Summary = { total_cents: number; by_team: Record<string, number>; by_category: Record<string, number>; entry_count: number };

function fmt(cents: number) { return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`; }

export default function CostAllocationPage() {
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [teamFilter, setTeamFilter] = useState("");

  useEffect(() => {
    const q = teamFilter ? `?team=${teamFilter}` : "";
    fetch(`/api/cost-allocation${q}`).then((r) => r.json()).then(setCosts);
    fetch("/api/cost-allocation?summary").then((r) => r.json()).then(setSummary);
  }, [teamFilter]);

  const teams = ["", "platform", "frontend", "data", "infra"];

  return (
    <div className="page">
      <h1>Cost Allocation</h1>
      {summary && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{fmt(summary.total_cents)}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{summary.entry_count}</span><span className="ru-stat-label">Entries</span></div>
          {Object.entries(summary.by_team).map(([t, cents]) => (
            <div key={t} className="ru-stat"><span className="ru-stat-val">{fmt(cents)}</span><span className="ru-stat-label">{t}</span></div>
          ))}
        </div>
      )}
      <div className="rc-filters">
        {teams.map((t) => (
          <button key={t} className={`rc-filter-btn ${teamFilter === t ? "rc-filter-active" : ""}`} onClick={() => setTeamFilter(t)}>{t || "All"}</button>
        ))}
      </div>
      <table className="ru-table">
        <thead>
          <tr><th>Service</th><th>Team</th><th>Category</th><th>Amount</th><th>Period</th><th>Description</th></tr>
        </thead>
        <tbody>
          {costs.map((c) => (
            <tr key={c.id}>
              <td>{c.service_id}</td>
              <td>{c.team}</td>
              <td>{c.category}</td>
              <td style={{ fontFamily: "var(--mono)" }}>{fmt(c.amount_cents)}</td>
              <td>{c.period_label}</td>
              <td style={{ color: "var(--mute)", fontSize: 12 }}>{c.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
