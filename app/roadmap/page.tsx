"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Issue, Product } from "@/lib/types";

type Week = { label: string; start: string; end: string; issues: Issue[] };

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function formatWeek(start: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[start.getMonth()]} ${start.getDate()}`;
}

export default function RoadmapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => {
        setIssues(data.issues || []);
        setProducts(data.products || []);
      });
  }, []);

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  const { weeks, backlog } = useMemo(() => {
    const active = issues.filter((i) => i.status !== "done" && i.status !== "cancelled");
    const withDue = active.filter((i) => i.due_on);
    const noDue = active.filter((i) => !i.due_on);

    const weekMap: Record<string, Week> = {};

    for (const issue of withDue) {
      const d = new Date(issue.due_on!);
      const mon = getMonday(d);
      const key = mon.toISOString().slice(0, 10);
      if (!weekMap[key]) {
        const end = new Date(mon);
        end.setDate(end.getDate() + 6);
        weekMap[key] = {
          label: `${formatWeek(mon)} – ${formatWeek(end)}`,
          start: key,
          end: end.toISOString().slice(0, 10),
          issues: [],
        };
      }
      weekMap[key].issues.push(issue);
    }

    const sorted = Object.values(weekMap).sort((a, b) => a.start.localeCompare(b.start));
    return { weeks: sorted, backlog: noDue };
  }, [issues]);

  const PRIORITY_COLORS: Record<string, string> = {
    critical: "var(--danger)",
    high: "var(--warn)",
    medium: "var(--accent)",
    low: "var(--muted)",
  };

  if (!issues.length && !products.length) {
    return <main><p className="empty">Loading roadmap...</p></main>;
  }

  return (
    <main>
      <div className="kicker">Timeline</div>
      <h1>Roadmap</h1>
      <p className="lede">Active issues grouped by due week. Drag due dates on issue pages to reschedule.</p>

      {weeks.length === 0 && backlog.length === 0 && (
        <p className="empty">No active issues. Create some to populate the roadmap.</p>
      )}

      <div className="roadmap-timeline">
        {weeks.map((week) => (
          <div key={week.start} className="roadmap-week">
            <div className="roadmap-week-header">
              <span className="roadmap-week-label">{week.label}</span>
              <span className="hint">{week.issues.length} issue{week.issues.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="roadmap-items">
              {week.issues.map((issue) => (
                <Link key={issue.id} href={`/issues/${issue.id}`} className="roadmap-item">
                  <span
                    className="roadmap-dot"
                    style={{ background: PRIORITY_COLORS[issue.priority] || "var(--muted)" }}
                  />
                  <span className="roadmap-item-title">{issue.title}</span>
                  <span className="roadmap-item-meta">
                    {productMap[issue.product_id]?.slug || "–"}
                    {issue.assignee_kind === "agent" && (
                      <span className="agent-badge agent-badge-sm">{issue.agent_name}</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {backlog.length > 0 && (
          <div className="roadmap-week roadmap-backlog">
            <div className="roadmap-week-header">
              <span className="roadmap-week-label">No due date</span>
              <span className="hint">{backlog.length} issue{backlog.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="roadmap-items">
              {backlog.map((issue) => (
                <Link key={issue.id} href={`/issues/${issue.id}`} className="roadmap-item">
                  <span
                    className="roadmap-dot"
                    style={{ background: PRIORITY_COLORS[issue.priority] || "var(--muted)" }}
                  />
                  <span className="roadmap-item-title">{issue.title}</span>
                  <span className="roadmap-item-meta">
                    {productMap[issue.product_id]?.slug || "–"}
                    {issue.assignee_kind === "agent" && (
                      <span className="agent-badge agent-badge-sm">{issue.agent_name}</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
