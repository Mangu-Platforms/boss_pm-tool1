"use client";

import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string;
  status: string;
  uptime_percent: number;
};

type Incident = {
  id: string;
  title: string;
  service_id: string;
  status: string;
  severity: string;
  updates: { message: string; timestamp: string }[];
  created_at: string;
  resolved_at: string | null;
};

const statusColors: Record<string, string> = {
  operational: "green",
  degraded: "gold",
  partial_outage: "orange",
  major_outage: "red",
  maintenance: "blue",
};

const statusLabels: Record<string, string> = {
  operational: "Operational",
  degraded: "Degraded",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
  maintenance: "Maintenance",
};

export default function StatusPageView() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [overall, setOverall] = useState("operational");

  useEffect(() => {
    fetch("/api/status-page")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services || []);
        setIncidents(data.incidents || []);
        setOverall(data.overall || "operational");
      });
  }, []);

  return (
    <main>
      <div className="kicker">Operations</div>
      <h1>Status Page</h1>
      <div className={`status-banner status-banner-${overall}`}>
        {statusLabels[overall] || overall} - All Systems
      </div>

      <h2 className="section-title">Services</h2>
      <div className="status-services">
        {services.map((svc) => (
          <div key={svc.id} className={`status-svc status-svc-${svc.status}`}>
            <div className="status-svc-header">
              <span className={`status-dot status-dot-${svc.status}`} />
              <span className="status-svc-name">{svc.name}</span>
              <span className={`priority ${statusColors[svc.status] || ""}`}>{statusLabels[svc.status] || svc.status}</span>
            </div>
            <p className="hint">{svc.description}</p>
            <span className="mono hint">{svc.uptime_percent}% uptime</span>
          </div>
        ))}
      </div>

      {incidents.length > 0 && (
        <>
          <h2 className="section-title">Incidents</h2>
          <div className="status-incidents">
            {incidents.map((inc) => (
              <div key={inc.id} className={`status-incident status-incident-${inc.severity}`}>
                <div className="status-incident-header">
                  <h3>{inc.title}</h3>
                  <span className={`priority ${inc.severity === "critical" ? "red" : inc.severity === "major" ? "gold" : "mute"}`}>
                    {inc.severity}
                  </span>
                  <span className={`priority ${inc.status === "resolved" ? "green" : "gold"}`}>{inc.status}</span>
                </div>
                <div className="status-updates">
                  {inc.updates.map((u, i) => (
                    <div key={i} className="status-update">
                      <span className="hint">{new Date(u.timestamp).toLocaleString()}</span>
                      <p>{u.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
