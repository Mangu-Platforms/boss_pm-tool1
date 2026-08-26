"use client";

import { useEffect, useState } from "react";

type Issue = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
};

const priorityOrder = ["critical", "high", "medium", "low"];
const priorityColors: Record<string, string> = {
  critical: "red",
  high: "gold",
  medium: "",
  low: "mute",
};

export default function PrioritiesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => setIssues(data.issues || []));
  }, []);

  const grouped = priorityOrder.map((p) => ({
    priority: p,
    issues: issues.filter((i) => i.priority === p),
  }));

  return (
    <main>
      <div className="kicker">Planning</div>
      <h1>Priority Board</h1>
      <p className="lede">Issues grouped by priority level for focused triage.</p>

      <div className="prio-board">
        {grouped.map(({ priority, issues: grp }) => (
          <div key={priority} className={`prio-column prio-col-${priority}`}>
            <h3 className={`prio-col-title priority ${priorityColors[priority]}`}>
              {priority} <span className="prio-count">{grp.length}</span>
            </h3>
            <div className="prio-items">
              {grp.map((issue) => (
                <div key={issue.id} className="prio-item">
                  <span className="mono prio-id">{issue.id}</span>
                  <span className="prio-title">{issue.title}</span>
                  <span className={`priority ${issue.status === "done" ? "green" : issue.status === "doing" ? "gold" : "mute"}`}>
                    {issue.status}
                  </span>
                </div>
              ))}
              {grp.length === 0 && <p className="hint">No issues</p>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
