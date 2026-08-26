"use client";

import { useEffect, useState } from "react";

type TimeEntry = {
  id: string;
  issue_id: string;
  member: string;
  hours: number;
  description: string;
  date: string;
};

export default function TimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [issueId, setIssueId] = useState("");
  const [member, setMember] = useState("");
  const [hours, setHours] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [filterMember, setFilterMember] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  function loadEntries() {
    const params = filterMember ? `?member=${filterMember}` : "";
    fetch(`/api/time-entries${params}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!issueId.trim() || !member.trim() || !hours || !date) return;
    await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_id: issueId.trim(), member: member.trim(), hours: Number(hours), description: desc, date }),
    });
    setIssueId("");
    setMember("");
    setHours("");
    setDesc("");
    setDate("");
    loadEntries();
  }

  async function handleDelete(id: string) {
    await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const totalHrs = entries.reduce((sum, e) => sum + e.hours, 0);

  return (
    <main>
      <div className="kicker">Tracking</div>
      <h1>Time Entries</h1>
      <p className="lede">Log hours spent on issues. Total: <strong>{totalHrs}h</strong> logged.</p>

      <div className="te-filters">
        <input
          className="te-filter-input"
          placeholder="Filter by member..."
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadEntries()}
        />
        <button className="subtle-btn" onClick={loadEntries}>Filter</button>
      </div>

      <div className="te-list">
        {entries.length === 0 && <p className="hint">No time entries yet.</p>}
        {entries.map((entry) => (
          <div key={entry.id} className="te-card">
            <div className="te-header">
              <span className="te-issue mono">{entry.issue_id}</span>
              <span className="te-member">{entry.member}</span>
              <span className="te-hours">{entry.hours}h</span>
              <span className="mono hint">{entry.date}</span>
            </div>
            {entry.description && <p className="te-desc">{entry.description}</p>}
            <button className="subtle-btn" onClick={() => handleDelete(entry.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Log Time</h2>
      <form className="te-form" onSubmit={handleCreate}>
        <input placeholder="Issue ID (e.g. BOSS-1)" value={issueId} onChange={(e) => setIssueId(e.target.value)} required />
        <input placeholder="Member" value={member} onChange={(e) => setMember(e.target.value)} required />
        <input type="number" step="0.25" min="0.25" placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button className="go" type="submit">Log</button>
      </form>
    </main>
  );
}
