"use client";

import { useEffect, useState } from "react";

type AgentStats = {
  summary: { total_agent_tasks: number; total_cap_cents: number; active: number };
  by_agent: Record<string, { tasks: number; total_cap_cents: number; active: number; done: number }>;
  by_product: { name: string; tasks: number; cap_cents: number }[];
};

export default function AgentsPage() {
  const [stats, setStats] = useState<AgentStats | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <main><p className="empty">Loading agent data...</p></main>;

  const agents = Object.entries(stats.by_agent);
  const capDollars = (stats.summary.total_cap_cents / 100).toFixed(2);

  return (
    <main>
      <div className="kicker">Agent Control</div>
      <h1>Agents</h1>
      <p className="lede">Track agent assignments, budgets, and task completion across the portfolio.</p>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-value">{stats.summary.total_agent_tasks}</span>
          <span className="stat-label">Total tasks</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.summary.active}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat">
          <span className="stat-value">${capDollars}</span>
          <span className="stat-label">Total budget</span>
        </div>
      </div>

      <h2 className="section-title">By Agent</h2>
      <div className="agent-cards">
        {agents.map(([name, data]) => (
          <div key={name} className="agent-card">
            <div className="agent-card-header">
              <span className="agent-badge">{name}</span>
              <span className="hint">{data.tasks} tasks</span>
            </div>
            <div className="agent-card-stats">
              <div className="agent-stat">
                <span className="agent-stat-value">${(data.total_cap_cents / 100).toFixed(2)}</span>
                <span className="agent-stat-label">Budget</span>
              </div>
              <div className="agent-stat">
                <span className="agent-stat-value">{data.active}</span>
                <span className="agent-stat-label">Active</span>
              </div>
              <div className="agent-stat">
                <span className="agent-stat-value">{data.done}</span>
                <span className="agent-stat-label">Done</span>
              </div>
            </div>
            <div className="agent-progress">
              <div
                className="agent-progress-fill"
                style={{ width: `${data.tasks ? (data.done / data.tasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">By Product</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Agent Tasks</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            {stats.by_product.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.tasks}</td>
                <td className="cap-cell">${(p.cap_cents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
