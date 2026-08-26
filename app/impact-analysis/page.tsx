"use client";

import { useEffect, useState } from "react";

type ImpactItem = {
  id: string;
  change_request_id: string;
  area: string;
  severity: string;
  description: string;
  mitigation: string;
  affected_users: number;
  estimated_effort_hours: number;
};

type ImpactReport = {
  change_request_id: string;
  items: ImpactItem[];
  overall_severity: string;
  total_effort_hours: number;
  total_affected_users: number;
  areas_impacted: string[];
};

export default function ImpactAnalysisPage() {
  const [highRisk, setHighRisk] = useState<ImpactItem[]>([]);
  const [crId, setCrId] = useState("cr-1");
  const [report, setReport] = useState<ImpactReport | null>(null);

  useEffect(() => {
    fetch("/api/impact-analysis?high_risk").then((r) => r.json()).then(setHighRisk);
  }, []);

  async function loadReport() {
    const res = await fetch(`/api/impact-analysis?report&change_request_id=${crId}`);
    if (res.ok) setReport(await res.json());
  }

  const severityColor: Record<string, string> = { none: "var(--mute)", low: "var(--engine)", medium: "var(--gold)", high: "var(--danger)", critical: "var(--danger)" };

  return (
    <div className="page">
      <h1>Impact Analysis</h1>

      <div className="ia-section">
        <h2>High Risk Items</h2>
        <div className="ia-items">
          {highRisk.map((item) => (
            <div key={item.id} className="ia-item" style={{ borderLeftColor: severityColor[item.severity] }}>
              <div className="ia-item-header">
                <span className="ia-severity" style={{ color: severityColor[item.severity] }}>{item.severity}</span>
                <span className="ia-area">{item.area}</span>
                <span className="ia-cr-id">{item.change_request_id}</span>
              </div>
              <div className="ia-desc">{item.description}</div>
              <div className="ia-mitigation">Mitigation: {item.mitigation}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ia-section">
        <h2>Impact Report</h2>
        <div className="ia-report-selector">
          <input placeholder="CR ID (e.g. cr-1)" value={crId} onChange={(e) => setCrId(e.target.value)} />
          <button className="btn btn-gold" onClick={loadReport}>Generate</button>
        </div>
        {report && (
          <div className="ia-report">
            <div className="ru-summary">
              <div className="ru-stat"><span className="ru-stat-val" style={{ color: severityColor[report.overall_severity] }}>{report.overall_severity}</span><span className="ru-stat-label">Overall</span></div>
              <div className="ru-stat"><span className="ru-stat-val">{report.total_effort_hours}h</span><span className="ru-stat-label">Effort</span></div>
              <div className="ru-stat"><span className="ru-stat-val">{report.total_affected_users}</span><span className="ru-stat-label">Users</span></div>
              <div className="ru-stat"><span className="ru-stat-val">{report.areas_impacted.length}</span><span className="ru-stat-label">Areas</span></div>
            </div>
            <div className="ia-items">
              {report.items.map((item) => (
                <div key={item.id} className="ia-item" style={{ borderLeftColor: severityColor[item.severity] }}>
                  <div className="ia-item-header">
                    <span className="ia-severity" style={{ color: severityColor[item.severity] }}>{item.severity}</span>
                    <span className="ia-area">{item.area}</span>
                  </div>
                  <div className="ia-desc">{item.description}</div>
                  <div className="ia-mitigation">Mitigation: {item.mitigation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
