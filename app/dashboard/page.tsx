"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  total_issues: number;
  status_counts: Record<string, number>;
  priority_counts: Record<string, number>;
  agent_assigned: number;
  overdue: number;
  unread_notifications: number;
  active_automations: number;
  sprint: {
    name: string;
    total: number;
    done: number;
    percent: number;
    end_date: string;
  } | null;
  milestones: {
    id: string;
    name: string;
    progress: number;
    due_on: string | null;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <main>
        <div className="kicker">Overview</div>
        <h1>Dashboard</h1>
        <p className="hint">Loading...</p>
      </main>
    );
  }

  const statusOrder = ["backlog", "open", "doing", "done", "cancelled"];
  const priorityOrder = ["critical", "high", "medium", "low"];

  return (
    <main>
      <div className="kicker">Overview</div>
      <h1>Dashboard</h1>
      <p className="lede">At-a-glance view of your project health.</p>

      <div className="dash-stats">
        <DashStat label="Total issues" value={data.total_issues} />
        <DashStat label="Agent tasks" value={data.agent_assigned} accent="engine" />
        <DashStat label="Overdue" value={data.overdue} accent={data.overdue > 0 ? "danger" : undefined} />
        <DashStat label="Unread" value={data.unread_notifications} />
        <DashStat label="Automations" value={data.active_automations} accent="lab" />
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <h3 className="dash-card-title">Status breakdown</h3>
          <div className="dash-bars">
            {statusOrder.map((s) => (
              <div key={s} className="dash-bar-row">
                <span className={`status ${s}`}>{s}</span>
                <div className="dash-bar-track">
                  <div
                    className={`dash-bar-fill dash-bar-${s}`}
                    style={{ width: `${data.total_issues > 0 ? ((data.status_counts[s] || 0) / data.total_issues) * 100 : 0}%` }}
                  />
                </div>
                <span className="dash-bar-count">{data.status_counts[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">Priority distribution</h3>
          <div className="dash-bars">
            {priorityOrder.map((p) => (
              <div key={p} className="dash-bar-row">
                <span className={`priority ${p}`}>{p}</span>
                <div className="dash-bar-track">
                  <div
                    className={`dash-bar-fill dash-bar-${p}`}
                    style={{ width: `${data.total_issues > 0 ? ((data.priority_counts[p] || 0) / data.total_issues) * 100 : 0}%` }}
                  />
                </div>
                <span className="dash-bar-count">{data.priority_counts[p] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {data.sprint && (
          <div className="dash-card">
            <h3 className="dash-card-title">Active sprint</h3>
            <div className="dash-sprint">
              <span className="dash-sprint-name">{data.sprint.name}</span>
              <div className="dash-progress-track">
                <div className="dash-progress-fill" style={{ width: `${data.sprint.percent}%` }} />
              </div>
              <div className="dash-sprint-meta">
                <span>{data.sprint.done}/{data.sprint.total} done ({data.sprint.percent}%)</span>
                <span className="hint">Ends {new Date(data.sprint.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {data.milestones.length > 0 && (
          <div className="dash-card">
            <h3 className="dash-card-title">Active milestones</h3>
            <div className="dash-milestones">
              {data.milestones.map((ms) => (
                <div key={ms.id} className="dash-milestone-row">
                  <span className="dash-milestone-name">{ms.name}</span>
                  <div className="dash-progress-track">
                    <div className="dash-progress-fill" style={{ width: `${ms.progress}%` }} />
                  </div>
                  <span className="dash-bar-count">{ms.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dash-quick-links">
        <h3 className="dash-card-title">Quick links</h3>
        <div className="dash-links-grid">
          <Link href="/board" className="dash-link">Kanban board</Link>
          <Link href="/issues" className="dash-link">All issues</Link>
          <Link href="/sprints" className="dash-link">Sprints</Link>
          <Link href="/milestones" className="dash-link">Milestones</Link>
          <Link href="/analytics" className="dash-link">Analytics</Link>
          <Link href="/inbox" className="dash-link">Inbox</Link>
          <Link href="/search" className="dash-link">Search</Link>
          <Link href="/releases" className="dash-link">Releases</Link>
        </div>
      </div>
    </main>
  );
}

function DashStat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="dash-stat">
      <span className={`dash-stat-value ${accent ? `dash-accent-${accent}` : ""}`}>{value}</span>
      <span className="dash-stat-label">{label}</span>
    </div>
  );
}
