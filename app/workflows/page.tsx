"use client";

import { useEffect, useState } from "react";

type Workflow = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  enabled: boolean;
  steps: { id: string; action: string; config: Record<string, unknown>; position: number }[];
  run_count: number;
};

const triggerLabels: Record<string, string> = {
  manual: "Manual",
  issue_created: "Issue Created",
  issue_updated: "Issue Updated",
  status_changed: "Status Changed",
  assignment_changed: "Assignment Changed",
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("manual");

  useEffect(() => {
    fetch("/api/workflows")
      .then((r) => r.json())
      .then((d) => setWorkflows(d.workflows || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim(), trigger, steps: [] }),
    });
    setName("");
    setDescription("");
    const data = await fetch("/api/workflows").then((r) => r.json());
    setWorkflows(data.workflows || []);
  }

  async function handleToggle(id: string, enabled: boolean) {
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, updates: { enabled: !enabled } }),
    });
    const data = await fetch("/api/workflows").then((r) => r.json());
    setWorkflows(data.workflows || []);
  }

  async function handleRun(id: string) {
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run", id }),
    });
    const data = await fetch("/api/workflows").then((r) => r.json());
    setWorkflows(data.workflows || []);
  }

  return (
    <main>
      <div className="kicker">Automation</div>
      <h1>Workflows</h1>
      <p className="lede">Automate repetitive tasks with trigger-based workflows.</p>

      <div className="wfl-list">
        {workflows.map((wf) => (
          <div key={wf.id} className={`wfl-card ${wf.enabled ? "" : "wfl-disabled"}`}>
            <div className="wfl-header">
              <h3>{wf.name}</h3>
              <div className="wfl-actions">
                <button className="btn-sm" onClick={() => handleToggle(wf.id, wf.enabled)}>
                  {wf.enabled ? "Disable" : "Enable"}
                </button>
                <button className="btn-sm" onClick={() => handleRun(wf.id)} disabled={!wf.enabled}>
                  Run
                </button>
              </div>
            </div>
            <p className="hint">{wf.description}</p>
            <div className="wfl-meta">
              <span className="priority mute">{triggerLabels[wf.trigger] || wf.trigger}</span>
              <span className="mono hint">{wf.steps.length} steps</span>
              <span className="mono hint">{wf.run_count} runs</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Create Workflow</h2>
      <form className="wfl-form" onSubmit={handleCreate}>
        <input placeholder="Workflow name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select value={trigger} onChange={(e) => setTrigger(e.target.value)}>
          {Object.entries(triggerLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button className="go" type="submit" disabled={!name.trim()}>Create</button>
      </form>
    </main>
  );
}
