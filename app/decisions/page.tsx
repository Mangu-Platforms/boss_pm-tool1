"use client";

import { useEffect, useState } from "react";

type Decision = {
  id: string;
  title: string;
  context: string;
  decision: string;
  consequences: string;
  status: string;
  author: string;
  participants: string[];
  created_at: string;
  decided_at: string | null;
};

const statusColors: Record<string, string> = {
  proposed: "gold",
  accepted: "green",
  rejected: "red",
  superseded: "mute",
};

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newDecision, setNewDecision] = useState("");
  const [newConsequences, setNewConsequences] = useState("");

  useEffect(() => {
    fetch("/api/decisions")
      .then((r) => r.json())
      .then((data) => setDecisions(data.decisions || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), context: newContext, decision: newDecision, consequences: newConsequences }),
    });
    setNewTitle("");
    setNewContext("");
    setNewDecision("");
    setNewConsequences("");
    const data = await fetch("/api/decisions").then((r) => r.json());
    setDecisions(data.decisions || []);
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, status }),
    });
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }

  return (
    <main>
      <div className="kicker">Governance</div>
      <h1>Decision Log (ADR)</h1>
      <p className="lede">Record architectural and product decisions with context, rationale, and consequences.</p>

      <div className="decision-list">
        {decisions.map((d) => (
          <div key={d.id} className={`decision-card decision-${d.status}`}>
            <div className="decision-header">
              <span className="decision-id">{d.id.toUpperCase()}</span>
              <h3 className="decision-title">{d.title}</h3>
              <span className={`priority ${statusColors[d.status] || ""}`}>{d.status}</span>
            </div>

            <div className="decision-sections">
              <div className="decision-section">
                <span className="decision-label">Context</span>
                <p>{d.context}</p>
              </div>
              <div className="decision-section">
                <span className="decision-label">Decision</span>
                <p>{d.decision}</p>
              </div>
              <div className="decision-section">
                <span className="decision-label">Consequences</span>
                <p>{d.consequences}</p>
              </div>
            </div>

            <div className="decision-meta">
              <span className="hint">By {d.author}</span>
              <span className="hint">Participants: {d.participants.join(", ")}</span>
              {d.decided_at && <span className="hint">Decided {new Date(d.decided_at).toLocaleDateString()}</span>}
              <select
                value={d.status}
                onChange={(e) => handleStatusChange(d.id, e.target.value)}
                className="goal-status-select"
              >
                <option value="proposed">Proposed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="superseded">Superseded</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Propose Decision</h2>
      <form className="decision-form" onSubmit={handleCreate}>
        <input placeholder="Decision title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Context: Why is this decision needed?" value={newContext} onChange={(e) => setNewContext(e.target.value)} rows={2} />
        <textarea placeholder="Decision: What are we choosing?" value={newDecision} onChange={(e) => setNewDecision(e.target.value)} rows={2} />
        <textarea placeholder="Consequences: What follows from this?" value={newConsequences} onChange={(e) => setNewConsequences(e.target.value)} rows={2} />
        <button className="go" type="submit" disabled={!newTitle.trim()}>Propose</button>
      </form>
    </main>
  );
}
