"use client";

import { useEffect, useState } from "react";

type Issue = {
  id: string;
  title: string;
  status: string;
  due_on: string | null;
  priority: string;
};

type Milestone = {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
};

export default function TimelinePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => {
        const all = (data.issues || []) as Issue[];
        setIssues(all.filter((i) => i.due_on));
      });
    fetch("/api/milestones")
      .then((r) => r.json())
      .then((data) => setMilestones((data.milestones || []).filter((m: Milestone) => m.due_date)));
  }, []);

  const allDates = [
    ...issues.map((i) => i.due_on!),
    ...milestones.map((m) => m.due_date!),
  ].sort();

  const minDate = allDates.length > 0 ? allDates[0] : new Date().toISOString().slice(0, 10);
  const maxDate = allDates.length > 0 ? allDates[allDates.length - 1] : minDate;

  const start = new Date(minDate);
  const end = new Date(maxDate);
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  function positionPercent(dateStr: string): number {
    const d = new Date(dateStr);
    const days = Math.ceil((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(100, Math.max(0, (days / totalDays) * 100));
  }

  const priorityColors: Record<string, string> = {
    critical: "var(--danger)",
    high: "var(--gold)",
    medium: "var(--paper-dim)",
    low: "var(--mute)",
  };

  return (
    <main>
      <div className="kicker">Planning</div>
      <h1>Timeline</h1>
      <p className="lede">Visual timeline of issues and milestones by due date.</p>

      {allDates.length === 0 ? (
        <p className="hint">No items with due dates to display on the timeline.</p>
      ) : (
        <div className="timeline-container">
          <div className="timeline-track">
            <div className="timeline-axis">
              <span className="mono hint">{minDate}</span>
              <span className="mono hint">{maxDate}</span>
            </div>

            <div className="timeline-section">
              <h3 className="timeline-section-title">Milestones</h3>
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="timeline-item timeline-milestone"
                  style={{ left: `${positionPercent(m.due_date!)}%` }}
                  title={`${m.title} - ${m.due_date}`}
                >
                  <span className="timeline-diamond" />
                  <span className="timeline-item-label">{m.title}</span>
                </div>
              ))}
            </div>

            <div className="timeline-section">
              <h3 className="timeline-section-title">Issues</h3>
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="timeline-item"
                  style={{ left: `${positionPercent(issue.due_on!)}%` }}
                  title={`${issue.title} - ${issue.due_on}`}
                >
                  <span
                    className="timeline-dot"
                    style={{ background: priorityColors[issue.priority] || "var(--paper-dim)" }}
                  />
                  <span className="timeline-item-label">{issue.id}: {issue.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
