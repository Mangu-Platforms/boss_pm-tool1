"use client";

import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string;
  tier: string;
  health: string;
  owner: string;
  team: string;
  dependencies: string[];
  sla_uptime: number;
};

export default function ServiceCatalogPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [tierFilter, setTierFilter] = useState("");

  useEffect(() => {
    const q = tierFilter ? `?tier=${tierFilter}` : "";
    fetch(`/api/service-catalog${q}`).then((r) => r.json()).then(setServices);
  }, [tierFilter]);

  const healthColor: Record<string, string> = { healthy: "var(--engine)", degraded: "var(--gold)", outage: "var(--danger)", maintenance: "var(--lab)" };
  const healthDot = (h: string) => ({ width: 10, height: 10, borderRadius: "50%", background: healthColor[h] || "var(--mute)", display: "inline-block" });

  return (
    <div className="page">
      <h1>Service Catalog</h1>

      <div className="rc-filters">
        {["", "tier-0", "tier-1", "tier-2", "tier-3"].map((t) => (
          <button key={t} className={`rc-filter-btn ${tierFilter === t ? "rc-filter-active" : ""}`} onClick={() => setTierFilter(t)}>{t || "All"}</button>
        ))}
      </div>

      <div className="sc-grid">
        {services.map((svc) => (
          <div key={svc.id} className="sc-card">
            <div className="sc-header">
              <div style={healthDot(svc.health)} />
              <span className="sc-name">{svc.name}</span>
              <span className="sc-tier">{svc.tier}</span>
            </div>
            <div className="sc-desc">{svc.description}</div>
            <div className="sc-meta">
              <span>Owner: {svc.owner}</span>
              <span>Team: {svc.team}</span>
              <span>SLA: {svc.sla_uptime}%</span>
            </div>
            {svc.dependencies.length > 0 && (
              <div className="sc-deps">Depends: {svc.dependencies.join(", ")}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
