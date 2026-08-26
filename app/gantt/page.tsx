"use client";

import { useState, useEffect } from "react";

type GanttItem = {
  id: string;
  title: string;
  type: "issue" | "milestone";
  start_date: string | null;
  end_date: string | null;
  status: string;
  priority?: string;
  progress: number;
};

export default function GanttPage() {
  const [items, setItems] = useState<GanttItem[]>([]);
  const [range, setRange] = useState<{ min: string; max: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/gantt").then((r) => r.json()),
      fetch("/api/gantt?range=true").then((r) => r.json()),
    ]).then(([i, r]) => { setItems(i); setRange(r); });
  }, []);

  function barStyle(item: GanttItem) {
    if (!range || !item.start_date) return { left: "0%", width: "100%" };
    const minT = new Date(range.min).getTime();
    const maxT = new Date(range.max).getTime();
    const span = maxT - minT || 1;
    const startT = new Date(item.start_date).getTime();
    const endT = item.end_date ? new Date(item.end_date).getTime() : startT + 86400000 * 7;
    const left = ((startT - minT) / span) * 100;
    const width = Math.max(((endT - startT) / span) * 100, 2);
    return { left: `${Math.max(left, 0)}%`, width: `${Math.min(width, 100 - Math.max(left, 0))}%` };
  }

  return (
    <main className="main">
      <h1>Gantt Chart</h1>
      {range && <p className="gantt-range">{range.min} — {range.max}</p>}

      <div className="gantt-chart">
        {items.map((item) => (
          <div key={item.id} className="gantt-row">
            <div className="gantt-label">
              <span className={`gantt-type gantt-type-${item.type}`}>{item.type === "milestone" ? "M" : "I"}</span>
              <span className="gantt-title">{item.title}</span>
            </div>
            <div className="gantt-track">
              <div className="gantt-bar" style={barStyle(item)}>
                <div className="gantt-progress" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
