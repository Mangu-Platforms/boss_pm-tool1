"use client";

import { useEffect, useState } from "react";

type Allocation = {
  id: string;
  member: string;
  project: string;
  percentage: number;
  start_date: string;
  end_date: string | null;
};

type CapacityEntry = {
  member: string;
  total_hours: number;
  allocated_hours: number;
  available_hours: number;
};

export default function CapacityPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [summary, setSummary] = useState<CapacityEntry[]>([]);
  const [newMember, setNewMember] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newPct, setNewPct] = useState(100);

  useEffect(() => {
    fetch("/api/capacity")
      .then((r) => r.json())
      .then((data) => {
        setAllocations(data.allocations || []);
        setSummary(data.summary || []);
      });
  }, []);

  async function refresh() {
    const data = await fetch("/api/capacity").then((r) => r.json());
    setAllocations(data.allocations || []);
    setSummary(data.summary || []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newMember.trim() || !newProject.trim()) return;
    await fetch("/api/capacity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member: newMember.trim(), project: newProject.trim(), percentage: newPct }),
    });
    setNewMember("");
    setNewProject("");
    setNewPct(100);
    await refresh();
  }

  async function handleDelete(id: string) {
    await fetch("/api/capacity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    await refresh();
  }

  return (
    <main>
      <div className="kicker">Resource Management</div>
      <h1>Capacity Planning</h1>
      <p className="lede">Allocate team members across projects and track utilization.</p>

      <h2 className="section-title">Team Capacity</h2>
      <div className="capacity-summary">
        {summary.map((entry) => {
          const utilization = entry.total_hours > 0 ? (entry.allocated_hours / entry.total_hours) * 100 : 0;
          const over = utilization > 100;
          return (
            <div key={entry.member} className={`capacity-card ${over ? "capacity-over" : ""}`}>
              <h3 className="capacity-name">{entry.member}</h3>
              <div className="capacity-bar-track">
                <div className="capacity-bar-fill" style={{ width: `${Math.min(utilization, 100)}%` }} />
              </div>
              <div className="capacity-stats">
                <span>{entry.allocated_hours}h / {entry.total_hours}h</span>
                <span className={over ? "danger-text" : ""}>{Math.round(utilization)}% utilized</span>
              </div>
              <span className="hint">{entry.available_hours}h available</span>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Allocations</h2>
      <table className="capacity-table">
        <thead>
          <tr><th>Member</th><th>Project</th><th>%</th><th>Start</th><th></th></tr>
        </thead>
        <tbody>
          {allocations.map((a) => (
            <tr key={a.id}>
              <td>{a.member}</td>
              <td>{a.project}</td>
              <td className="mono">{a.percentage}%</td>
              <td className="hint">{a.start_date}</td>
              <td><button className="subtle-btn" onClick={() => handleDelete(a.id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section-title">Add Allocation</h2>
      <form className="capacity-form" onSubmit={handleCreate}>
        <input placeholder="Team member" value={newMember} onChange={(e) => setNewMember(e.target.value)} required />
        <input placeholder="Project" value={newProject} onChange={(e) => setNewProject(e.target.value)} required />
        <input type="number" min={0} max={100} value={newPct} onChange={(e) => setNewPct(Number(e.target.value))} style={{ width: 80 }} />
        <button className="go" type="submit" disabled={!newMember.trim() || !newProject.trim()}>Allocate</button>
      </form>
    </main>
  );
}
