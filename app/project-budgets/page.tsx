"use client";

import { useEffect, useState } from "react";

type LineItem = { id: string; category: string; planned: number; actual: number };
type Budget = { id: string; project_id: string; name: string; total_budget: number; spent: number; status: string; line_items: LineItem[] };

const statusColors: Record<string, string> = {
  under_budget: "var(--engine)",
  on_track: "var(--gold)",
  at_risk: "var(--lab)",
  over_budget: "var(--danger)",
};

export default function ProjectBudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  function load() {
    fetch("/api/project-budgets").then((r) => r.json()).then(setBudgets);
  }
  useEffect(load, []);

  return (
    <div className="page">
      <h1>Project Budgets</h1>

      <div className="pb-grid">
        {budgets.map((b) => (
          <div key={b.id} className="pb-card" style={{ borderColor: statusColors[b.status] || "var(--line)" }}>
            <div className="pb-header">
              <h3>{b.name}</h3>
              <span className="pb-status" style={{ color: statusColors[b.status] }}>{b.status.replace(/_/g, " ")}</span>
            </div>
            <div className="pb-amounts">
              <span>Budget: ${b.total_budget.toLocaleString()}</span>
              <span>Spent: ${b.spent.toLocaleString()}</span>
              <span>{b.total_budget > 0 ? Math.round((b.spent / b.total_budget) * 100) : 0}%</span>
            </div>
            <div className="pb-bar">
              <div className="pb-bar-fill" style={{ width: `${Math.min(100, b.total_budget > 0 ? (b.spent / b.total_budget) * 100 : 0)}%`, background: statusColors[b.status] }} />
            </div>
            {b.line_items.length > 0 && (
              <div className="pb-lines">
                {b.line_items.map((li) => (
                  <div key={li.id} className="pb-line">
                    <span>{li.category}</span>
                    <span>${li.actual.toLocaleString()} / ${li.planned.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
