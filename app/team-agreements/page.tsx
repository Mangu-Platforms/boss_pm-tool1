"use client";

import { useEffect, useState } from "react";

type Agreement = { id: string; team: string; type: string; title: string; content: string; status: string; version: number; author: string; approved_by: string[]; updated_at: string };

export default function TeamAgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [teamFilter, setTeamFilter] = useState("");

  useEffect(() => {
    const q = teamFilter ? `?team=${teamFilter}` : "";
    fetch(`/api/team-agreements${q}`).then((r) => r.json()).then(setAgreements);
  }, [teamFilter]);

  const teams = ["", "platform", "frontend", "data", "infra"];

  return (
    <div className="page">
      <h1>Team Agreements</h1>
      <div className="rc-filters">
        {teams.map((t) => (
          <button key={t} className={`rc-filter-btn ${teamFilter === t ? "rc-filter-active" : ""}`} onClick={() => setTeamFilter(t)}>{t || "All"}</button>
        ))}
      </div>
      <div className="cr-list">
        {agreements.map((ag) => (
          <div key={ag.id} className="cr-card">
            <div className="cr-header">
              <span className="cr-title">{ag.title}</span>
              <span style={{ fontSize: 11, background: ag.status === "active" ? "var(--engine)" : "var(--ink-3)", color: ag.status === "active" ? "#000" : "var(--mute)", padding: "2px 8px", borderRadius: 4 }}>{ag.status}</span>
            </div>
            <div className="cr-desc">{ag.content}</div>
            <div className="cr-meta">
              <span>{ag.team}</span>
              <span>{ag.type.replace(/_/g, " ")}</span>
              <span>v{ag.version}</span>
              <span>by {ag.author}</span>
              {ag.approved_by.length > 0 && <span>Approved: {ag.approved_by.join(", ")}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
