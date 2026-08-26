"use client";

import { useEffect, useState } from "react";

type Widget = {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; w: number; h: number };
};

type Dashboard = {
  id: string;
  name: string;
  owner: string;
  is_default: boolean;
  widgets: Widget[];
};

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/dashboards")
      .then((r) => r.json())
      .then((d) => setDashboards(d.dashboards || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setName("");
    const data = await fetch("/api/dashboards").then((r) => r.json());
    setDashboards(data.dashboards || []);
  }

  async function handleDelete(id: string) {
    await fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const data = await fetch("/api/dashboards").then((r) => r.json());
    setDashboards(data.dashboards || []);
  }

  return (
    <main>
      <div className="kicker">Analytics</div>
      <h1>Dashboards</h1>
      <p className="lede">Custom dashboards with configurable widgets.</p>

      <div className="dash-list">
        {dashboards.map((d) => (
          <div key={d.id} className="dash-card">
            <div className="dash-header">
              <h3>{d.name}</h3>
              <div className="dash-badges">
                {d.is_default && <span className="priority gold">Default</span>}
                <span className="hint">{d.widgets.length} widgets</span>
              </div>
            </div>
            <div className="dash-widgets">
              {d.widgets.map((w) => (
                <div key={w.id} className="dash-widget">
                  <span className="dash-widget-type">{w.type}</span>
                  <span className="dash-widget-title">{w.title}</span>
                </div>
              ))}
            </div>
            {!d.is_default && <button className="btn-sm danger" onClick={() => handleDelete(d.id)}>Delete</button>}
          </div>
        ))}
      </div>

      <h2 className="section-title">Create Dashboard</h2>
      <form className="dash-form" onSubmit={handleCreate}>
        <input placeholder="Dashboard name" value={name} onChange={(e) => setName(e.target.value)} required />
        <button className="go" type="submit" disabled={!name.trim()}>Create</button>
      </form>
    </main>
  );
}
