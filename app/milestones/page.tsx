"use client";

import { useEffect, useState } from "react";

type MilestoneView = {
  id: string;
  name: string;
  description: string;
  due_on: string | null;
  status: string;
  issue_count: number;
  done_count: number;
  progress: number;
};

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<MilestoneView[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDue, setNewDue] = useState("");

  useEffect(() => {
    fetch("/api/milestones")
      .then((r) => r.json())
      .then((data) => setMilestones(data.milestones || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDesc, due_on: newDue || null }),
    });
    if (res.ok) {
      setNewName("");
      setNewDesc("");
      setNewDue("");
      const data = await fetch("/api/milestones").then((r) => r.json());
      setMilestones(data.milestones || []);
    }
  }

  async function handleComplete(id: string) {
    await fetch("/api/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "completed" }),
    });
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, status: "completed" } : m));
  }

  return (
    <main>
      <div className="kicker">Goals</div>
      <h1>Milestones</h1>
      <p className="lede">Track progress toward major goals. Link issues to milestones to see completion.</p>

      <div className="milestone-list">
        {milestones.map((ms) => (
          <div key={ms.id} className={`milestone-card ${ms.status !== "active" ? "milestone-done" : ""}`}>
            <div className="milestone-header">
              <h2 className="milestone-name">{ms.name}</h2>
              <span className={`status ${ms.status}`}>{ms.status}</span>
            </div>
            {ms.description && <p className="milestone-desc">{ms.description}</p>}
            <div className="milestone-meta">
              {ms.due_on && <span className="hint">Due: {ms.due_on}</span>}
              <span className="hint">{ms.done_count}/{ms.issue_count} issues done</span>
            </div>
            <div className="subtask-bar">
              <div className="subtask-bar-fill" style={{ width: `${ms.progress}%` }} />
            </div>
            {ms.status === "active" && (
              <button className="chip chip-sm" onClick={() => handleComplete(ms.id)} style={{ marginTop: 8 }}>
                Mark complete
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="section-title">New milestone</h2>
      <form className="milestone-form" onSubmit={handleCreate}>
        <input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
        <input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
        <button className="go" type="submit" disabled={!newName.trim()}>Create</button>
      </form>
    </main>
  );
}
