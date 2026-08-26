"use client";

import { useEffect, useState } from "react";

type Feedback = {
  id: string;
  type: string;
  title: string;
  body: string;
  submitter: string;
  status: string;
  votes: number;
  tags: string[];
  created_at: string;
};

const typeLabels: Record<string, string> = {
  feature_request: "Feature Request",
  bug_report: "Bug Report",
  praise: "Praise",
  complaint: "Complaint",
  suggestion: "Suggestion",
};

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newType, setNewType] = useState("feature_request");

  useEffect(() => {
    const url = filter ? `/api/feedback?status=${filter}` : "/api/feedback";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setItems(data.feedback || []));
  }, [filter]);

  async function refresh() {
    const url = filter ? `/api/feedback?status=${filter}` : "/api/feedback";
    const data = await fetch(url).then((r) => r.json());
    setItems(data.feedback || []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newType, title: newTitle.trim(), body: newBody }),
    });
    setNewTitle("");
    setNewBody("");
    await refresh();
  }

  async function handleVote(id: string) {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vote", id }),
    });
    await refresh();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, status }),
    });
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  }

  return (
    <main>
      <div className="kicker">Product</div>
      <h1>Feedback Board</h1>
      <p className="lede">Collect, prioritize, and act on user feedback.</p>

      <div className="feedback-filters">
        {["", "new", "reviewed", "planned", "implemented", "wont_do"].map((s) => (
          <button key={s} className={`filter-chip ${filter === s ? "filter-chip-active" : ""}`} onClick={() => setFilter(s)}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="feedback-list">
        {items.map((fb) => (
          <div key={fb.id} className="feedback-card">
            <div className="feedback-header">
              <span className={`feedback-type feedback-type-${fb.type}`}>{typeLabels[fb.type] || fb.type}</span>
              <h3 className="feedback-title">{fb.title}</h3>
            </div>
            {fb.body && <p className="feedback-body">{fb.body}</p>}
            <div className="feedback-meta">
              <button className="retro-vote-btn" onClick={() => handleVote(fb.id)}>+{fb.votes}</button>
              <span className="hint">{fb.submitter}</span>
              {fb.tags.map((t) => (
                <span key={t} className="feedback-tag">{t}</span>
              ))}
              <select
                value={fb.status}
                onChange={(e) => handleStatusChange(fb.id, e.target.value)}
                className="goal-status-select"
              >
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="planned">Planned</option>
                <option value="implemented">Implemented</option>
                <option value="wont_do">Won&apos;t Do</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Submit Feedback</h2>
      <form className="feedback-form" onSubmit={handleCreate}>
        <select value={newType} onChange={(e) => setNewType(e.target.value)}>
          <option value="feature_request">Feature Request</option>
          <option value="bug_report">Bug Report</option>
          <option value="praise">Praise</option>
          <option value="complaint">Complaint</option>
          <option value="suggestion">Suggestion</option>
        </select>
        <input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Details..." value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={2} />
        <button className="go" type="submit" disabled={!newTitle.trim()}>Submit</button>
      </form>
    </main>
  );
}
