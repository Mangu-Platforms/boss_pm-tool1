"use client";

import { useEffect, useState } from "react";

type SLAPolicy = {
  id: string;
  name: string;
  priority: string;
  response_hours: number;
  resolution_hours: number;
  business_hours_only: boolean;
  active: boolean;
};

export default function SLAPoliciesPage() {
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [responseHours, setResponseHours] = useState("8");
  const [resolutionHours, setResolutionHours] = useState("48");

  useEffect(() => {
    fetch("/api/sla-policies")
      .then((r) => r.json())
      .then((d) => setPolicies(d.policies || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/sla-policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), priority, response_hours: Number(responseHours), resolution_hours: Number(resolutionHours) }),
    });
    setName("");
    const data = await fetch("/api/sla-policies").then((r) => r.json());
    setPolicies(data.policies || []);
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch("/api/sla-policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, updates: { active: !active } }),
    });
    const data = await fetch("/api/sla-policies").then((r) => r.json());
    setPolicies(data.policies || []);
  }

  return (
    <main>
      <div className="kicker">Service Level</div>
      <h1>SLA Policies</h1>
      <p className="lede">Define response and resolution time targets by priority.</p>

      <div className="slap-list">
        {policies.map((p) => (
          <div key={p.id} className={`slap-card ${p.active ? "" : "slap-inactive"}`}>
            <div className="slap-header">
              <h3>{p.name}</h3>
              <span className={`priority ${p.priority === "critical" ? "red" : p.priority === "high" ? "gold" : "mute"}`}>{p.priority}</span>
            </div>
            <div className="slap-targets">
              <span className="slap-target">Response: <strong>{p.response_hours}h</strong></span>
              <span className="slap-target">Resolution: <strong>{p.resolution_hours}h</strong></span>
              <span className="hint">{p.business_hours_only ? "Business hours" : "24/7"}</span>
            </div>
            <button className="btn-sm" onClick={() => handleToggle(p.id, p.active)}>{p.active ? "Disable" : "Enable"}</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Create Policy</h2>
      <form className="slap-form" onSubmit={handleCreate}>
        <input placeholder="Policy name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input type="number" placeholder="Response (hrs)" value={responseHours} onChange={(e) => setResponseHours(e.target.value)} />
        <input type="number" placeholder="Resolution (hrs)" value={resolutionHours} onChange={(e) => setResolutionHours(e.target.value)} />
        <button className="go" type="submit" disabled={!name.trim()}>Create</button>
      </form>
    </main>
  );
}
