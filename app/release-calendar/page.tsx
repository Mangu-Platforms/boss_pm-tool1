"use client";

import { useEffect, useState } from "react";

type CalendarRelease = {
  id: string;
  version: string;
  name: string;
  type: string;
  status: string;
  planned_date: string;
  actual_date: string | null;
  owner: string;
  features: string[];
};

export default function ReleaseCalendarPage() {
  const [releases, setReleases] = useState<CalendarRelease[]>([]);
  const [version, setVersion] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("minor");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(`/api/release-calendar${filter ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then(setReleases);
  }, [filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/release-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, name, type, planned_date: date }),
    });
    if (res.ok) {
      const r = await res.json();
      setReleases((prev) => [...prev, r].sort((a, b) => a.planned_date.localeCompare(b.planned_date)));
      setVersion("");
      setName("");
      setDate("");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/release-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) setReleases((prev) => prev.filter((r) => r.id !== id));
  }

  const statusColor: Record<string, string> = {
    planned: "var(--mute)",
    in_progress: "var(--lab)",
    released: "var(--engine)",
    cancelled: "var(--danger)",
  };

  const typeLabel: Record<string, string> = {
    major: "Major",
    minor: "Minor",
    patch: "Patch",
    hotfix: "Hotfix",
  };

  return (
    <div className="page">
      <h1>Release Calendar</h1>

      <div className="rc-filters">
        {["", "planned", "in_progress", "released", "cancelled"].map((s) => (
          <button key={s} className={`rc-filter-btn ${filter === s ? "rc-filter-active" : ""}`} onClick={() => setFilter(s)}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="rc-grid">
        {releases.map((r) => (
          <div key={r.id} className="rc-card" style={{ borderLeftColor: statusColor[r.status] || "var(--line)" }}>
            <div className="rc-card-header">
              <span className="rc-version">{r.version}</span>
              <span className="rc-type">{typeLabel[r.type] || r.type}</span>
            </div>
            <div className="rc-name">{r.name}</div>
            <div className="rc-meta">
              <span>{r.planned_date}</span>
              {r.actual_date && <span> &rarr; {r.actual_date}</span>}
              <span className="rc-owner">{r.owner}</span>
            </div>
            <div className="rc-status" style={{ color: statusColor[r.status] }}>{r.status.replace("_", " ")}</div>
            {r.features.length > 0 && (
              <div className="rc-features">{r.features.map((f, i) => <span key={i} className="rc-feature-tag">{f}</span>)}</div>
            )}
            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
          </div>
        ))}
      </div>

      <form className="rc-form" onSubmit={handleCreate}>
        <h3>Add Release</h3>
        <div className="rc-form-row">
          <input placeholder="Version (e.g. 3.0.0)" value={version} onChange={(e) => setVersion(e.target.value)} required />
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
            <option value="patch">Patch</option>
            <option value="hotfix">Hotfix</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button type="submit" className="btn btn-gold">Add</button>
        </div>
      </form>
    </div>
  );
}
