"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SlaIssue = {
  issue_id: string;
  title: string;
  priority: string;
  status: string;
  response_deadline: string;
  resolution_deadline: string;
  response_breached: boolean;
  resolution_breached: boolean;
  response_time_remaining: { hours: number; minutes: number; overdue: boolean };
  resolution_time_remaining: { hours: number; minutes: number; overdue: boolean };
};

type SlaData = {
  policies: { priority: string; response_hours: number; resolution_hours: number }[];
  statuses: SlaIssue[];
  summary: { total: number; breached: number; at_risk: number; healthy: number };
};

export default function SlaPage() {
  const [data, setData] = useState<SlaData | null>(null);
  const [filter, setFilter] = useState<"all" | "breached" | "at_risk">("all");

  useEffect(() => {
    fetch("/api/sla")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <main>
        <div className="kicker">Compliance</div>
        <h1>SLA Tracker</h1>
        <p className="hint">Loading...</p>
      </main>
    );
  }

  const filtered = filter === "breached"
    ? data.statuses.filter((s) => s.response_breached || s.resolution_breached)
    : filter === "at_risk"
    ? data.statuses.filter((s) =>
        !s.response_breached && !s.resolution_breached &&
        (s.response_time_remaining.hours < 1 || s.resolution_time_remaining.hours < 2))
    : data.statuses;

  return (
    <main>
      <div className="kicker">Compliance</div>
      <h1>SLA Tracker</h1>
      <p className="lede">Monitor response and resolution times against SLA policies.</p>

      <div className="dash-stats" style={{ marginBottom: 20 }}>
        <div className="dash-stat">
          <span className="dash-stat-value">{data.summary.total}</span>
          <span className="dash-stat-label">Active</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-value dash-accent-danger">{data.summary.breached}</span>
          <span className="dash-stat-label">Breached</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-value" style={{ color: "var(--gold)" }}>{data.summary.at_risk}</span>
          <span className="dash-stat-label">At Risk</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-value dash-accent-engine">{data.summary.healthy}</span>
          <span className="dash-stat-label">Healthy</span>
        </div>
      </div>

      <div className="sla-policies">
        <h2 className="section-title">Policies</h2>
        <div className="sla-policy-grid">
          {data.policies.map((p) => (
            <div key={p.priority} className="sla-policy-card">
              <span className={`priority ${p.priority}`}>{p.priority}</span>
              <div className="sla-policy-times">
                <span>Response: {p.response_hours}h</span>
                <span>Resolution: {p.resolution_hours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="filters" style={{ marginTop: 20 }}>
        {(["all", "breached", "at_risk"] as const).map((v) => (
          <button key={v} className="chip" data-on={filter === v} onClick={() => setFilter(v)}>
            {v === "all" ? "All" : v === "breached" ? "Breached" : "At Risk"}
          </button>
        ))}
      </div>

      <div className="sla-list">
        {filtered.map((s) => (
          <Link key={s.issue_id} href={`/issues/${s.issue_id}`} className="sla-item">
            <div className="sla-item-header">
              <span className={`priority ${s.priority}`}>{s.priority}</span>
              <span className="sla-item-title">{s.title}</span>
              <span className={`status ${s.status}`}>{s.status}</span>
            </div>
            <div className="sla-item-deadlines">
              <span className={s.response_breached ? "sla-breached" : ""}>
                Response: {formatRemaining(s.response_time_remaining)}
              </span>
              <span className={s.resolution_breached ? "sla-breached" : ""}>
                Resolution: {formatRemaining(s.resolution_time_remaining)}
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="empty">No issues match this filter.</p>}
      </div>
    </main>
  );
}

function formatRemaining(t: { hours: number; minutes: number; overdue: boolean }): string {
  if (t.overdue) return `${t.hours}h ${t.minutes}m overdue`;
  return `${t.hours}h ${t.minutes}m remaining`;
}
