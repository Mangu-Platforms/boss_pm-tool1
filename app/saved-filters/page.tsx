"use client";

import { useEffect, useState } from "react";

type SavedFilter = {
  id: string;
  name: string;
  entity: string;
  conditions: { field: string; operator: string; value: unknown }[];
  owner: string;
  is_shared: boolean;
};

export default function SavedFiltersPage() {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [name, setName] = useState("");
  const [entity, setEntity] = useState("issues");

  useEffect(() => {
    fetch("/api/saved-filters")
      .then((r) => r.json())
      .then((d) => setFilters(d.filters || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/saved-filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), entity, conditions: [], owner: "max" }),
    });
    setName("");
    const data = await fetch("/api/saved-filters").then((r) => r.json());
    setFilters(data.filters || []);
  }

  async function handleDelete(id: string) {
    await fetch("/api/saved-filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const data = await fetch("/api/saved-filters").then((r) => r.json());
    setFilters(data.filters || []);
  }

  return (
    <main>
      <div className="kicker">Views</div>
      <h1>Saved Filters</h1>
      <p className="lede">Quick access to your saved search filters.</p>

      <div className="sf-list">
        {filters.map((f) => (
          <div key={f.id} className="sf-card">
            <div className="sf-header">
              <h3>{f.name}</h3>
              <div className="sf-badges">
                <span className="priority mute">{f.entity}</span>
                {f.is_shared && <span className="priority green">Shared</span>}
              </div>
            </div>
            <div className="sf-meta">
              <span className="hint">Owner: {f.owner}</span>
              <span className="hint">{f.conditions.length} conditions</span>
            </div>
            {f.conditions.length > 0 && (
              <div className="sf-conditions">
                {f.conditions.map((c, i) => (
                  <span key={i} className="sf-cond">{c.field} {c.operator} {JSON.stringify(c.value)}</span>
                ))}
              </div>
            )}
            <button className="btn-sm danger" onClick={() => handleDelete(f.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Create Filter</h2>
      <form className="sf-form" onSubmit={handleCreate}>
        <input placeholder="Filter name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="issues">Issues</option>
          <option value="products">Products</option>
          <option value="milestones">Milestones</option>
          <option value="sprints">Sprints</option>
        </select>
        <button className="go" type="submit" disabled={!name.trim()}>Save</button>
      </form>
    </main>
  );
}
