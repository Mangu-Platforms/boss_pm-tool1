"use client";

import { useEffect, useState } from "react";

type Epic = {
  id: string;
  name: string;
  description: string;
  color: string;
  status: "active" | "completed" | "archived";
  owner: string;
  issue_count: number;
  created_at: string;
};

export default function EpicsPage() {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#7cffb2");

  useEffect(() => {
    fetch("/api/epics")
      .then((r) => r.json())
      .then((data) => setEpics(data.epics || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/epics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDesc, color: newColor }),
    });
    if (res.ok) {
      setNewName("");
      setNewDesc("");
      const data = await fetch("/api/epics").then((r) => r.json());
      setEpics(data.epics || []);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/epics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, status }),
    });
    setEpics((prev) => prev.map((e) =>
      e.id === id ? { ...e, status: status as Epic["status"] } : e
    ));
  }

  async function handleDelete(id: string) {
    await fetch("/api/epics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setEpics((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main>
      <div className="kicker">Organize</div>
      <h1>Epics</h1>
      <p className="lede">Group related issues into larger initiatives.</p>

      <div className="epic-list">
        {epics.map((epic) => (
          <div key={epic.id} className={`epic-card ${epic.status === "completed" ? "epic-completed" : ""}`}>
            <div className="epic-header">
              <span className="epic-color" style={{ background: epic.color }} />
              <h3 className="epic-name">{epic.name}</h3>
              <span className={`status ${epic.status}`}>{epic.status}</span>
            </div>
            {epic.description && <p className="epic-desc">{epic.description}</p>}
            <div className="epic-meta">
              <span className="hint">{epic.issue_count} issues</span>
              <span className="hint">Owner: {epic.owner}</span>
            </div>
            <div className="epic-actions">
              {epic.status === "active" && (
                <button className="chip chip-sm" onClick={() => handleStatusChange(epic.id, "completed")}>Complete</button>
              )}
              {epic.status === "completed" && (
                <button className="chip chip-sm" onClick={() => handleStatusChange(epic.id, "archived")}>Archive</button>
              )}
              <button className="chip chip-sm danger" onClick={() => handleDelete(epic.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">New epic</h2>
      <form className="epic-form" onSubmit={handleCreate}>
        <div className="epic-form-row">
          <input placeholder="Epic name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="epic-color-input" />
        </div>
        <textarea placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
        <button className="go" type="submit" disabled={!newName.trim()}>Create epic</button>
      </form>
    </main>
  );
}
