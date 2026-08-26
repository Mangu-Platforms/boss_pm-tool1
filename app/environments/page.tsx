"use client";

import { useEffect, useState } from "react";

type Environment = {
  id: string;
  name: string;
  url: string;
  branch: string;
  status: string;
  last_deployed_at: string | null;
};

const statusColors: Record<string, string> = {
  active: "green",
  inactive: "mute",
  deploying: "gold",
  failed: "red",
};

export default function EnvironmentsPage() {
  const [envs, setEnvs] = useState<Environment[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("");

  useEffect(() => {
    fetch("/api/environments")
      .then((r) => r.json())
      .then((data) => setEnvs(data.environments || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !branch.trim()) return;
    await fetch("/api/environments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), url: url.trim(), branch: branch.trim() }),
    });
    setName("");
    setUrl("");
    setBranch("");
    const data = await fetch("/api/environments").then((r) => r.json());
    setEnvs(data.environments || []);
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/environments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, status }),
    });
    const data = await fetch("/api/environments").then((r) => r.json());
    setEnvs(data.environments || []);
  }

  async function handleDelete(id: string) {
    await fetch("/api/environments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setEnvs((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main>
      <div className="kicker">Operations</div>
      <h1>Environments</h1>
      <p className="lede">Manage deployment environments and their status.</p>

      <div className="env-list">
        {envs.map((env) => (
          <div key={env.id} className={`env-card env-${env.status}`}>
            <div className="env-header">
              <span className={`env-dot env-dot-${env.status}`} />
              <span className="env-name">{env.name}</span>
              <span className={`priority ${statusColors[env.status] || "mute"}`}>{env.status}</span>
            </div>
            <div className="env-details">
              <span className="mono hint">{env.url}</span>
              <span className="hint">Branch: {env.branch}</span>
              {env.last_deployed_at && (
                <span className="hint">Last deployed: {new Date(env.last_deployed_at).toLocaleString()}</span>
              )}
            </div>
            <div className="env-actions">
              <select
                value={env.status}
                onChange={(e) => handleStatusChange(env.id, e.target.value)}
                className="env-status-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deploying">Deploying</option>
                <option value="failed">Failed</option>
              </select>
              <button className="subtle-btn" onClick={() => handleDelete(env.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Environment</h2>
      <form className="env-form" onSubmit={handleCreate}>
        <input placeholder="Name (e.g. Production)" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <input placeholder="Branch" value={branch} onChange={(e) => setBranch(e.target.value)} required />
        <button className="go" type="submit" disabled={!name.trim() || !url.trim() || !branch.trim()}>Add</button>
      </form>
    </main>
  );
}
