"use client";

import { useEffect, useState } from "react";

type Integration = {
  id: string;
  name: string;
  provider: string;
  description: string;
  status: string;
  config: Record<string, string>;
  connected_at: string | null;
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    fetch("/api/integrations")
      .then((r) => r.json())
      .then((data) => setIntegrations(data.integrations || []));
  }, []);

  async function toggleConnection(id: string, currentStatus: string) {
    const newStatus = currentStatus === "connected" ? "disconnected" : "connected";
    const res = await fetch("/api/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setIntegrations((prev) => prev.map((i) => i.id === id ? data.integration : i));
    }
  }

  return (
    <main>
      <div className="kicker">Connect</div>
      <h1>Integrations</h1>
      <p className="lede">Connect Boss PM to your existing tools and services.</p>

      <div className="integrations-grid">
        {integrations.map((int) => (
          <div key={int.id} className={`integration-card ${int.status === "connected" ? "integration-active" : ""}`}>
            <div className="integration-header">
              <h3 className="integration-name">{int.name}</h3>
              <span className={`status ${int.status}`}>{int.status}</span>
            </div>
            <p className="integration-desc">{int.description}</p>
            {int.status === "connected" && int.connected_at && (
              <span className="hint">Connected {new Date(int.connected_at).toLocaleDateString()}</span>
            )}
            {int.status === "connected" && Object.keys(int.config).length > 0 && (
              <div className="integration-config">
                {Object.entries(int.config).map(([k, v]) => (
                  <span key={k} className="hint">{k}: {v}</span>
                ))}
              </div>
            )}
            <button
              className={`chip chip-sm ${int.status === "connected" ? "" : "go"}`}
              onClick={() => toggleConnection(int.id, int.status)}
              style={{ marginTop: 10 }}
            >
              {int.status === "connected" ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
