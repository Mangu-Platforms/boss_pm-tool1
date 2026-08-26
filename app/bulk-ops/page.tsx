"use client";

import { useEffect, useState } from "react";

type BulkOp = {
  id: string;
  action: string;
  issue_ids: string[];
  params: Record<string, unknown>;
  results: { id: string; success: boolean; error?: string }[];
  created_at: string;
};

export default function BulkOpsPage() {
  const [history, setHistory] = useState<BulkOp[]>([]);
  const [action, setAction] = useState("update_status");
  const [issueIds, setIssueIds] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    fetch("/api/bulk-ops")
      .then((r) => r.json())
      .then((d) => setHistory(d.operations || []));
  }, []);

  async function handleExecute(e: React.FormEvent) {
    e.preventDefault();
    const ids = issueIds.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0 || !value.trim()) return;
    const body: Record<string, unknown> = { action, issue_ids: ids };
    if (action === "update_status") body.status = value;
    else if (action === "update_priority") body.priority = value;
    else if (action === "assign") body.assignee_user = value;
    await fetch("/api/bulk-ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setIssueIds("");
    setValue("");
    const data = await fetch("/api/bulk-ops").then((r) => r.json());
    setHistory(data.operations || []);
  }

  return (
    <main>
      <div className="kicker">Operations</div>
      <h1>Bulk Operations</h1>
      <p className="lede">Apply changes to multiple issues at once.</p>

      <h2 className="section-title">Execute Bulk Operation</h2>
      <form className="bo-form" onSubmit={handleExecute}>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="update_status">Update Status</option>
          <option value="update_priority">Update Priority</option>
          <option value="assign">Assign</option>
        </select>
        <input placeholder="Issue IDs (comma separated)" value={issueIds} onChange={(e) => setIssueIds(e.target.value)} required />
        <input placeholder={action === "assign" ? "Assignee" : "Value"} value={value} onChange={(e) => setValue(e.target.value)} required />
        <button className="go" type="submit">Execute</button>
      </form>

      <h2 className="section-title">History</h2>
      <div className="bo-list">
        {history.length === 0 && <p className="hint">No operations yet.</p>}
        {history.map((op) => {
          const succeeded = op.results.filter((r) => r.success).length;
          const failed = op.results.length - succeeded;
          return (
            <div key={op.id} className="bo-card">
              <div className="bo-header">
                <span className="bo-action">{op.action.replace(/_/g, " ")}</span>
                <span className="mono hint">{new Date(op.created_at).toLocaleString()}</span>
              </div>
              <div className="bo-meta">
                <span className="hint">{op.issue_ids.length} issues</span>
                <span className="priority green">{succeeded} succeeded</span>
                {failed > 0 && <span className="priority red">{failed} failed</span>}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
