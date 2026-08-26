"use client";

import { useEffect, useState } from "react";

type PulseEntry = { id: string; user_id: string; rating: number; comment: string; sprint_id: string | null; created_at: string };
type Trend = { sprint_id: string; avg_rating: number; count: number };

export default function TeamPulsePage() {
  const [pulses, setPulses] = useState<PulseEntry[]>([]);
  const [trend, setTrend] = useState<Trend[]>([]);
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");

  function load() {
    fetch("/api/team-pulse").then((r) => r.json()).then(setPulses);
    fetch("/api/team-pulse?trend").then((r) => r.json()).then(setTrend);
  }
  useEffect(load, []);

  async function submit() {
    await fetch("/api/team-pulse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "max", rating, comment }),
    });
    setComment("");
    load();
  }

  return (
    <div className="page">
      <h1>Team Pulse</h1>

      <div className="tp-trend">
        {trend.map((t) => (
          <div key={t.sprint_id} className="tp-trend-item">
            <div className="tp-trend-bar" style={{ height: `${t.avg_rating * 20}%` }} />
            <span className="tp-trend-label">{t.sprint_id}</span>
            <span className="tp-trend-avg">{t.avg_rating}</span>
          </div>
        ))}
      </div>

      <div className="tp-form">
        <div className="tp-rating">
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} className={`tp-star ${v <= rating ? "tp-star-active" : ""}`} onClick={() => setRating(v)}>{v}</button>
          ))}
        </div>
        <input placeholder="How are you feeling?" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className="btn btn-gold" onClick={submit}>Submit</button>
      </div>

      <div className="tp-list">
        {pulses.map((p) => (
          <div key={p.id} className="tp-entry">
            <div className="tp-entry-header">
              <span className="tp-user">{p.user_id}</span>
              <span className="tp-entry-rating">{"*".repeat(p.rating)}</span>
            </div>
            {p.comment && <p className="tp-comment">{p.comment}</p>}
            <span className="tp-date">{new Date(p.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
