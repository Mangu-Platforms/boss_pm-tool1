"use client";

import { useEffect, useState } from "react";

type KeyResult = {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
};

type OKR = {
  id: string;
  objective: string;
  owner: string;
  quarter: string;
  status: string;
  key_results: KeyResult[];
};

const statusColors: Record<string, string> = {
  on_track: "green",
  at_risk: "gold",
  off_track: "red",
  achieved: "green",
};

const statusLabels: Record<string, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  off_track: "Off Track",
  achieved: "Achieved",
};

export default function OKRsPage() {
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [objective, setObjective] = useState("");
  const [owner, setOwner] = useState("");
  const [quarter, setQuarter] = useState("Q1 2025");

  useEffect(() => {
    fetch("/api/okrs")
      .then((r) => r.json())
      .then((data) => setOkrs(data.okrs || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!objective.trim() || !owner.trim()) return;
    await fetch("/api/okrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objective: objective.trim(), owner: owner.trim(), quarter, key_results: [] }),
    });
    setObjective("");
    setOwner("");
    const data = await fetch("/api/okrs").then((r) => r.json());
    setOkrs(data.okrs || []);
  }

  async function handleUpdateKR(okrId: string, krId: string, current: number) {
    await fetch("/api/okrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_kr", okr_id: okrId, kr_id: krId, current }),
    });
    const data = await fetch("/api/okrs").then((r) => r.json());
    setOkrs(data.okrs || []);
  }

  return (
    <main>
      <div className="kicker">Strategy</div>
      <h1>OKRs</h1>
      <p className="lede">Objectives and Key Results for tracking strategic goals.</p>

      <div className="okr-list">
        {okrs.map((okr) => {
          const progress = okr.key_results.length > 0
            ? Math.round(okr.key_results.reduce((s, kr) => s + Math.min(100, (kr.current / kr.target) * 100), 0) / okr.key_results.length)
            : 0;
          return (
            <div key={okr.id} className={`okr-card okr-${okr.status}`}>
              <div className="okr-header">
                <h3>{okr.objective}</h3>
                <span className={`priority ${statusColors[okr.status] || "mute"}`}>{statusLabels[okr.status] || okr.status}</span>
              </div>
              <div className="okr-meta">
                <span className="hint">Owner: {okr.owner}</span>
                <span className="hint">{okr.quarter}</span>
                <span className="okr-progress-label">{progress}%</span>
              </div>
              <div className="okr-progress-bar">
                <div className="okr-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="okr-krs">
                {okr.key_results.map((kr) => {
                  const krPct = Math.min(100, Math.round((kr.current / kr.target) * 100));
                  return (
                    <div key={kr.id} className="okr-kr">
                      <span className="okr-kr-title">{kr.title}</span>
                      <span className="mono hint">{kr.current}/{kr.target} {kr.unit}</span>
                      <div className="okr-kr-bar">
                        <div className="okr-kr-fill" style={{ width: `${krPct}%` }} />
                      </div>
                      <input
                        type="number"
                        className="okr-kr-input"
                        value={kr.current}
                        onChange={(e) => handleUpdateKR(okr.id, kr.id, Number(e.target.value))}
                        step="0.1"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Add Objective</h2>
      <form className="okr-form" onSubmit={handleCreate}>
        <input placeholder="Objective" value={objective} onChange={(e) => setObjective(e.target.value)} required />
        <input placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} required />
        <input placeholder="Quarter (e.g. Q1 2025)" value={quarter} onChange={(e) => setQuarter(e.target.value)} />
        <button className="go" type="submit" disabled={!objective.trim() || !owner.trim()}>Add</button>
      </form>
    </main>
  );
}
