"use client";

import { useEffect, useState } from "react";

type AuditEntry = { id: string; actor: string; action: string; resource_type: string; resource_id: string; details: string; ip_address: string; timestamp: string };

export default function AuditTrailsPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [actorFilter, setActorFilter] = useState("");

  useEffect(() => {
    const q = actorFilter ? `?actor=${actorFilter}` : "";
    fetch(`/api/audit-trails${q}`).then((r) => r.json()).then(setEntries);
  }, [actorFilter]);

  const actionColor: Record<string, string> = { create: "var(--engine)", update: "var(--gold)", delete: "var(--danger)", login: "var(--lab)", logout: "var(--mute)", permission_change: "var(--danger)", export: "var(--gold)", api_access: "var(--mute)" };
  const actors = ["", "max", "sami", "alex", "pat", "system"];

  return (
    <div className="page">
      <h1>Audit Trails</h1>
      <div className="rc-filters">
        {actors.map((a) => (
          <button key={a} className={`rc-filter-btn ${actorFilter === a ? "rc-filter-active" : ""}`} onClick={() => setActorFilter(a)}>{a || "All"}</button>
        ))}
      </div>
      <table className="ru-table">
        <thead>
          <tr><th>Time</th><th>Actor</th><th>Action</th><th>Resource</th><th>Details</th><th>IP</th></tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td style={{ fontSize: 11, fontFamily: "var(--mono)" }}>{new Date(e.timestamp).toLocaleString()}</td>
              <td>{e.actor}</td>
              <td style={{ color: actionColor[e.action] }}>{e.action}</td>
              <td>{e.resource_type}: {e.resource_id}</td>
              <td style={{ fontSize: 12 }}>{e.details}</td>
              <td style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--mono)" }}>{e.ip_address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
