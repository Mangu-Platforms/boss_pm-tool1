"use client";

import { useEffect, useState } from "react";

type Stats = {
  products: { total: number; cash_engine: number; lab: number };
  issues: {
    total: number;
    open: number;
    agent_assigned: number;
    total_cap_cents: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_assignee_kind: Record<string, number>;
  };
  github_links: number;
  velocity: { done_count: number; avg_days_to_close: number | null };
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <main><p className="empty">Loading analytics...</p></main>;

  const capDollars = (stats.issues.total_cap_cents / 100).toFixed(2);
  const statuses = Object.entries(stats.issues.by_status);
  const priorities = Object.entries(stats.issues.by_priority || {});
  const assignees = Object.entries(stats.issues.by_assignee_kind || {});

  return (
    <main>
      <div className="kicker">Intelligence</div>
      <h1>Analytics</h1>
      <p className="lede">Portfolio health at a glance. All Mangu products, one view.</p>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Products</h3>
          <div className="analytics-big">{stats.products.total}</div>
          <div className="analytics-breakdown">
            <span className="engine">{stats.products.cash_engine} cash engines</span>
            <span className="lab">{stats.products.lab} labs</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Issues</h3>
          <div className="analytics-big">{stats.issues.total}</div>
          <div className="analytics-breakdown">
            <span>{stats.issues.open} active</span>
            <span>{stats.issues.agent_assigned} agent-assigned</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Agent Budget</h3>
          <div className="analytics-big">${capDollars}</div>
          <div className="analytics-breakdown">
            <span>total committed cap</span>
            <span>{stats.issues.agent_assigned} agents</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Velocity</h3>
          <div className="analytics-big">{stats.velocity?.done_count || 0}</div>
          <div className="analytics-breakdown">
            <span>completed</span>
            {stats.velocity?.avg_days_to_close != null && (
              <span>{stats.velocity.avg_days_to_close}d avg</span>
            )}
          </div>
        </div>
      </div>

      <h2 className="section-title">Status Distribution</h2>
      <div className="status-bars">
        {statuses.map(([status, count]) => (
          <div key={status} className="status-bar-row">
            <span className="status-bar-label">{status}</span>
            <div className="status-bar-track">
              <div
                className={`status-bar-fill status-bar-${status}`}
                style={{ width: `${stats.issues.total ? (count / stats.issues.total) * 100 : 0}%` }}
              />
            </div>
            <span className="status-bar-count">{count}</span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Priority Breakdown</h2>
      <div className="status-bars">
        {priorities.map(([priority, count]) => (
          <div key={priority} className="status-bar-row">
            <span className="status-bar-label">{priority}</span>
            <div className="status-bar-track">
              <div
                className={`status-bar-fill priority-bar-${priority}`}
                style={{ width: `${stats.issues.total ? (count / stats.issues.total) * 100 : 0}%` }}
              />
            </div>
            <span className="status-bar-count">{count}</span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Assignee Split</h2>
      <div className="assignee-split">
        {assignees.map(([kind, count]) => (
          <div key={kind} className="assignee-split-item">
            <div className="assignee-split-bar" style={{ flex: count }} data-kind={kind} />
            <span className="assignee-split-label">{kind}: {count}</span>
          </div>
        ))}
      </div>

      <div className="export-row">
        <a href="/api/export?format=json" className="chip" data-on="true">Export JSON</a>
        <a href="/api/export?format=csv" className="chip">Export CSV</a>
      </div>
    </main>
  );
}
