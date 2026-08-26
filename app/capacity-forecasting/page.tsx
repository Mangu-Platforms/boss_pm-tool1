"use client";

import { useEffect, useState } from "react";

type Forecast = { id: string; team: string; period: string; period_label: string; available_hours: number; planned_hours: number; actual_hours: number; utilization_pct: number; status: string; notes: string };

export default function CapacityForecastingPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [teamFilter, setTeamFilter] = useState("");

  useEffect(() => {
    const q = teamFilter ? `?team=${teamFilter}` : "";
    fetch(`/api/capacity-forecasting${q}`).then((r) => r.json()).then(setForecasts);
  }, [teamFilter]);

  const statusColor: Record<string, string> = { on_track: "var(--engine)", at_risk: "var(--gold)", over_capacity: "var(--danger)", under_utilized: "var(--mute)" };
  const teams = ["", "platform", "frontend", "data", "infra"];

  return (
    <div className="page">
      <h1>Capacity Forecasting</h1>
      <div className="rc-filters">
        {teams.map((t) => (
          <button key={t} className={`rc-filter-btn ${teamFilter === t ? "rc-filter-active" : ""}`} onClick={() => setTeamFilter(t)}>{t || "All"}</button>
        ))}
      </div>
      <table className="ru-table">
        <thead>
          <tr><th>Team</th><th>Period</th><th>Label</th><th>Available</th><th>Planned</th><th>Actual</th><th>Utilization</th><th>Status</th><th>Notes</th></tr>
        </thead>
        <tbody>
          {forecasts.map((f) => (
            <tr key={f.id}>
              <td>{f.team}</td>
              <td>{f.period}</td>
              <td>{f.period_label}</td>
              <td>{f.available_hours}h</td>
              <td>{f.planned_hours}h</td>
              <td>{f.actual_hours}h</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 60, height: 6, background: "var(--ink-3)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(f.utilization_pct, 100)}%`, height: "100%", background: statusColor[f.status], borderRadius: 3 }} />
                  </div>
                  <span>{f.utilization_pct}%</span>
                </div>
              </td>
              <td style={{ color: statusColor[f.status] }}>{f.status.replace(/_/g, " ")}</td>
              <td style={{ color: "var(--mute)", fontSize: 12 }}>{f.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
