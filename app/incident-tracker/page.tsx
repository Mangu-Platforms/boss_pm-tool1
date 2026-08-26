"use client";

import { useEffect, useState } from "react";

type IncidentUpdate = { timestamp: string; message: string; author: string };
type Incident = {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  service_ids: string[];
  commander: string;
  updates: IncidentUpdate[];
  started_at: string;
  resolved_at: string | null;
};

type Metrics = { total: number; open: number; mttr_minutes: number; by_severity: Record<string, number> };

export default function IncidentTrackerPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/incident-tracker").then((r) => r.json()).then(setIncidents);
    fetch("/api/incident-tracker?metrics").then((r) => r.json()).then(setMetrics);
  }, []);

  const sevColor: Record<string, string> = { "sev-1": "var(--danger)", "sev-2": "var(--gold)", "sev-3": "var(--lab)", "sev-4": "var(--mute)" };
  const statusColor: Record<string, string> = { detected: "var(--danger)", investigating: "var(--gold)", mitigating: "var(--lab)", resolved: "var(--engine)", postmortem: "var(--mute)" };

  return (
    <div className="page">
      <h1>Incident Tracker</h1>

      {metrics && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{metrics.total}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{metrics.open}</span><span className="ru-stat-label">Open</span></div>
          <div className="ru-stat"><span className="ru-stat-val">{metrics.mttr_minutes}m</span><span className="ru-stat-label">Avg MTTR</span></div>
        </div>
      )}

      <div className="it-list">
        {incidents.map((inc) => (
          <div key={inc.id} className="it-card" style={{ borderLeftColor: sevColor[inc.severity] || "var(--line)" }}>
            <div className="it-header" onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}>
              <span className="it-severity" style={{ color: sevColor[inc.severity] }}>{inc.severity}</span>
              <span className="it-title">{inc.title}</span>
              <span className="it-status" style={{ color: statusColor[inc.status] }}>{inc.status}</span>
              <span className="it-cmd">{inc.commander}</span>
            </div>
            {expanded === inc.id && (
              <div className="it-detail">
                <div className="it-desc">{inc.description}</div>
                <div className="it-timeline">
                  {inc.updates.map((u, i) => (
                    <div key={i} className="it-update">
                      <span className="it-update-time">{new Date(u.timestamp).toLocaleTimeString()}</span>
                      <span className="it-update-msg">{u.message}</span>
                      <span className="it-update-author">{u.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
