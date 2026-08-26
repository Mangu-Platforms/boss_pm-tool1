"use client";

import { useEffect, useState } from "react";

type Risk = {
  id: string;
  title: string;
  description: string;
  likelihood: string;
  impact: string;
  status: string;
  owner: string;
  mitigation: string;
};

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLikelihood, setNewLikelihood] = useState("medium");
  const [newImpact, setNewImpact] = useState("medium");

  useEffect(() => {
    fetch("/api/risks")
      .then((r) => r.json())
      .then((data) => setRisks(data.risks || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch("/api/risks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), description: newDesc, likelihood: newLikelihood, impact: newImpact }),
    });
    if (res.ok) {
      setNewTitle("");
      setNewDesc("");
      const data = await fetch("/api/risks").then((r) => r.json());
      setRisks(data.risks || []);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/risks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, status }),
    });
    setRisks((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  }

  return (
    <main>
      <div className="kicker">Governance</div>
      <h1>Risk Register</h1>
      <p className="lede">Identify, assess, and track mitigation of project risks.</p>

      <div className="risk-list">
        {risks.map((risk) => (
          <div key={risk.id} className={`risk-card risk-${risk.status}`}>
            <div className="risk-header">
              <h3 className="risk-title">{risk.title}</h3>
              <span className={`priority ${risk.impact}`}>{risk.impact} impact</span>
            </div>
            {risk.description && <p className="risk-desc">{risk.description}</p>}
            <div className="risk-meta">
              <span className="hint">Likelihood: {risk.likelihood}</span>
              <span className="hint">Owner: {risk.owner}</span>
              <select
                value={risk.status}
                onChange={(e) => handleStatusChange(risk.id, e.target.value)}
                className="goal-status-select"
              >
                <option value="open">Open</option>
                <option value="mitigating">Mitigating</option>
                <option value="mitigated">Mitigated</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            {risk.mitigation && (
              <div className="risk-mitigation">
                <span className="risk-mitigation-label">Mitigation:</span> {risk.mitigation}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="section-title">Register new risk</h2>
      <form className="risk-form" onSubmit={handleCreate}>
        <input placeholder="Risk title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} />
        <div className="risk-form-row">
          <label>
            Likelihood
            <select value={newLikelihood} onChange={(e) => setNewLikelihood(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <label>
            Impact
            <select value={newImpact} onChange={(e) => setNewImpact(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </div>
        <button className="go" type="submit" disabled={!newTitle.trim()}>Register risk</button>
      </form>
    </main>
  );
}
