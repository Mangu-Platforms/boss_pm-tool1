"use client";

import { useEffect, useState } from "react";

type Dependency = {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  created_at: string;
};

const typeLabels: Record<string, string> = {
  blocks: "Blocks",
  blocked_by: "Blocked by",
  relates_to: "Relates to",
  duplicates: "Duplicates",
};

const typeColors: Record<string, string> = {
  blocks: "red",
  blocked_by: "gold",
  relates_to: "mute",
  duplicates: "blue",
};

export default function DependenciesPage() {
  const [deps, setDeps] = useState<Dependency[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [type, setType] = useState("blocks");

  useEffect(() => {
    fetch("/api/dependencies")
      .then((r) => r.json())
      .then((data) => setDeps(data.dependencies || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceId.trim() || !targetId.trim()) return;
    const res = await fetch("/api/dependencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id: sourceId.trim(), target_id: targetId.trim(), type }),
    });
    if (res.ok) {
      setSourceId("");
      setTargetId("");
      const data = await fetch("/api/dependencies").then((r) => r.json());
      setDeps(data.dependencies || []);
    }
  }

  async function handleRemove(id: string) {
    await fetch("/api/dependencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", id }),
    });
    setDeps((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <main>
      <div className="kicker">Planning</div>
      <h1>Dependencies</h1>
      <p className="lede">Track blocking relationships and links between issues.</p>

      <div className="dep-list">
        {deps.length === 0 && <p className="hint">No dependencies defined yet.</p>}
        {deps.map((d) => (
          <div key={d.id} className="dep-card">
            <span className="dep-source mono">{d.source_id}</span>
            <span className={`priority ${typeColors[d.type] || "mute"}`}>{typeLabels[d.type] || d.type}</span>
            <span className="dep-target mono">{d.target_id}</span>
            <button className="subtle-btn" onClick={() => handleRemove(d.id)}>Remove</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Dependency</h2>
      <form className="dep-form" onSubmit={handleCreate}>
        <input placeholder="Source issue ID" value={sourceId} onChange={(e) => setSourceId(e.target.value)} required />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="blocks">Blocks</option>
          <option value="blocked_by">Blocked by</option>
          <option value="relates_to">Relates to</option>
          <option value="duplicates">Duplicates</option>
        </select>
        <input placeholder="Target issue ID" value={targetId} onChange={(e) => setTargetId(e.target.value)} required />
        <button className="go" type="submit" disabled={!sourceId.trim() || !targetId.trim()}>Add</button>
      </form>
    </main>
  );
}
