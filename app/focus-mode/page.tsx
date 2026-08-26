"use client";

import { useEffect, useState } from "react";

type FocusSession = { id: string; user_id: string; issue_id: string | null; status: string; duration_minutes: number; pomodoros_completed: number; started_at: string };
type FocusStats = { total_sessions: number; total_pomodoros: number; total_focus_minutes: number };

export default function FocusModePage() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [stats, setStats] = useState<FocusStats | null>(null);

  function load() {
    fetch("/api/focus-mode?user_id=max").then((r) => r.json()).then(setSessions);
    fetch("/api/focus-mode?user_id=max&stats").then((r) => r.json()).then(setStats);
  }
  useEffect(load, []);

  async function startNew() {
    await fetch("/api/focus-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "max", duration_minutes: 25, break_minutes: 5 }),
    });
    load();
  }

  async function complete(id: string) {
    await fetch("/api/focus-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", id }),
    });
    load();
  }

  async function end(id: string) {
    await fetch("/api/focus-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end", id }),
    });
    load();
  }

  return (
    <div className="page">
      <h1>Focus Mode</h1>

      {stats && (
        <div className="fm-stats">
          <div className="fm-stat"><span className="fm-stat-val">{stats.total_pomodoros}</span><span className="fm-stat-label">Pomodoros</span></div>
          <div className="fm-stat"><span className="fm-stat-val">{stats.total_focus_minutes}</span><span className="fm-stat-label">Focus Minutes</span></div>
          <div className="fm-stat"><span className="fm-stat-val">{stats.total_sessions}</span><span className="fm-stat-label">Sessions</span></div>
        </div>
      )}

      <button className="btn btn-gold" onClick={startNew} style={{ marginBottom: 14 }}>Start Focus Session</button>

      <div className="fm-list">
        {sessions.map((s) => (
          <div key={s.id} className={`fm-card fm-${s.status}`}>
            <div className="fm-header">
              <span className="fm-time">{s.duration_minutes} min</span>
              <span className={`pill pill-${s.status === "focusing" ? "gold" : s.status === "break" ? "green" : "mute"}`}>{s.status}</span>
            </div>
            <div className="fm-meta">
              <span>{s.pomodoros_completed} pomodoros</span>
              {s.issue_id && <span>{s.issue_id}</span>}
              <span>{new Date(s.started_at).toLocaleString()}</span>
            </div>
            {s.status === "focusing" && (
              <div className="fm-actions">
                <button className="btn btn-sm btn-gold" onClick={() => complete(s.id)}>Complete</button>
                <button className="btn btn-sm" onClick={() => end(s.id)}>End</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
