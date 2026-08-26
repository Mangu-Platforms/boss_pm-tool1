"use client";

import { useEffect, useState } from "react";

type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  strategy: string;
  percentage: number | null;
  user_list: string[];
  environments: string[];
  owner: string;
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [envFilter, setEnvFilter] = useState("");

  useEffect(() => {
    const q = envFilter ? `?env=${envFilter}` : "";
    fetch(`/api/feature-flags${q}`).then((r) => r.json()).then(setFlags);
  }, [envFilter]);

  async function toggleFlag(id: string, enabled: boolean) {
    const res = await fetch("/api/feature-flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, updates: { enabled: !enabled } }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFlags((prev) => prev.map((f) => (f.id === id ? updated : f)));
    }
  }

  return (
    <div className="page">
      <h1>Feature Flags</h1>

      <div className="rc-filters">
        {["", "development", "staging", "production"].map((e) => (
          <button key={e} className={`rc-filter-btn ${envFilter === e ? "rc-filter-active" : ""}`} onClick={() => setEnvFilter(e)}>{e || "All"}</button>
        ))}
      </div>

      <table className="ru-table">
        <thead>
          <tr><th>Key</th><th>Name</th><th>Strategy</th><th>Envs</th><th>Owner</th><th>Status</th></tr>
        </thead>
        <tbody>
          {flags.map((f) => (
            <tr key={f.id}>
              <td><code>{f.key}</code></td>
              <td>{f.name}</td>
              <td>
                {f.strategy}
                {f.strategy === "percentage" && f.percentage !== null && ` (${f.percentage}%)`}
                {f.strategy === "user_list" && ` (${f.user_list.length})`}
              </td>
              <td>{f.environments.map((e) => <span key={e} className="ff-env">{e.slice(0, 3)}</span>)}</td>
              <td>{f.owner}</td>
              <td>
                <button className={`ff-toggle ${f.enabled ? "ff-on" : "ff-off"}`} onClick={() => toggleFlag(f.id, f.enabled)}>
                  {f.enabled ? "ON" : "OFF"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
