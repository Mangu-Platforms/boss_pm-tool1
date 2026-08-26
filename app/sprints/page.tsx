"use client";

import { useEffect, useState } from "react";

type SprintView = {
  id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: string;
  issue_count: number;
  total: number;
  done: number;
  percent: number;
};

export default function SprintsPage() {
  const [sprints, setSprints] = useState<SprintView[]>([]);
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  useEffect(() => {
    fetch("/api/sprints")
      .then((r) => r.json())
      .then((data) => setSprints(data.sprints || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newStart || !newEnd) return;
    const res = await fetch("/api/sprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), goal: newGoal, start_date: newStart, end_date: newEnd }),
    });
    if (res.ok) {
      setNewName("");
      setNewGoal("");
      setNewStart("");
      setNewEnd("");
      const data = await fetch("/api/sprints").then((r) => r.json());
      setSprints(data.sprints || []);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/sprints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setSprints((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  }

  function daysLeft(endDate: string): number {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <main>
      <div className="kicker">Iterations</div>
      <h1>Sprints</h1>
      <p className="lede">Plan and track fixed-length iterations with goals and velocity.</p>

      <div className="sprint-list">
        {sprints.map((sp) => (
          <div key={sp.id} className={`sprint-card sprint-${sp.status}`}>
            <div className="sprint-header">
              <h2 className="sprint-name">{sp.name}</h2>
              <span className={`status ${sp.status}`}>{sp.status}</span>
            </div>
            {sp.goal && <p className="sprint-goal">{sp.goal}</p>}
            <div className="sprint-meta">
              <span className="hint">{sp.start_date} → {sp.end_date}</span>
              {sp.status === "active" && (
                <span className="hint">
                  {daysLeft(sp.end_date) > 0 ? `${daysLeft(sp.end_date)}d left` : "overdue"}
                </span>
              )}
              <span className="hint">{sp.done}/{sp.total} done</span>
            </div>
            <div className="subtask-bar">
              <div className="subtask-bar-fill" style={{ width: `${sp.percent}%` }} />
            </div>
            <div className="sprint-actions">
              {sp.status === "planning" && (
                <button className="chip chip-sm" onClick={() => handleStatusChange(sp.id, "active")}>
                  Start sprint
                </button>
              )}
              {sp.status === "active" && (
                <button className="chip chip-sm" onClick={() => handleStatusChange(sp.id, "completed")}>
                  Complete sprint
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">New sprint</h2>
      <form className="milestone-form" onSubmit={handleCreate}>
        <input placeholder="Sprint name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <input placeholder="Goal" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} />
        <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} required />
        <input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} required />
        <button className="go" type="submit" disabled={!newName.trim() || !newStart || !newEnd}>Create</button>
      </form>
    </main>
  );
}
