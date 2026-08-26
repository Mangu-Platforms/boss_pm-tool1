"use client";

import { useEffect, useState } from "react";

type CloneResult = { original_id: string; cloned_id: string; title: string };
type SimpleIssue = { id: string; title: string; status: string; priority: string };

export default function IssueClonePage() {
  const [issues, setIssues] = useState<SimpleIssue[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [prefix, setPrefix] = useState("[Clone]");
  const [results, setResults] = useState<CloneResult[]>([]);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then(setIssues);
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleClone() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    const body = ids.length === 1
      ? { issue_id: ids[0], options: { prefix } }
      : { action: "bulk", issue_ids: ids, options: { prefix } };
    const res = await fetch("/api/issue-cloning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setResults(ids.length === 1 ? [data] : data);
      setSelected(new Set());
    }
  }

  return (
    <div className="page">
      <h1>Issue Cloning</h1>

      <div className="ic-toolbar">
        <input className="ic-prefix" placeholder="Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
        <button className="btn btn-gold" onClick={handleClone} disabled={selected.size === 0}>
          Clone {selected.size > 0 ? `(${selected.size})` : ""}
        </button>
      </div>

      {results.length > 0 && (
        <div className="ic-results">
          <h3>Cloned Issues</h3>
          {results.map((r) => (
            <div key={r.cloned_id} className="ic-result">
              <span className="ic-result-title">{r.title}</span>
              <span className="ic-result-id">{r.cloned_id.slice(0, 8)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="ic-list">
        {issues.map((issue) => (
          <div key={issue.id} className={`ic-item ${selected.has(issue.id) ? "ic-selected" : ""}`} onClick={() => toggle(issue.id)}>
            <input type="checkbox" checked={selected.has(issue.id)} readOnly />
            <span className="ic-issue-title">{issue.title}</span>
            <span className={`priority-${issue.priority}`}>{issue.priority}</span>
            <span className="ic-status">{issue.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
