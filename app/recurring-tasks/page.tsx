"use client";

import { useState, useEffect } from "react";

type RecurringTask = {
  id: string;
  title: string;
  body: string;
  priority: string;
  assignee: string;
  pattern: string;
  next_due: string;
  last_created_at: string | null;
  active: boolean;
};

export default function RecurringTasksPage() {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [title, setTitle] = useState("");
  const [pattern, setPattern] = useState("weekly");
  const [assignee, setAssignee] = useState("");
  const [nextDue, setNextDue] = useState("");

  async function load() {
    const r = await fetch("/api/recurring-tasks");
    setTasks(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!title || !nextDue) return;
    await fetch("/api/recurring-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, pattern, assignee, next_due: nextDue }),
    });
    setTitle(""); setPattern("weekly"); setAssignee(""); setNextDue("");
    load();
  }

  async function trigger(id: string) {
    await fetch("/api/recurring-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trigger", id }),
    });
    load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/recurring-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, updates: { active: !active } }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch("/api/recurring-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  }

  return (
    <main className="main">
      <h1>Recurring Tasks</h1>

      <div className="rect-form">
        <input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select value={pattern} onChange={(e) => setPattern(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
        <input placeholder="Assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
        <input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
        <button onClick={create}>Create</button>
      </div>

      <div className="rect-list">
        {tasks.map((t) => (
          <div key={t.id} className={`rect-card ${!t.active ? "rect-inactive" : ""}`}>
            <div className="rect-header">
              <h3>{t.title}</h3>
              <span className={`badge badge-${t.active ? "active" : "resolved"}`}>{t.active ? "Active" : "Paused"}</span>
            </div>
            <div className="rect-meta">
              <span>{t.pattern}</span>
              <span>Next: {t.next_due}</span>
              {t.assignee && <span>Assignee: {t.assignee}</span>}
            </div>
            <div className="rect-actions">
              <button className="btn-sm" onClick={() => trigger(t.id)}>Trigger Now</button>
              <button className="btn-sm" onClick={() => toggle(t.id, t.active)}>{t.active ? "Pause" : "Resume"}</button>
              <button className="btn-sm btn-danger" onClick={() => remove(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
