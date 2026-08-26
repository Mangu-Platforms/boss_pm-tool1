"use client";

import { useEffect, useState } from "react";

type PlanningIssue = { id: string; title: string; priority: string; assignee_user: string | null; story_points: number; status: string };
type Stats = { total_backlog: number; total_sprints: number; active_sprints: number };

export default function SprintPlanningPage() {
  const [backlog, setBacklog] = useState<PlanningIssue[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/sprint-planning?backlog").then((r) => r.json()).then(setBacklog);
    fetch("/api/sprint-planning?stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <div className="page">
      <h1>Sprint Planning</h1>

      {stats && (
        <div className="sp-stats">
          <div className="sp-stat">
            <span className="sp-stat-val">{stats.total_backlog}</span>
            <span className="sp-stat-label">Backlog Items</span>
          </div>
          <div className="sp-stat">
            <span className="sp-stat-val">{stats.active_sprints}</span>
            <span className="sp-stat-label">Active Sprints</span>
          </div>
          <div className="sp-stat">
            <span className="sp-stat-val">{stats.total_sprints}</span>
            <span className="sp-stat-label">Total Sprints</span>
          </div>
        </div>
      )}

      <h2>Backlog</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Assignee</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {backlog.map((i) => (
            <tr key={i.id}>
              <td className="mono">{i.id}</td>
              <td>{i.title}</td>
              <td><span className={`pill pill-${i.priority}`}>{i.priority}</span></td>
              <td>{i.assignee_user || "—"}</td>
              <td>{i.story_points}</td>
            </tr>
          ))}
          {backlog.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--mute)" }}>Backlog is empty</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
