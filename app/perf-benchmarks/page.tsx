"use client";

import { useEffect, useState } from "react";

type Benchmark = { id: string; service_id: string; name: string; type: string; baseline_value: number; current_value: number; threshold_value: number; unit: string; status: string; trend: string; history: number[] };
type Summary = { total: number; by_status: Record<string, number>; by_trend: Record<string, number> };

export default function PerfBenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const q = typeFilter ? `?type=${typeFilter}` : "";
    fetch(`/api/perf-benchmarks${q}`).then((r) => r.json()).then(setBenchmarks);
    fetch("/api/perf-benchmarks?summary").then((r) => r.json()).then(setSummary);
  }, [typeFilter]);

  const statusColor: Record<string, string> = { passing: "var(--engine)", degraded: "var(--gold)", failing: "var(--danger)", baseline: "var(--mute)" };
  const trendIcon: Record<string, string> = { improving: "↑", stable: "→", degrading: "↓" };

  return (
    <div className="page">
      <h1>Performance Benchmarks</h1>
      {summary && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{summary.total}</span><span className="ru-stat-label">Total</span></div>
          {Object.entries(summary.by_status).map(([s, count]) => (
            <div key={s} className="ru-stat"><span className="ru-stat-val" style={{ color: statusColor[s] }}>{count}</span><span className="ru-stat-label">{s}</span></div>
          ))}
        </div>
      )}
      <div className="rc-filters">
        {["", "latency", "throughput", "memory", "cpu", "disk_io"].map((t) => (
          <button key={t} className={`rc-filter-btn ${typeFilter === t ? "rc-filter-active" : ""}`} onClick={() => setTypeFilter(t)}>{t ? t.replace("_", " ") : "All"}</button>
        ))}
      </div>
      <table className="ru-table">
        <thead>
          <tr><th>Name</th><th>Service</th><th>Type</th><th>Baseline</th><th>Current</th><th>Threshold</th><th>Status</th><th>Trend</th></tr>
        </thead>
        <tbody>
          {benchmarks.map((b) => (
            <tr key={b.id}>
              <td style={{ fontWeight: 600 }}>{b.name}</td>
              <td>{b.service_id}</td>
              <td>{b.type}</td>
              <td>{b.baseline_value} {b.unit}</td>
              <td style={{ fontFamily: "var(--mono)" }}>{b.current_value} {b.unit}</td>
              <td>{b.threshold_value} {b.unit}</td>
              <td style={{ color: statusColor[b.status] }}>{b.status}</td>
              <td style={{ color: b.trend === "improving" ? "var(--engine)" : b.trend === "degrading" ? "var(--danger)" : "var(--mute)" }}>{trendIcon[b.trend]} {b.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
