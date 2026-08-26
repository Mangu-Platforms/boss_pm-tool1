"use client";

import { useEffect, useState } from "react";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  active: boolean;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState("");
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    fetch("/api/api-keys")
      .then((r) => r.json())
      .then((d) => setKeys(d.api_keys || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), scopes: scopes.split(",").map((s) => s.trim()).filter(Boolean) }),
    });
    const data = await res.json();
    if (data.api_key?.key) setNewKey(data.api_key.key);
    setName("");
    setScopes("");
    const list = await fetch("/api/api-keys").then((r) => r.json());
    setKeys(list.api_keys || []);
  }

  async function handleRevoke(id: string) {
    await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke", id }),
    });
    const data = await fetch("/api/api-keys").then((r) => r.json());
    setKeys(data.api_keys || []);
  }

  return (
    <main>
      <div className="kicker">Security</div>
      <h1>API Keys</h1>
      <p className="lede">Manage API keys for external integrations.</p>

      {newKey && (
        <div className="ak-new-key">
          <strong>New key created — copy it now, it won&apos;t be shown again:</strong>
          <code className="mono">{newKey}</code>
          <button className="btn-sm" onClick={() => setNewKey("")}>Dismiss</button>
        </div>
      )}

      <div className="ak-list">
        {keys.map((k) => (
          <div key={k.id} className={`ak-card ${k.active ? "" : "ak-revoked"}`}>
            <div className="ak-header">
              <h3>{k.name}</h3>
              <code className="mono hint">{k.prefix}</code>
            </div>
            <div className="ak-meta">
              <span className={`priority ${k.active ? "green" : "red"}`}>{k.active ? "Active" : "Revoked"}</span>
              {k.last_used_at && <span className="hint">Last used: {new Date(k.last_used_at).toLocaleDateString()}</span>}
              {k.expires_at && <span className="hint">Expires: {new Date(k.expires_at).toLocaleDateString()}</span>}
            </div>
            <div className="ak-scopes">
              {k.scopes.map((s) => <span key={s} className="ak-scope">{s}</span>)}
            </div>
            {k.active && (
              <button className="btn-sm danger" onClick={() => handleRevoke(k.id)}>Revoke</button>
            )}
          </div>
        ))}
      </div>

      <h2 className="section-title">Create API Key</h2>
      <form className="ak-form" onSubmit={handleCreate}>
        <input placeholder="Key name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Scopes (comma separated)" value={scopes} onChange={(e) => setScopes(e.target.value)} />
        <button className="go" type="submit" disabled={!name.trim()}>Generate</button>
      </form>
    </main>
  );
}
