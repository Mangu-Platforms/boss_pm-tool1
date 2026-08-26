"use client";

import { useEffect, useState } from "react";

type KeyResult = { id: string; title: string; current: number; target: number; unit: string };
type Goal = {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: string;
  target_date: string | null;
  progress: number;
  key_results: KeyResult[];
  created_at: string;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((data) => setGoals(data.goals || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), description: newDesc }),
    });
    if (res.ok) {
      setNewTitle("");
      setNewDesc("");
      const data = await fetch("/api/goals").then((r) => r.json());
      setGoals(data.goals || []);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, status }),
    });
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
  }

  const statusColors: Record<string, string> = {
    on_track: "var(--engine)", at_risk: "var(--gold)", behind: "var(--danger)", completed: "var(--mute)",
  };

  return (
    <main>
      <div className="kicker">Strategy</div>
      <h1>Goals & OKRs</h1>
      <p className="lede">Set objectives and track key results to measure progress.</p>

      <div className="goals-list">
        {goals.map((goal) => (
          <div key={goal.id} className={`goal-card ${goal.status === "completed" ? "goal-completed" : ""}`}>
            <div className="goal-header">
              <span className="goal-status-dot" style={{ background: statusColors[goal.status] || "var(--mute)" }} />
              <h3 className="goal-title">{goal.title}</h3>
              <span className="goal-progress">{goal.progress}%</span>
            </div>
            {goal.description && <p className="goal-desc">{goal.description}</p>}

            <div className="dash-progress-track" style={{ marginTop: 8 }}>
              <div className="dash-progress-fill" style={{ width: `${goal.progress}%`, background: statusColors[goal.status] }} />
            </div>

            {goal.key_results.length > 0 && (
              <div className="goal-krs">
                {goal.key_results.map((kr) => (
                  <div key={kr.id} className="goal-kr">
                    <span className="goal-kr-title">{kr.title}</span>
                    <span className="goal-kr-value">{kr.current}/{kr.target} {kr.unit}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="goal-meta">
              <span className="hint">Owner: {goal.owner}</span>
              {goal.target_date && <span className="hint">Due: {new Date(goal.target_date).toLocaleDateString()}</span>}
              <select
                value={goal.status}
                onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                className="goal-status-select"
              >
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="behind">Behind</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">New goal</h2>
      <form className="goal-form" onSubmit={handleCreate}>
        <input placeholder="Goal title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
        <button className="go" type="submit" disabled={!newTitle.trim()}>Create goal</button>
      </form>
    </main>
  );
}
