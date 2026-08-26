"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedView = {
  id: string;
  name: string;
  filters: Record<string, string>;
  sort?: string;
  created_at: string;
};

export default function ViewsPage() {
  const [views, setViews] = useState<SavedView[]>([]);
  const [newName, setNewName] = useState("");
  const [filterField, setFilterField] = useState("status");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    fetch("/api/views")
      .then((r) => r.json())
      .then((data) => setViews(data.views || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const filters: Record<string, string> = {};
    if (filterValue.trim()) filters[filterField] = filterValue.trim();
    const res = await fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), filters }),
    });
    if (res.ok) {
      setNewName("");
      setFilterValue("");
      const data = await fetch("/api/views").then((r) => r.json());
      setViews(data.views || []);
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/views", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setViews((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <main>
      <div className="kicker">Organize</div>
      <h1>Saved Views</h1>
      <p className="lede">Create filtered views to quickly access specific sets of issues.</p>

      <div className="views-list">
        {views.map((view) => (
          <div key={view.id} className="view-card">
            <div className="view-header">
              <h3 className="view-name">{view.name}</h3>
              <button className="chip chip-sm danger" onClick={() => handleDelete(view.id)}>Remove</button>
            </div>
            <div className="view-filters">
              {Object.entries(view.filters).map(([k, v]) => (
                <span key={k} className="view-filter-chip">{k}: {v}</span>
              ))}
              {view.sort && <span className="view-filter-chip">sort: {view.sort}</span>}
            </div>
            <Link href={`/issues?${new URLSearchParams(view.filters as Record<string, string>).toString()}`} className="chip chip-sm go" style={{ marginTop: 8 }}>
              Apply view
            </Link>
          </div>
        ))}
      </div>

      <h2 className="section-title">New view</h2>
      <form className="view-form" onSubmit={handleCreate}>
        <input placeholder="View name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <div className="view-form-row">
          <select value={filterField} onChange={(e) => setFilterField(e.target.value)}>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="assignee">Assignee</option>
            <option value="product">Product</option>
            <option value="label">Label</option>
          </select>
          <input placeholder="Filter value" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
        </div>
        <button className="go" type="submit" disabled={!newName.trim()}>Create view</button>
      </form>
    </main>
  );
}
