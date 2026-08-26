"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { formatCap } from "@/lib/money";
import { toast } from "@/components/Toast";
import type { EngineTag, Issue, Product } from "@/lib/types";

const COLUMNS = [
  { key: "backlog", label: "Backlog" },
  { key: "open", label: "Open" },
  { key: "doing", label: "In Progress" },
  { key: "done", label: "Done" },
] as const;

const PRIORITY_DOT: Record<string, string> = {
  critical: "priority-critical",
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

type Swimlane = "none" | "product" | "assignee";

export default function KanbanPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [engine, setEngine] = useState<EngineTag | "all">("all");
  const [moving, setMoving] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [swimlane, setSwimlane] = useState<Swimlane>("none");

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setIssues(data.issues || []);
      });
  }, []);

  const filteredIssues = useMemo(() => {
    if (engine === "all") return issues;
    const productIds = new Set(products.filter((p) => p.engine_tag === engine).map((p) => p.id));
    return issues.filter((i) => productIds.has(i.product_id));
  }, [issues, products, engine]);

  function productName(id: string) {
    return products.find((p) => p.id === id)?.name || id;
  }

  const moveIssue = useCallback(async (issueId: string, newStatus: string) => {
    setMoving(issueId);
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: newStatus as Issue["status"] } : i))
    );
    try {
      await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast(`Moved to ${newStatus}`, "success");
    } catch {
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: i.status } : i))
      );
      toast("Failed to move issue", "error");
    } finally {
      setMoving(null);
    }
  }, []);

  function handleDragStart(e: React.DragEvent, issueId: string) {
    e.dataTransfer.setData("text/plain", issueId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, colKey: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(colKey);
  }

  function handleDragLeave() {
    setDragOver(null);
  }

  function handleDrop(e: React.DragEvent, colKey: string) {
    e.preventDefault();
    setDragOver(null);
    const issueId = e.dataTransfer.getData("text/plain");
    if (issueId) {
      moveIssue(issueId, colKey);
    }
  }

  function getSwimlanes(): { key: string; label: string; issues: Issue[] }[] {
    if (swimlane === "product") {
      const groups: Record<string, Issue[]> = {};
      for (const issue of filteredIssues) {
        const name = productName(issue.product_id);
        if (!groups[name]) groups[name] = [];
        groups[name].push(issue);
      }
      return Object.entries(groups).map(([name, iss]) => ({ key: name, label: name, issues: iss }));
    }
    if (swimlane === "assignee") {
      const groups: Record<string, Issue[]> = {};
      for (const issue of filteredIssues) {
        const name = issue.assignee_kind === "agent" ? `agent:${issue.agent_name}` : (issue.assignee_user || "unassigned");
        if (!groups[name]) groups[name] = [];
        groups[name].push(issue);
      }
      return Object.entries(groups).map(([name, iss]) => ({ key: name, label: name, issues: iss }));
    }
    return [];
  }

  return (
    <main>
      <div className="kicker">Kanban</div>
      <h1>Board</h1>
      <p className="lede">Drag cards between columns or click arrows to move issues.</p>

      <div className="filters">
        {(["all", "cash-engine", "lab"] as const).map((v) => (
          <button key={v} className="chip" data-on={engine === v} onClick={() => setEngine(v)}>
            {v}
          </button>
        ))}
        <span className="filter-sep">|</span>
        <span className="hint">Swim:</span>
        {(["none", "product", "assignee"] as const).map((s) => (
          <button key={s} className="chip chip-sm" data-on={swimlane === s} onClick={() => setSwimlane(s)}>
            {s}
          </button>
        ))}
      </div>

      {swimlane !== "none" && (
        <div className="swimlane-container">
          {getSwimlanes().map((lane) => (
            <div key={lane.key} className="swimlane-row">
              <div className="swimlane-label">{lane.label}</div>
              <div className="kanban">
                {COLUMNS.map((col) => {
                  const colIssues = lane.issues.filter((i) => i.status === col.key);
                  return (
                    <div
                      key={col.key}
                      className={`kanban-col kanban-col-compact ${dragOver === `${lane.key}-${col.key}` ? "kanban-col-dragover" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(`${lane.key}-${col.key}`); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) moveIssue(id, col.key); }}
                    >
                      <div className="kanban-header">
                        <span className="kanban-count">{colIssues.length}</span>
                      </div>
                      <div className="kanban-cards">
                        {colIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="kanban-card kanban-card-mini"
                            draggable
                            onDragStart={(e) => handleDragStart(e, issue.id)}
                          >
                            <Link href={`/issues/${issue.id}`} className="kanban-card-title">
                              {issue.title}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {swimlane === "none" && <div className="kanban">
        {COLUMNS.map((col) => {
          const colIssues = filteredIssues.filter((i) => i.status === col.key);
          return (
            <div
              key={col.key}
              className={`kanban-col ${dragOver === col.key ? "kanban-col-dragover" : ""}`}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="kanban-header">
                <span className="kanban-title">{col.label}</span>
                <span className="kanban-count">{colIssues.length}</span>
              </div>
              <div className="kanban-cards">
                {colIssues.map((issue) => {
                  const colIdx = COLUMNS.findIndex((c) => c.key === col.key);
                  return (
                    <div
                      key={issue.id}
                      className={`kanban-card ${moving === issue.id ? "kanban-moving" : ""}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                    >
                      <div className="kanban-card-top">
                        {issue.priority && (
                          <span className={`priority-dot ${PRIORITY_DOT[issue.priority] || ""}`} title={issue.priority} />
                        )}
                        <Link href={`/issues/${issue.id}`} className="kanban-card-title">
                          {issue.title}
                        </Link>
                      </div>
                      <div className="kanban-card-meta">
                        <span className="hint">{productName(issue.product_id)}</span>
                        {issue.assignee_kind === "agent" ? (
                          <span className="agent-badge">{issue.agent_name}</span>
                        ) : (
                          <span className="hint">{issue.assignee_user}</span>
                        )}
                      </div>
                      {issue.cost_cap_cents != null && (
                        <span className="kanban-cap">{formatCap(issue.cost_cap_cents)}</span>
                      )}
                      <div className="kanban-arrows">
                        {colIdx > 0 && (
                          <button
                            className="kanban-arrow"
                            onClick={() => moveIssue(issue.id, COLUMNS[colIdx - 1].key)}
                            title={`Move to ${COLUMNS[colIdx - 1].label}`}
                            type="button"
                          >
                            &larr;
                          </button>
                        )}
                        {colIdx < COLUMNS.length - 1 && (
                          <button
                            className="kanban-arrow"
                            onClick={() => moveIssue(issue.id, COLUMNS[colIdx + 1].key)}
                            title={`Move to ${COLUMNS[colIdx + 1].label}`}
                            type="button"
                          >
                            &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>}
    </main>
  );
}
