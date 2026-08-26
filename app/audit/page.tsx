"use client";

import { useEffect, useState } from "react";

type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  created_at: string;
};

const actionColors: Record<string, string> = {
  create: "green",
  update: "gold",
  delete: "red",
  login: "blue",
  export: "mute",
  import: "mute",
};

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filterActor, setFilterActor] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterActor) params.set("actor", filterActor);
    if (filterAction) params.set("action", filterAction);
    fetch(`/api/audit?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
      });
  }, [filterActor, filterAction]);

  return (
    <main>
      <div className="kicker">Compliance</div>
      <h1>Audit Log</h1>
      <p className="lede">Complete record of actions taken in the workspace. {total} total entries.</p>

      <div className="audit-filters">
        <input placeholder="Filter by actor..." value={filterActor} onChange={(e) => setFilterActor(e.target.value)} className="audit-filter-input" />
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="goal-status-select">
          <option value="">All actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="export">Export</option>
          <option value="import">Import</option>
        </select>
      </div>

      <div className="audit-list">
        {entries.map((e) => (
          <div key={e.id} className="audit-entry">
            <span className={`priority ${actionColors[e.action] || ""}`}>{e.action}</span>
            <span className="audit-actor">{e.actor}</span>
            <span className="audit-details">{e.details}</span>
            <span className="audit-resource">{e.resource_type}/{e.resource_id}</span>
            <span className="hint">{new Date(e.created_at).toLocaleString()}</span>
          </div>
        ))}
        {entries.length === 0 && <p className="hint">No audit entries match the filters.</p>}
      </div>
    </main>
  );
}
