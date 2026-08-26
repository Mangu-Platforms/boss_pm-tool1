"use client";

import { useEffect, useState } from "react";

type ChangeRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requester: string;
  reviewer: string | null;
  affected_systems: string[];
  risk_level: string;
  rollback_plan: string;
  submitted_at: string;
};

export default function ChangeRequestsPage() {
  const [crs, setCrs] = useState<ChangeRequest[]>([]);
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("feature");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/change-requests${q}`).then((r) => r.json()).then(setCrs);
  }, [filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/change-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, category, priority, rollback_plan: "Revert changes" }),
    });
    if (res.ok) {
      const cr = await res.json();
      setCrs((prev) => [cr, ...prev]);
      setTitle("");
      setDesc("");
    }
  }

  async function handleApprove(id: string) {
    const res = await fetch("/api/change-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, updates: { status: "approved", reviewer: "max" } }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCrs((prev) => prev.map((cr) => (cr.id === id ? updated : cr)));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/change-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) setCrs((prev) => prev.filter((cr) => cr.id !== id));
  }

  const riskColor: Record<string, string> = { low: "var(--engine)", medium: "var(--gold)", high: "var(--danger)" };
  const statusColor: Record<string, string> = { draft: "var(--mute)", submitted: "var(--lab)", under_review: "var(--gold)", approved: "var(--engine)", rejected: "var(--danger)", implemented: "var(--ink-3)" };

  return (
    <div className="page">
      <h1>Change Requests</h1>

      <div className="rc-filters">
        {["", "draft", "submitted", "under_review", "approved", "rejected", "implemented"].map((s) => (
          <button key={s} className={`rc-filter-btn ${filter === s ? "rc-filter-active" : ""}`} onClick={() => setFilter(s)}>{s ? s.replace("_", " ") : "All"}</button>
        ))}
      </div>

      <div className="cr-list">
        {crs.map((cr) => (
          <div key={cr.id} className="cr-card" style={{ borderLeftColor: statusColor[cr.status] || "var(--line)" }}>
            <div className="cr-header">
              <span className="cr-title">{cr.title}</span>
              <span className="cr-category">{cr.category}</span>
            </div>
            <div className="cr-desc">{cr.description}</div>
            <div className="cr-meta">
              <span className={`priority-${cr.priority}`}>{cr.priority}</span>
              <span className="cr-risk" style={{ color: riskColor[cr.risk_level] }}>Risk: {cr.risk_level}</span>
              <span>{cr.requester}</span>
              <span className="cr-status" style={{ color: statusColor[cr.status] }}>{cr.status.replace("_", " ")}</span>
            </div>
            {cr.affected_systems.length > 0 && (
              <div className="cr-systems">{cr.affected_systems.map((s, i) => <span key={i} className="rc-feature-tag">{s}</span>)}</div>
            )}
            <div className="cr-actions">
              {cr.status !== "approved" && cr.status !== "implemented" && (
                <button className="btn btn-sm btn-gold" onClick={() => handleApprove(cr.id)}>Approve</button>
              )}
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cr.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <form className="rc-form" onSubmit={handleCreate}>
        <h3>New Change Request</h3>
        <div className="rc-form-row">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} required />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="feature">Feature</option>
            <option value="bugfix">Bugfix</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="process">Process</option>
            <option value="security">Security</option>
          </select>
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
