"use client";

import { useEffect, useState } from "react";

type TechDebt = { id: string; title: string; description: string; category: string; priority: string; status: string; effort_days: number; impact_score: number; service_id: string; owner: string | null; related_issues: string[] };
type Stats = { total: number; unresolved: number; total_effort_days: number; by_category: Record<string, number>; by_priority: Record<string, number>; avg_impact: number };

export default function TechDebtPage() {
  const [items, setItems] = useState<TechDebt[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [catFilter, setCatFilter] = useState("");

  useEffect(() => {
    const q = catFilter ? `?category=${catFilter}` : "";
    fetch(`/api/tech-debt${q}`).then((r) => r.json()).then(setItems);
    fetch("/api/tech-debt?stats").then((r) => r.json()).then(setStats);
  }, [catFilter]);

  const priColor: Record<string, string> = { low: "var(--mute)", medium: "var(--gold)", high: "var(--lab)", critical: "var(--danger)" };
  const categories = ["", "code_quality", "architecture", "testing", "documentation", "infrastructure", "security"];

  return (
    <div className="page">
      <h1>Technical Debt</h1>
      {stats && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{stats.total}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{stats.unresolved}</span><span className="ru-stat-label">Unresolved</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{stats.total_effort_days}d</span><span className="ru-stat-label">Est. Effort</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{stats.avg_impact}</span><span className="ru-stat-label">Avg Impact</span></div>
        </div>
      )}
      <div className="rc-filters">
        {categories.map((c) => (
          <button key={c} className={`rc-filter-btn ${catFilter === c ? "rc-filter-active" : ""}`} onClick={() => setCatFilter(c)}>{c ? c.replace(/_/g, " ") : "All"}</button>
        ))}
      </div>
      <div className="cr-list">
        {items.map((d) => (
          <div key={d.id} className="cr-card" style={{ borderLeftColor: priColor[d.priority] || "var(--line)" }}>
            <div className="cr-header">
              <span className="cr-title">{d.title}</span>
              <span style={{ color: priColor[d.priority] }}>{d.priority}</span>
            </div>
            <div className="cr-desc">{d.description}</div>
            <div className="cr-meta">
              <span>{d.service_id}</span>
              <span className="cr-status">{d.status.replace(/_/g, " ")}</span>
              <span>Impact: {d.impact_score}/10</span>
              <span>Effort: {d.effort_days}d</span>
              {d.owner && <span>Owner: {d.owner}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
