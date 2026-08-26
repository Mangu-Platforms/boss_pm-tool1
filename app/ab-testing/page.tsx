"use client";

import { useEffect, useState } from "react";

type Variant = { id: string; name: string; type: string; allocation: number; conversions: number; impressions: number };
type Experiment = {
  id: string;
  name: string;
  hypothesis: string;
  status: string;
  metric: string;
  owner: string;
  variants: Variant[];
  start_date: string | null;
  end_date: string | null;
};
type Results = { winner: string | null; lift: number; significant: boolean };

export default function ABTestingPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [results, setResults] = useState<Record<string, Results>>({});

  useEffect(() => {
    fetch("/api/ab-testing").then((r) => r.json()).then(async (exps: Experiment[]) => {
      setExperiments(exps);
      const r: Record<string, Results> = {};
      for (const exp of exps) {
        const res = await fetch(`/api/ab-testing?results=${exp.id}`);
        if (res.ok) r[exp.id] = await res.json();
      }
      setResults(r);
    });
  }, []);

  const statusColor: Record<string, string> = { draft: "var(--mute)", running: "var(--engine)", paused: "var(--gold)", concluded: "var(--lab)" };

  return (
    <div className="page">
      <h1>A/B Testing</h1>

      <div className="ab-grid">
        {experiments.map((exp) => (
          <div key={exp.id} className="ab-card">
            <div className="ab-header">
              <span className="ab-name">{exp.name}</span>
              <span className="ab-status" style={{ color: statusColor[exp.status] }}>{exp.status}</span>
            </div>
            <div className="ab-hypothesis">{exp.hypothesis}</div>
            <div className="ab-metric">Metric: {exp.metric}</div>
            <div className="ab-variants">
              {exp.variants.map((v) => {
                const rate = v.impressions > 0 ? ((v.conversions / v.impressions) * 100).toFixed(1) : "0.0";
                return (
                  <div key={v.id} className={`ab-variant ${v.type === "treatment" ? "ab-treatment" : ""}`}>
                    <span className="ab-var-name">{v.name}</span>
                    <span className="ab-var-rate">{rate}%</span>
                    <span className="ab-var-counts">{v.conversions}/{v.impressions}</span>
                  </div>
                );
              })}
            </div>
            {results[exp.id] && (
              <div className="ab-results">
                <span>Winner: <strong>{results[exp.id].winner}</strong></span>
                <span>Lift: {results[exp.id].lift}%</span>
                <span className={results[exp.id].significant ? "ab-sig" : "ab-not-sig"}>
                  {results[exp.id].significant ? "Significant" : "Not significant"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
