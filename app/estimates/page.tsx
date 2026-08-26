"use client";

import { useEffect, useState } from "react";

type Estimate = {
  id: string;
  issue_id: string;
  value: number;
  unit: string;
  estimated_by: string;
};

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [issueId, setIssueId] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("points");
  const [estimatedBy, setEstimatedBy] = useState("");

  useEffect(() => {
    loadEstimates();
  }, []);

  function loadEstimates() {
    fetch("/api/estimates")
      .then((r) => r.json())
      .then((data) => setEstimates(data.estimates || []));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!issueId.trim() || !value || !estimatedBy.trim()) return;
    await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_id: issueId.trim(), value: Number(value), unit, estimated_by: estimatedBy.trim() }),
    });
    setIssueId("");
    setValue("");
    setEstimatedBy("");
    loadEstimates();
  }

  async function handleDelete(id: string) {
    await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setEstimates((prev) => prev.filter((e) => e.id !== id));
  }

  const totalPoints = estimates.filter((e) => e.unit === "points").reduce((s, e) => s + e.value, 0);

  return (
    <main>
      <div className="kicker">Planning</div>
      <h1>Estimates</h1>
      <p className="lede">Track effort estimates for issues. Total: <strong>{totalPoints} pts</strong></p>

      <div className="est-list">
        {estimates.length === 0 && <p className="hint">No estimates yet.</p>}
        {estimates.map((est) => (
          <div key={est.id} className="est-card">
            <span className="est-issue mono">{est.issue_id}</span>
            <span className="est-value">{est.value} {est.unit}</span>
            <span className="hint">by {est.estimated_by}</span>
            <button className="subtle-btn" onClick={() => handleDelete(est.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Estimate</h2>
      <form className="est-form" onSubmit={handleCreate}>
        <input placeholder="Issue ID" value={issueId} onChange={(e) => setIssueId(e.target.value)} required />
        <input type="number" min="0.5" step="0.5" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} required />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="points">Points</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
        <input placeholder="Estimated by" value={estimatedBy} onChange={(e) => setEstimatedBy(e.target.value)} required />
        <button className="go" type="submit">Add</button>
      </form>
    </main>
  );
}
