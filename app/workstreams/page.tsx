"use client";

import { useEffect, useState } from "react";

type Workstream = {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  owner: string;
  issue_ids: string[];
  progress: number;
  start_date: string;
  target_date: string | null;
};

export default function WorkstreamsPage() {
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [filter, setFilter] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/workstreams${q}`).then((r) => r.json()).then(setWorkstreams);
  }, [filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/workstreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc, priority, start_date: new Date().toISOString().slice(0, 10) }),
    });
    if (res.ok) {
      const ws = await res.json();
      setWorkstreams((prev) => [...prev, ws].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setDesc("");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/workstreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) setWorkstreams((prev) => prev.filter((w) => w.id !== id));
  }

  const statusColor: Record<string, string> = { active: "var(--engine)", paused: "var(--gold)", completed: "var(--lab)", archived: "var(--mute)" };

  return (
    <div className="page">
      <h1>Workstreams</h1>

      <div className="rc-filters">
        {["", "active", "paused", "completed", "archived"].map((s) => (
          <button key={s} className={`rc-filter-btn ${filter === s ? "rc-filter-active" : ""}`} onClick={() => setFilter(s)}>{s || "All"}</button>
        ))}
      </div>

      <div className="ws-grid">
        {workstreams.map((ws) => (
          <div key={ws.id} className="ws-card" style={{ borderLeftColor: statusColor[ws.status] || "var(--line)" }}>
            <div className="ws-card-header">
              <span className="ws-name">{ws.name}</span>
              <span className={`priority-${ws.priority}`}>{ws.priority}</span>
            </div>
            <div className="ws-desc">{ws.description}</div>
            <div className="ws-progress-container">
              <div className="ws-progress-bar" style={{ width: `${ws.progress}%` }} />
              <span className="ws-progress-label">{ws.progress}%</span>
            </div>
            <div className="ws-meta">
              <span>{ws.owner}</span>
              <span>{ws.issue_ids.length} issues</span>
              <span style={{ color: statusColor[ws.status] }}>{ws.status}</span>
            </div>
            <div className="ws-dates">{ws.start_date} &rarr; {ws.target_date || "TBD"}</div>
            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ws.id)}>Delete</button>
          </div>
        ))}
      </div>

      <form className="rc-form" onSubmit={handleCreate}>
        <h3>New Workstream</h3>
        <div className="rc-form-row">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} required />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button type="submit" className="btn btn-gold">Create</button>
        </div>
      </form>
    </div>
  );
}
