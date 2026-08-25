"use client";

import { useEffect, useState } from "react";

type Config = {
  supabase_connected: boolean;
  github_connected: boolean;
  github_owner: string | null;
  product_count: number;
};

export default function SettingsPage() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setConfig(data));
  }, []);

  return (
    <main>
      <div className="kicker">Configuration</div>
      <h1>Settings</h1>

      {!config ? (
        <p className="empty">Loading...</p>
      ) : (
        <div className="settings-grid">
          <div className="settings-section">
            <h2>Connections</h2>
            <div className="settings-row">
              <span>Supabase</span>
              <span className={`conn-status ${config.supabase_connected ? "connected" : "disconnected"}`}>
                {config.supabase_connected ? "Connected" : "Using in-memory store"}
              </span>
            </div>
            <div className="settings-row">
              <span>GitHub</span>
              <span className={`conn-status ${config.github_connected ? "connected" : "disconnected"}`}>
                {config.github_connected ? `Connected (${config.github_owner})` : "No token configured"}
              </span>
            </div>
          </div>

          <div className="settings-section">
            <h2>Portfolio</h2>
            <div className="settings-row">
              <span>Products loaded</span>
              <span>{config.product_count}</span>
            </div>
          </div>

          <div className="settings-section">
            <h2>Environment Variables</h2>
            <p className="hint">Set these in your .env.local file:</p>
            <ul className="env-list">
              <li><code>SUPABASE_URL</code> — Supabase project URL</li>
              <li><code>SUPABASE_SERVICE_ROLE_KEY</code> — Supabase service key</li>
              <li><code>GITHUB_TOKEN</code> — GitHub personal access token</li>
              <li><code>GITHUB_OWNER</code> — Default GitHub org/user</li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
