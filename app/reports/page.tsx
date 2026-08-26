"use client";

import { useEffect, useState } from "react";

type ReportTypeInfo = { type: string; title: string; description: string };
type ReportData = { type: string; title: string; generated_at: string; data: Record<string, unknown> };

export default function ReportsPage() {
  const [reportTypes, setReportTypes] = useState<ReportTypeInfo[]>([]);
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => setReportTypes(data.report_types || []));
  }, []);

  async function loadReport(type: string) {
    setLoading(true);
    const res = await fetch(`/api/reports?type=${type}`);
    const data = await res.json();
    setActiveReport(data.report || null);
    setLoading(false);
  }

  return (
    <main>
      <div className="kicker">Insights</div>
      <h1>Reports</h1>
      <p className="lede">Generate reports on project health, team performance, and progress.</p>

      <div className="report-types">
        {reportTypes.map((rt) => (
          <button
            key={rt.type}
            className={`report-type-card ${activeReport?.type === rt.type ? "report-active" : ""}`}
            onClick={() => loadReport(rt.type)}
          >
            <h3 className="report-type-title">{rt.title}</h3>
            <p className="report-type-desc">{rt.description}</p>
          </button>
        ))}
      </div>

      {loading && <p className="hint" style={{ marginTop: 16 }}>Generating report...</p>}

      {activeReport && !loading && (
        <div className="report-output">
          <div className="report-header">
            <h2>{activeReport.title}</h2>
            <span className="hint">Generated {new Date(activeReport.generated_at).toLocaleString()}</span>
          </div>
          <div className="report-data">
            {renderReportData(activeReport)}
          </div>
        </div>
      )}
    </main>
  );
}

function renderReportData(report: ReportData) {
  const data = report.data;

  if (report.type === "status_distribution" || report.type === "priority_breakdown") {
    const dist = (data.distribution || {}) as Record<string, number>;
    const total = (data.total || 0) as number;
    return (
      <div className="report-bars">
        {Object.entries(dist).map(([key, count]) => {
          const n = Number(count);
          return (
            <div key={key} className="dash-bar-row">
              <span className={`${report.type === "status_distribution" ? "status" : "priority"} ${key}`}>{key}</span>
              <div className="dash-bar-track">
                <div className="dash-bar-fill dash-bar-doing" style={{ width: `${total > 0 ? (n / total) * 100 : 0}%` }} />
              </div>
              <span className="dash-bar-count">{n}</span>
            </div>
          );
        })}
        <p className="hint" style={{ marginTop: 8 }}>Total: {total}</p>
      </div>
    );
  }

  if (report.type === "time_spent") {
    const byAuthor = (data.by_author || {}) as Record<string, number>;
    const hasAuthors = Object.keys(byAuthor).length > 0;
    return (
      <div className="report-section">
        <p><strong>{(data.total_hours as number) || 0}</strong> hours logged across <strong>{(data.entry_count as number) || 0}</strong> entries</p>
        {hasAuthors && (
          <div style={{ marginTop: 12 }}>
            <h4 className="report-subtitle">By author</h4>
            {Object.entries(byAuthor).map(([author, mins]) => (
              <div key={author} className="report-row">
                <span>{author}</span>
                <span className="hint">{Math.round(Number(mins) / 60 * 10) / 10}h</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (report.type === "team_load") {
    const byAssignee = (data.by_assignee || {}) as Record<string, { total: number; doing: number }>;
    return (
      <div className="report-section">
        <p><strong>{(data.active_issues as number) || 0}</strong> active issues</p>
        <div style={{ marginTop: 12 }}>
          {Object.entries(byAssignee).map(([name, load]) => (
            <div key={name} className="report-row">
              <span>{name}</span>
              <span className="hint">{load.total} total, {load.doing} in progress</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (report.type === "velocity") {
    const sprints = (data.sprints || []) as { sprint: string; total: number; done: number; velocity: number }[];
    return (
      <div className="report-section">
        {sprints.map((s) => (
          <div key={s.sprint} className="report-row">
            <span>{s.sprint}</span>
            <span className="hint">{s.done}/{s.total} ({s.velocity}%)</span>
          </div>
        ))}
      </div>
    );
  }

  return <pre className="report-json">{JSON.stringify(data, null, 2)}</pre>;
}
