"use client";

import { useEffect, useState } from "react";

type AutomationRule = {
  id: string;
  name: string;
  trigger: string;
  conditions: { field: string; operator: string; value: string }[];
  actions: { type: string; params: Record<string, string> }[];
  enabled: boolean;
  run_count: number;
  last_run_at: string | null;
};

export default function AutomationEnginePage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("issue_created");

  function load() {
    fetch("/api/automation-engine").then((r) => r.json()).then(setRules);
  }
  useEffect(load, []);

  async function create() {
    if (!name.trim()) return;
    await fetch("/api/automation-engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, trigger }),
    });
    setName("");
    load();
  }

  async function toggle(id: string, enabled: boolean) {
    await fetch("/api/automation-engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, updates: { enabled: !enabled } }),
    });
    load();
  }

  async function execute(id: string) {
    await fetch("/api/automation-engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "execute", id }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch("/api/automation-engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  }

  return (
    <div className="page">
      <h1>Automation Engine</h1>

      <div className="ae-form">
        <input placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={trigger} onChange={(e) => setTrigger(e.target.value)}>
          <option value="issue_created">Issue Created</option>
          <option value="issue_status_changed">Status Changed</option>
          <option value="issue_assigned">Issue Assigned</option>
          <option value="sprint_started">Sprint Started</option>
          <option value="sprint_ended">Sprint Ended</option>
          <option value="milestone_completed">Milestone Completed</option>
          <option value="sla_breached">SLA Breached</option>
        </select>
        <button className="btn btn-gold" onClick={create}>Add Rule</button>
      </div>

      <div className="ae-list">
        {rules.map((r) => (
          <div key={r.id} className={`ae-card ${r.enabled ? "" : "ae-disabled"}`}>
            <div className="ae-header">
              <h3>{r.name}</h3>
              <span className={`pill ${r.enabled ? "pill-green" : "pill-mute"}`}>{r.enabled ? "Active" : "Disabled"}</span>
            </div>
            <div className="ae-meta">
              <span>Trigger: {r.trigger.replace(/_/g, " ")}</span>
              <span>Runs: {r.run_count}</span>
              {r.last_run_at && <span>Last: {new Date(r.last_run_at).toLocaleDateString()}</span>}
            </div>
            {r.conditions.length > 0 && (
              <div className="ae-conditions">
                {r.conditions.map((c, i) => (
                  <span key={i} className="ae-condition">{c.field} {c.operator} {c.value}</span>
                ))}
              </div>
            )}
            {r.actions.length > 0 && (
              <div className="ae-actions-list">
                {r.actions.map((a, i) => (
                  <span key={i} className="ae-action-tag">{a.type}</span>
                ))}
              </div>
            )}
            <div className="ae-actions">
              <button className="btn btn-sm" onClick={() => toggle(r.id, r.enabled)}>{r.enabled ? "Disable" : "Enable"}</button>
              {r.enabled && <button className="btn btn-sm btn-gold" onClick={() => execute(r.id)}>Run</button>}
              <button className="btn btn-sm btn-danger" onClick={() => remove(r.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
