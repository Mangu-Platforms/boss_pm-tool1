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
  };
  github_links: number;
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
            <span>{stats.issues.agent_assigned} active agents</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>GitHub Links</h3>
          <div className="analytics-big">{stats.github_links}</div>
          <div className="analytics-breakdown">
            <span>synced issues</span>
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

      <div className="export-row">
        <a href="/api/export?format=json" className="chip" data-on="true">Export JSON</a>
        <a href="/api/export?format=csv" className="chip">Export CSV</a>
      </div>
    </main>
  );
}
