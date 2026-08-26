"use client";

import { useEffect, useState } from "react";

type Webhook = {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  last_triggered_at: string | null;
};

const ALL_EVENTS = [
  "issue.created", "issue.updated", "issue.deleted",
  "sprint.started", "sprint.completed",
  "release.published", "comment.created",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/webhooks")
      .then((r) => r.json())
      .then((data) => setWebhooks(data.webhooks || []));
  }, []);

  function toggleEvent(ev: string) {
    setEvents((prev) => prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim() || events.length === 0) return;
    await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), url: url.trim(), events }),
    });
    setName("");
    setUrl("");
    setEvents([]);
    const data = await fetch("/api/webhooks").then((r) => r.json());
    setWebhooks(data.webhooks || []);
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, active: !active }),
    });
    const data = await fetch("/api/webhooks").then((r) => r.json());
    setWebhooks(data.webhooks || []);
  }

  async function handleDelete(id: string) {
    await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <main>
      <div className="kicker">Configuration</div>
      <h1>Webhooks</h1>
      <p className="lede">Manage outgoing webhooks for external integrations.</p>

      <div className="wh-list">
        {webhooks.map((wh) => (
          <div key={wh.id} className={`wh-card ${wh.active ? "wh-active" : "wh-inactive"}`}>
            <div className="wh-header">
              <span className="wh-name">{wh.name}</span>
              <span className={`priority ${wh.active ? "green" : "mute"}`}>{wh.active ? "Active" : "Inactive"}</span>
            </div>
            <p className="mono hint">{wh.url}</p>
            <div className="wh-events">
              {wh.events.map((ev) => (
                <span key={ev} className="wh-event">{ev}</span>
              ))}
            </div>
            {wh.last_triggered_at && (
              <p className="hint">Last triggered: {new Date(wh.last_triggered_at).toLocaleString()}</p>
            )}
            <div className="wh-actions">
              <button className="subtle-btn" onClick={() => handleToggle(wh.id, wh.active)}>
                {wh.active ? "Disable" : "Enable"}
              </button>
              <button className="subtle-btn" onClick={() => handleDelete(wh.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Webhook</h2>
      <form className="wh-form" onSubmit={handleCreate}>
        <input placeholder="Webhook name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <div className="wh-event-picker">
          {ALL_EVENTS.map((ev) => (
            <label key={ev} className="wh-event-option">
              <input type="checkbox" checked={events.includes(ev)} onChange={() => toggleEvent(ev)} />
              {ev}
            </label>
          ))}
        </div>
        <button className="go" type="submit" disabled={!name.trim() || !url.trim() || events.length === 0}>Add</button>
      </form>
    </main>
  );
}
