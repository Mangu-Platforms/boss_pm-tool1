"use client";

import { useEffect, useState } from "react";

type Column = { status: string; issues: { id: string; title: string; priority: string; assignee_user: string | null }[] };
type Swimlane = { key: string; label: string; columns: Column[] };
type Board = { criteria: string; swimlanes: Swimlane[] };

export default function KanbanSwimlanesPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [criteria, setCriteria] = useState("none");

  function load(c: string) {
    fetch(`/api/kanban-swimlanes?criteria=${c}`).then((r) => r.json()).then(setBoard);
  }
  useEffect(() => { load(criteria); }, [criteria]);

  if (!board) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Kanban Swimlanes</h1>
      <div className="ks-controls">
        <label>Group by:</label>
        <select value={criteria} onChange={(e) => setCriteria(e.target.value)}>
          <option value="none">None</option>
          <option value="assignee">Assignee</option>
          <option value="priority">Priority</option>
          <option value="product">Product</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="ks-board">
        {board.swimlanes.map((lane) => (
          <div key={lane.key} className="ks-lane">
            <div className="ks-lane-header">{lane.label}</div>
            <div className="ks-columns">
              {lane.columns.map((col) => (
                <div key={col.status} className="ks-col">
                  <div className="ks-col-header">{col.status} <span className="ks-count">{col.issues.length}</span></div>
                  <div className="ks-cards">
                    {col.issues.map((issue) => (
                      <div key={issue.id} className="ks-card">
                        <div className="ks-card-id">{issue.id}</div>
                        <div className="ks-card-title">{issue.title}</div>
                        <div className="ks-card-meta">
                          <span className={`pill pill-${issue.priority}`}>{issue.priority}</span>
                          {issue.assignee_user && <span>{issue.assignee_user}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
