"use client";

import { useEffect, useState } from "react";

type BreakdownItem = { score: number; label: string };
type Health = {
  overall: number;
  indicator: string;
  breakdown: Record<string, BreakdownItem>;
  recommendations: string[];
};

export default function ProjectHealthPage() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetch("/api/project-health").then((r) => r.json()).then(setHealth);
  }, []);

  if (!health) return <div className="page">Loading...</div>;

  const indicatorColor: Record<string, string> = {
    excellent: "var(--engine)",
    good: "var(--gold)",
    at_risk: "var(--lab)",
    critical: "var(--danger)",
  };

  return (
    <div className="page">
      <h1>Project Health</h1>

      <div className="ph-summary">
        <div className="ph-score" style={{ borderColor: indicatorColor[health.indicator] || "var(--line)" }}>
          <span className="ph-number">{health.overall}</span>
          <span className="ph-indicator" style={{ color: indicatorColor[health.indicator] }}>{health.indicator.replace("_", " ")}</span>
        </div>
      </div>

      <h2>Breakdown</h2>
      <div className="ph-grid">
        {Object.entries(health.breakdown).map(([key, item]) => (
          <div key={key} className="ph-card">
            <div className="ph-card-label">{item.label}</div>
            <div className="ph-card-bar">
              <div className="ph-card-fill" style={{ width: `${item.score}%`, background: item.score >= 70 ? "var(--engine)" : item.score >= 40 ? "var(--gold)" : "var(--danger)" }} />
            </div>
            <div className="ph-card-score">{item.score}/100</div>
          </div>
        ))}
      </div>

      {health.recommendations.length > 0 && (
        <>
          <h2>Recommendations</h2>
          <ul className="ph-recs">
            {health.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
