"use client";

import { useEffect, useState } from "react";

type CostEntry = {
  id: string;
  issue_id: string;
  category: string;
  amount_cents: number;
  description: string;
  recorded_by: string;
};

type CostSummary = {
  total_cents: number;
  by_category: Record<string, number>;
  entry_count: number;
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CostTrackingPage() {
  const [entries, setEntries] = useState<CostEntry[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [issueId, setIssueId] = useState("");
  const [category, setCategory] = useState("development");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/cost-tracking")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries || []));
    fetch("/api/cost-tracking?view=summary")
      .then((r) => r.json())
      .then((d) => setSummary(d.summary || null));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!issueId.trim() || !amount) return;
    await fetch("/api/cost-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_id: issueId.trim(), category, amount_cents: Math.round(Number(amount) * 100), description: description.trim() }),
    });
    setIssueId("");
    setAmount("");
    setDescription("");
    const [eData, sData] = await Promise.all([
      fetch("/api/cost-tracking").then((r) => r.json()),
      fetch("/api/cost-tracking?view=summary").then((r) => r.json()),
    ]);
    setEntries(eData.entries || []);
    setSummary(sData.summary || null);
  }

  return (
    <main>
      <div className="kicker">Finance</div>
      <h1>Cost Tracking</h1>
      <p className="lede">Track costs associated with issues and projects.</p>

      {summary && (
        <div className="ct-summary">
          <div className="ct-total">
            <span className="ct-total-label">Total Costs</span>
            <span className="ct-total-amount">{formatCents(summary.total_cents)}</span>
          </div>
          <div className="ct-breakdown">
            {Object.entries(summary.by_category).map(([cat, cents]) => (
              <div key={cat} className="ct-cat">
                <span className="ct-cat-name">{cat}</span>
                <span className="mono">{formatCents(cents)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="cte-list">
        {entries.map((e) => (
          <div key={e.id} className="cte-card">
            <div className="cte-header">
              <span className="mono hint">{e.issue_id}</span>
              <span className="priority mute">{e.category}</span>
              <span className="cte-amount">{formatCents(e.amount_cents)}</span>
            </div>
            <p className="hint">{e.description}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Record Cost</h2>
      <form className="cte-form" onSubmit={handleCreate}>
        <input placeholder="Issue ID" value={issueId} onChange={(e) => setIssueId(e.target.value)} required />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="development">Development</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="licensing">Licensing</option>
          <option value="support">Support</option>
          <option value="other">Other</option>
        </select>
        <input type="number" step="0.01" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="go" type="submit" disabled={!issueId.trim() || !amount}>Record</button>
      </form>
    </main>
  );
}
