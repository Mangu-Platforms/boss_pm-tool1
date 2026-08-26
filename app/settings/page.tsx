"use client";

import { useEffect, useState } from "react";

type Config = {
  supabase_connected: boolean;
  github_connected: boolean;
  github_owner: string | null;
  product_count: number;
};

type HealthInfo = {
  status: string;
  uptime_seconds: number;
  memory_mb: number;
  issues_count: number;
  products_count: number;
};

export default function SettingsPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [health, setHealth] = useState<HealthInfo | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setConfig(data));
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setHealth(data));
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

          {health && (
            <div className="settings-section">
              <h2>System Health</h2>
              <div className="settings-row">
                <span>Status</span>
                <span className="conn-status connected">{health.status}</span>
              </div>
              <div className="settings-row">
                <span>Memory</span>
                <span>{health.memory_mb} MB</span>
              </div>
              <div className="settings-row">
                <span>Issues in store</span>
                <span>{health.issues_count}</span>
              </div>
              <div className="settings-row">
                <span>Products in store</span>
                <span>{health.products_count}</span>
              </div>
            </div>
          )}

          <div className="settings-section">
            <h2>Webhooks</h2>
            <p className="hint">Configure GitHub to POST to your deployment URL:</p>
            <div className="webhook-url">
              <code>POST /api/webhooks/github</code>
            </div>
            <p className="hint" style={{ marginTop: 8 }}>
              Events: <code>issues</code>, <code>issue_comment</code>
            </p>
            <p className="hint">
              Set <code>GITHUB_WEBHOOK_SECRET</code> for signature verification.
            </p>
          </div>

          <div className="settings-section">
            <h2>Keyboard Shortcuts</h2>
            <div className="shortcut-list">
              <div className="shortcut-row">
                <kbd>Cmd+K</kbd>
                <span>Command palette / search</span>
              </div>
              <div className="shortcut-row">
                <kbd>1</kbd>
                <span>Portfolio</span>
              </div>
              <div className="shortcut-row">
                <kbd>2</kbd>
                <span>Kanban</span>
              </div>
              <div className="shortcut-row">
                <kbd>3</kbd>
                <span>Issues</span>
              </div>
              <div className="shortcut-row">
                <kbd>C</kbd>
                <span>Create issue</span>
              </div>
              <div className="shortcut-row">
                <kbd>?</kbd>
                <span>Show keyboard help</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>API Endpoints</h2>
            <div className="api-list">
              <div className="api-row"><code>GET</code> <span>/api/issues</span></div>
              <div className="api-row"><code>POST</code> <span>/api/issues</span></div>
              <div className="api-row"><code>GET</code> <span>/api/issues/:id</span></div>
              <div className="api-row"><code>PATCH</code> <span>/api/issues/:id</span></div>
              <div className="api-row"><code>DELETE</code> <span>/api/issues/:id</span></div>
              <div className="api-row"><code>POST</code> <span>/api/issues/batch</span></div>
              <div className="api-row"><code>GET</code> <span>/api/products</span></div>
              <div className="api-row"><code>POST</code> <span>/api/products</span></div>
              <div className="api-row"><code>GET</code> <span>/api/agents</span></div>
              <div className="api-row"><code>GET</code> <span>/api/activity</span></div>
              <div className="api-row"><code>GET</code> <span>/api/search?q=</span></div>
              <div className="api-row"><code>GET</code> <span>/api/export?format=json|csv</span></div>
              <div className="api-row"><code>GET</code> <span>/api/duplicates?title=</span></div>
              <div className="api-row"><code>GET</code> <span>/api/health</span></div>
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
              <li><code>GITHUB_WEBHOOK_SECRET</code> — Webhook signature secret</li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
