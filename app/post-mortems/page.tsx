"use client";

import { useEffect, useState } from "react";

type ActionItem = { id: string; description: string; owner: string; status: string; due_date: string | null };
type PostMortem = { id: string; incident_id: string | null; title: string; summary: string; severity: string; status: string; timeline: string; root_cause: string; contributing_factors: string[]; action_items: ActionItem[]; lessons_learned: string[]; author: string; created_at: string; published_at: string | null };
type Stats = { total: number; published: number; open_actions: number; by_severity: Record<string, number> };

export default function PostMortemsPage() {
  const [pms, setPms] = useState<PostMortem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/post-mortems${q}`).then((r) => r.json()).then(setPms);
    fetch("/api/post-mortems?stats").then((r) => r.json()).then(setStats);
  }, [filter]);

  const sevColor: Record<string, string> = { minor: "var(--gold)", major: "var(--lab)", critical: "var(--danger)" };

  return (
    <div className="page">
      <h1>Post-Mortems</h1>
      {stats && (
        <div className="ru-summary">
          <div className="ru-stat"><span className="ru-stat-val">{stats.total}</span><span className="ru-stat-label">Total</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--engine)" }}>{stats.published}</span><span className="ru-stat-label">Published</span></div>
          <div className="ru-stat"><span className="ru-stat-val" style={{ color: "var(--danger)" }}>{stats.open_actions}</span><span className="ru-stat-label">Open Actions</span></div>
        </div>
      )}
      <div className="rc-filters">
        {["", "draft", "in_review", "published", "archived"].map((s) => (
          <button key={s} className={`rc-filter-btn ${filter === s ? "rc-filter-active" : ""}`} onClick={() => setFilter(s)}>{s ? s.replace("_", " ") : "All"}</button>
        ))}
      </div>
      <div className="rb-list">
        {pms.map((pm) => (
          <div key={pm.id} className="rb-card" style={{ borderLeftColor: sevColor[pm.severity] || "var(--line)" }}>
            <div className="rb-header" onClick={() => setExpanded(expanded === pm.id ? null : pm.id)}>
              <span className="rb-severity" style={{ color: sevColor[pm.severity] }}>{pm.severity}</span>
              <span className="rb-title">{pm.title}</span>
              <span className="rb-uses">{pm.status}</span>
            </div>
            <div className="rb-desc">{pm.summary}</div>
            {expanded === pm.id && (
              <div style={{ padding: "0 14px 14px" }}>
                <div style={{ marginBottom: 8 }}><strong style={{ fontSize: 12, color: "var(--mute)" }}>Root Cause:</strong> <span style={{ fontSize: 13 }}>{pm.root_cause}</span></div>
                <div style={{ marginBottom: 8 }}><strong style={{ fontSize: 12, color: "var(--mute)" }}>Timeline:</strong> <span style={{ fontSize: 13 }}>{pm.timeline}</span></div>
                {pm.contributing_factors.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 12, color: "var(--mute)" }}>Contributing Factors:</strong>
                    <ul style={{ margin: "4px 0", paddingLeft: 16, fontSize: 13 }}>{pm.contributing_factors.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}
                {pm.action_items.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 12, color: "var(--mute)" }}>Action Items:</strong>
                    <div className="rb-steps">
                      {pm.action_items.map((ai) => (
                        <div key={ai.id} className="rb-step">
                          <div className="rb-step-icon" style={{ color: ai.status === "done" ? "var(--engine)" : "var(--gold)" }}>{ai.status === "done" ? "✓" : "○"}</div>
                          <span className="rb-step-title">{ai.description}</span>
                          <span className="rb-step-time">{ai.owner}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pm.lessons_learned.length > 0 && (
                  <div>
                    <strong style={{ fontSize: 12, color: "var(--mute)" }}>Lessons Learned:</strong>
                    <ul style={{ margin: "4px 0", paddingLeft: 16, fontSize: 13 }}>{pm.lessons_learned.map((l, i) => <li key={i}>{l}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
