"use client";

import { useEffect, useState } from "react";

type Automation = {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  conditions: { field: string; operator: string; value: string }[];
  actions: { type: string; value: string }[];
};

const TRIGGERS = [
  "issue_created",
  "status_changed",
  "priority_changed",
  "assignee_changed",
  "label_added",
  "due_date_passed",
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState(TRIGGERS[0]);
  const [condField, setCondField] = useState("priority");
  const [condOp, setCondOp] = useState("equals");
  const [condValue, setCondValue] = useState("");
  const [actionType, setActionType] = useState("set_status");
  const [actionValue, setActionValue] = useState("");

  useEffect(() => {
    fetch("/api/automations")
      .then((r) => r.json())
      .then((data) => setAutomations(data.automations || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !actionValue.trim()) return;
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        trigger: newTrigger,
        conditions: condValue ? [{ field: condField, operator: condOp, value: condValue }] : [],
        actions: [{ type: actionType, value: actionValue.trim() }],
      }),
    });
    if (res.ok) {
      setNewName("");
      setCondValue("");
      setActionValue("");
      const data = await fetch("/api/automations").then((r) => r.json());
      setAutomations(data.automations || []);
    }
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    await fetch("/api/automations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, enabled: !enabled } : a));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/automations?id=${id}`, { method: "DELETE" });
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <main>
      <div className="kicker">Workflow</div>
      <h1>Automations</h1>
      <p className="lede">Define rules to automate actions when triggers fire.</p>

      <div className="auto-list">
        {automations.map((auto) => (
          <div key={auto.id} className={`auto-card ${!auto.enabled ? "auto-disabled" : ""}`}>
            <div className="auto-header">
              <button
                className={`auto-toggle ${auto.enabled ? "auto-on" : ""}`}
                type="button"
                onClick={() => toggleEnabled(auto.id, auto.enabled)}
              />
              <h3 className="auto-name">{auto.name}</h3>
              <button className="relation-remove" type="button" onClick={() => handleDelete(auto.id)}>×</button>
            </div>
            <div className="auto-detail">
              <span className="auto-trigger">When: {auto.trigger.replace(/_/g, " ")}</span>
              {auto.conditions.length > 0 && (
                <span className="auto-cond">
                  If: {auto.conditions.map((c) => `${c.field} ${c.operator} "${c.value}"`).join(", ")}
                </span>
              )}
              <span className="auto-actions">
                Then: {auto.actions.map((a) => `${a.type.replace(/_/g, " ")} → ${a.value}`).join(", ")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">New automation</h2>
      <form className="auto-form" onSubmit={handleCreate}>
        <input placeholder="Rule name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <select value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)}>
          {TRIGGERS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </select>
        <div className="auto-form-row">
          <span className="hint">If:</span>
          <input placeholder="field" value={condField} onChange={(e) => setCondField(e.target.value)} />
          <select value={condOp} onChange={(e) => setCondOp(e.target.value)}>
            <option value="equals">equals</option>
            <option value="not_equals">not equals</option>
            <option value="contains">contains</option>
          </select>
          <input placeholder="value" value={condValue} onChange={(e) => setCondValue(e.target.value)} />
        </div>
        <div className="auto-form-row">
          <span className="hint">Then:</span>
          <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
            <option value="set_status">set status</option>
            <option value="set_priority">set priority</option>
            <option value="add_label">add label</option>
            <option value="assign_to">assign to</option>
            <option value="notify">notify</option>
            <option value="move_to_sprint">move to sprint</option>
          </select>
          <input placeholder="action value" value={actionValue} onChange={(e) => setActionValue(e.target.value)} required />
        </div>
        <button className="go" type="submit" disabled={!newName.trim() || !actionValue.trim()}>Create rule</button>
      </form>
    </main>
  );
}
