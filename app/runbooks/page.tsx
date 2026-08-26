"use client";

import { useEffect, useState } from "react";

type RunbookStep = { order: number; type: string; title: string; instructions: string; expected_duration_minutes: number };
type Runbook = { id: string; title: string; description: string; service_id: string; severity: string; steps: RunbookStep[]; owner: string; last_used: string | null; times_used: number };

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/runbooks").then((r) => r.json()).then(setRunbooks);
  }, []);

  async function handleExecute(id: string) {
    const res = await fetch("/api/runbooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "execute", id }) });
    if (res.ok) { const updated = await res.json(); setRunbooks((prev) => prev.map((r) => (r.id === id ? updated : r))); }
  }

  const sevColor: Record<string, string> = { "sev-1": "var(--danger)", "sev-2": "var(--gold)", "sev-3": "var(--lab)", "sev-4": "var(--mute)" };
  const stepIcon: Record<string, string> = { manual: "M", automated: "A", decision: "D", notification: "N" };

  return (
    <div className="page">
      <h1>Runbooks</h1>
      <div className="rb-list">
        {runbooks.map((rb) => (
          <div key={rb.id} className="rb-card" style={{ borderLeftColor: sevColor[rb.severity] }}>
            <div className="rb-header" onClick={() => setExpanded(expanded === rb.id ? null : rb.id)}>
              <span className="rb-severity" style={{ color: sevColor[rb.severity] }}>{rb.severity}</span>
              <span className="rb-title">{rb.title}</span>
              <span className="rb-uses">{rb.times_used}x used</span>
              <button className="btn btn-sm btn-gold" onClick={(e) => { e.stopPropagation(); handleExecute(rb.id); }}>Execute</button>
            </div>
            <div className="rb-desc">{rb.description}</div>
            {expanded === rb.id && (
              <div className="rb-steps">
                {rb.steps.map((s) => (
                  <div key={s.order} className="rb-step">
                    <span className="rb-step-icon">{stepIcon[s.type] || "?"}</span>
                    <span className="rb-step-title">{s.title}</span>
                    <span className="rb-step-time">{s.expected_duration_minutes}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
