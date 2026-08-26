"use client";

import { useEffect, useState } from "react";

type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
  position: number;
};

type Checklist = {
  id: string;
  issue_id: string;
  title: string;
  items: ChecklistItem[];
};

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newIssueId, setNewIssueId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newItems, setNewItems] = useState("");
  const [addItemText, setAddItemText] = useState<Record<string, string>>({});

  useEffect(() => {
    loadChecklists();
  }, []);

  function loadChecklists() {
    fetch("/api/checklists")
      .then((r) => r.json())
      .then((data) => setChecklists(data.checklists || []));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newIssueId.trim() || !newTitle.trim()) return;
    const items = newItems.split("\n").map((s) => s.trim()).filter(Boolean);
    await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_id: newIssueId.trim(), title: newTitle.trim(), items }),
    });
    setNewIssueId("");
    setNewTitle("");
    setNewItems("");
    loadChecklists();
  }

  async function handleToggle(checklistId: string, itemId: string) {
    await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", checklist_id: checklistId, item_id: itemId }),
    });
    loadChecklists();
  }

  async function handleAddItem(checklistId: string) {
    const text = addItemText[checklistId]?.trim();
    if (!text) return;
    await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_item", checklist_id: checklistId, text }),
    });
    setAddItemText((prev) => ({ ...prev, [checklistId]: "" }));
    loadChecklists();
  }

  async function handleDelete(id: string) {
    await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setChecklists((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <main>
      <div className="kicker">Tracking</div>
      <h1>Checklists</h1>
      <p className="lede">Task checklists attached to issues for tracking sub-tasks.</p>

      <div className="cl-list">
        {checklists.length === 0 && <p className="hint">No checklists yet.</p>}
        {checklists.map((cl) => {
          const checked = cl.items.filter((i) => i.checked).length;
          const pct = cl.items.length > 0 ? Math.round((checked / cl.items.length) * 100) : 0;
          return (
            <div key={cl.id} className="cl-card">
              <div className="cl-header">
                <h3>{cl.title}</h3>
                <span className="mono hint">{cl.issue_id}</span>
                <span className="cl-progress">{checked}/{cl.items.length} ({pct}%)</span>
                <button className="subtle-btn" onClick={() => handleDelete(cl.id)}>Delete</button>
              </div>
              <div className="cl-progress-bar">
                <div className="cl-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="cl-items">
                {cl.items.map((item) => (
                  <label key={item.id} className={`cl-item ${item.checked ? "cl-item-done" : ""}`}>
                    <input type="checkbox" checked={item.checked} onChange={() => handleToggle(cl.id, item.id)} />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
              <div className="cl-add-item">
                <input
                  placeholder="Add item..."
                  value={addItemText[cl.id] || ""}
                  onChange={(e) => setAddItemText((prev) => ({ ...prev, [cl.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem(cl.id))}
                />
                <button className="subtle-btn" onClick={() => handleAddItem(cl.id)}>Add</button>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Create Checklist</h2>
      <form className="cl-form" onSubmit={handleCreate}>
        <input placeholder="Issue ID (e.g. BOSS-1)" value={newIssueId} onChange={(e) => setNewIssueId(e.target.value)} required />
        <input placeholder="Checklist title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Items (one per line)" value={newItems} onChange={(e) => setNewItems(e.target.value)} rows={4} />
        <button className="go" type="submit" disabled={!newIssueId.trim() || !newTitle.trim()}>Create</button>
      </form>
    </main>
  );
}
