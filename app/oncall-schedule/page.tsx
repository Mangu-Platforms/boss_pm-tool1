"use client";

import { useEffect, useState } from "react";

type OncallShift = { id: string; member: string; rotation: string; start_date: string; end_date: string; team: string; swap_requested: boolean };

export default function OncallSchedulePage() {
  const [shifts, setShifts] = useState<OncallShift[]>([]);
  const [teamFilter, setTeamFilter] = useState("");

  useEffect(() => {
    const q = teamFilter ? `?team=${teamFilter}` : "";
    fetch(`/api/oncall-schedule${q}`).then((r) => r.json()).then(setShifts);
  }, [teamFilter]);

  async function handleSwap(id: string) {
    const res = await fetch("/api/oncall-schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "swap", id }) });
    if (res.ok) { const updated = await res.json(); setShifts((prev) => prev.map((s) => (s.id === id ? updated : s))); }
  }

  const rotColor: Record<string, string> = { primary: "var(--danger)", secondary: "var(--gold)", escalation: "var(--lab)" };
  const teams = [...new Set(shifts.map((s) => s.team))];

  return (
    <div className="page">
      <h1>On-Call Schedule</h1>

      <div className="rc-filters">
        <button className={`rc-filter-btn ${!teamFilter ? "rc-filter-active" : ""}`} onClick={() => setTeamFilter("")}>All</button>
        {teams.map((t) => (
          <button key={t} className={`rc-filter-btn ${teamFilter === t ? "rc-filter-active" : ""}`} onClick={() => setTeamFilter(t)}>{t}</button>
        ))}
      </div>

      <table className="ru-table">
        <thead>
          <tr><th>Member</th><th>Rotation</th><th>Start</th><th>End</th><th>Team</th><th>Swap</th></tr>
        </thead>
        <tbody>
          {shifts.map((s) => (
            <tr key={s.id}>
              <td>{s.member}</td>
              <td style={{ color: rotColor[s.rotation] }}>{s.rotation}</td>
              <td>{s.start_date}</td>
              <td>{s.end_date}</td>
              <td>{s.team}</td>
              <td>
                {s.swap_requested ? <span style={{ color: "var(--gold)" }}>Requested</span> : <button className="btn btn-sm" onClick={() => handleSwap(s.id)}>Request</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
