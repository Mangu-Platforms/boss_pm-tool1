"use client";

import { useEffect, useState } from "react";

type Approval = {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  requested_by: string;
  approvers: string[];
  status: string;
  decided_by: string | null;
  notes: string;
};

const statusColors: Record<string, string> = { pending: "gold", approved: "green", rejected: "red" };

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [title, setTitle] = useState("");
  const [entityType, setEntityType] = useState("issue");
  const [entityId, setEntityId] = useState("");
  const [approvers, setApprovers] = useState("");

  useEffect(() => {
    fetch("/api/approvals")
      .then((r) => r.json())
      .then((d) => setApprovals(d.approvals || []));
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !entityId.trim()) return;
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), entity_type: entityType, entity_id: entityId.trim(), approvers: approvers.split(",").map((s) => s.trim()).filter(Boolean) }),
    });
    setTitle("");
    setEntityId("");
    setApprovers("");
    const data = await fetch("/api/approvals").then((r) => r.json());
    setApprovals(data.approvals || []);
  }

  async function handleDecide(id: string, decision: "approved" | "rejected") {
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decide", id, decision, decided_by: "max" }),
    });
    const data = await fetch("/api/approvals").then((r) => r.json());
    setApprovals(data.approvals || []);
  }

  return (
    <main>
      <div className="kicker">Governance</div>
      <h1>Approvals</h1>
      <p className="lede">Request and manage approval gates for releases and changes.</p>

      <div className="apv-list">
        {approvals.map((a) => (
          <div key={a.id} className={`apv-card apv-${a.status}`}>
            <div className="apv-header">
              <h3>{a.title}</h3>
              <span className={`priority ${statusColors[a.status] || "mute"}`}>{a.status}</span>
            </div>
            <div className="apv-meta">
              <span className="hint">{a.entity_type}: {a.entity_id}</span>
              <span className="hint">By: {a.requested_by}</span>
              <span className="hint">Approvers: {a.approvers.join(", ")}</span>
            </div>
            {a.notes && <p className="apv-notes">{a.notes}</p>}
            {a.status === "pending" && (
              <div className="apv-actions">
                <button className="btn-sm" onClick={() => handleDecide(a.id, "approved")}>Approve</button>
                <button className="btn-sm danger" onClick={() => handleDecide(a.id, "rejected")}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="section-title">Request Approval</h2>
      <form className="apv-form" onSubmit={handleRequest}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
          <option value="issue">Issue</option>
          <option value="release">Release</option>
          <option value="milestone">Milestone</option>
          <option value="sprint">Sprint</option>
        </select>
        <input placeholder="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} required />
        <input placeholder="Approvers (comma separated)" value={approvers} onChange={(e) => setApprovers(e.target.value)} />
        <button className="go" type="submit" disabled={!title.trim() || !entityId.trim()}>Request</button>
      </form>
    </main>
  );
}
