"use client";

import { useEffect, useState } from "react";

type Widget = { id: string; type: string; title: string; config: Record<string, string>; position: { w: number; h: number } };
type Dashboard = { id: string; name: string; description: string; owner: string; widgets: Widget[]; is_default: boolean };

export default function CustomDashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [name, setName] = useState("");

  function load() {
    fetch("/api/custom-dashboards").then((r) => r.json()).then(setDashboards);
  }
  useEffect(load, []);

  async function create() {
    if (!name.trim()) return;
    await fetch("/api/custom-dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  }

  async function setDefault(id: string) {
    await fetch("/api/custom-dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, updates: { is_default: true } }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch("/api/custom-dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  }

  return (
    <div className="page">
      <h1>Custom Dashboards</h1>

      <div className="cd-form">
        <input placeholder="Dashboard name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-gold" onClick={create}>Create</button>
      </div>

      <div className="cd-grid">
        {dashboards.map((d) => (
          <div key={d.id} className={`cd-card ${d.is_default ? "cd-default" : ""}`}>
            <div className="cd-header">
              <h3>{d.name}</h3>
              {d.is_default && <span className="pill pill-gold">Default</span>}
            </div>
            {d.description && <p className="cd-desc">{d.description}</p>}
            <div className="cd-meta">
              <span>{d.widgets.length} widget{d.widgets.length !== 1 ? "s" : ""}</span>
              <span>Owner: {d.owner}</span>
            </div>
            {d.widgets.length > 0 && (
              <div className="cd-widgets">
                {d.widgets.map((w) => (
                  <span key={w.id} className="cd-widget-tag">{w.title}</span>
                ))}
              </div>
            )}
            <div className="cd-actions">
              {!d.is_default && <button className="btn btn-sm" onClick={() => setDefault(d.id)}>Set Default</button>}
              <button className="btn btn-sm btn-danger" onClick={() => remove(d.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
