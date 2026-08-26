"use client";

import { useState, useEffect } from "react";

type MetricAlert = {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  current_value: number | null;
  status: string;
  triggered_at: string | null;
  notifiers: string[];
  created_at: string;
};

export default function MetricAlertsPage() {
  const [alerts, setAlerts] = useState<MetricAlert[]>([]);
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("");
  const [condition, setCondition] = useState("gt");
  const [threshold, setThreshold] = useState(0);
  const [notifiers, setNotifiers] = useState("");

  async function load() {
    const r = await fetch("/api/metric-alerts");
    setAlerts(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!name || !metric) return;
    await fetch("/api/metric-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, metric, condition, threshold, notifiers: notifiers.split(",").map((s) => s.trim()).filter(Boolean) }),
    });
    setName(""); setMetric(""); setCondition("gt"); setThreshold(0); setNotifiers("");
    load();
  }

  async function ack(id: string) {
    await fetch("/api/metric-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "acknowledge", id }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch("/api/metric-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  }

  return (
    <main className="main">
      <h1>Metric Alerts</h1>

      <div className="ma-form">
        <input placeholder="Alert name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Metric key" value={metric} onChange={(e) => setMetric(e.target.value)} />
        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="gt">&gt;</option>
          <option value="lt">&lt;</option>
          <option value="eq">=</option>
          <option value="gte">&ge;</option>
          <option value="lte">&le;</option>
        </select>
        <input type="number" placeholder="Threshold" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
        <input placeholder="Notifiers (comma-sep)" value={notifiers} onChange={(e) => setNotifiers(e.target.value)} />
        <button onClick={create}>Create Alert</button>
      </div>

      <div className="ma-grid">
        {alerts.map((a) => (
          <div key={a.id} className={`ma-card ma-status-${a.status}`}>
            <div className="ma-header">
              <h3>{a.name}</h3>
              <span className={`badge badge-${a.status}`}>{a.status}</span>
            </div>
            <div className="ma-metric">{a.metric}</div>
            <div className="ma-condition">
              {a.condition} {a.threshold} — Current: {a.current_value ?? "N/A"}
            </div>
            {a.triggered_at && <div className="ma-triggered">Triggered: {new Date(a.triggered_at).toLocaleString()}</div>}
            <div className="ma-notifiers">Notify: {a.notifiers.join(", ") || "none"}</div>
            <div className="ma-actions">
              {a.status === "triggered" && <button className="btn-sm" onClick={() => ack(a.id)}>Acknowledge</button>}
              <button className="btn-sm btn-danger" onClick={() => remove(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
