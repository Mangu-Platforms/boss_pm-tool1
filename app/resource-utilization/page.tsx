"use client";

import { useEffect, useState } from "react";

type ResourceEntry = {
  id: string;
  member: string;
  period: string;
  period_start: string;
  available_hours: number;
  assigned_hours: number;
  logged_hours: number;
  utilization_pct: number;
};

type Summary = {
  total_members: number;
  avg_utilization: number;
  over_utilized: number;
  under_utilized: number;
  balanced: number;
};

export default function ResourceUtilizationPage() {
  const [entries, setEntries] = useState<ResourceEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [memberFilter, setMemberFilter] = useState("");

  useEffect(() => {
    const q = memberFilter ? `?member=${memberFilter}` : "";
    fetch(`/api/resource-utilization${q}`).then((r) => r.json()).then(setEntries);
    fetch("/api/resource-utilization?summary").then((r) => r.json()).then(setSummary);
  }, [memberFilter]);

  function barColor(pct: number) {
    if (pct > 90) return "var(--danger)";
    if (pct < 60) return "var(--lab)";
    return "var(--engine)";
  }

  const members = [...new Set(entries.map((e) => e.member))];

  return (
    <div className="page">
      <h1>Resource Utilization</h1>

      {summary && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{summary.total_members}</span><span className="ru-stat-label">Members</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{summary.avg_utilization}%</span><span className="ru-stat-label">Avg Util</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{summary.over_utilized}</span><span className="ru-stat-label">Over</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--engine)" }}>{summary.balanced}</span><span className="ru-stat-label">Balanced</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--lab)" }}>{summary.under_utilized}</span><span className="ru-stat-label">Under</span></div>
        </div>
      )}

      <div className="ru-filters">
        <button className={`rc-filter-btn ${!memberFilter ? "rc-filter-active" : ""}`} onClick={() => setMemberFilter("")}>All</button>
        {members.map((m) => (
          <button key={m} className={`rc-filter-btn ${memberFilter === m ? "rc-filter-active" : ""}`} onClick={() => setMemberFilter(m)}>{m}</button>
        ))}
      </div>

      <table className="ru-table">
        <thead>
          <tr><th>Member</th><th>Period</th><th>Start</th><th>Available</th><th>Assigned</th><th>Logged</th><th>Utilization</th></tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.member}</td>
              <td>{e.period}</td>
              <td>{e.period_start}</td>
              <td>{e.available_hours}h</td>
              <td>{e.assigned_hours}h</td>
              <td>{e.logged_hours}h</td>
              <td>
                <div className="ru-bar-container">
                  <div className="ru-bar" style={{ width: `${Math.min(e.utilization_pct, 100)}%`, background: barColor(e.utilization_pct) }} />
                  <span className="ru-bar-label">{e.utilization_pct}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
