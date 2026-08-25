"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCap } from "@/lib/money";
import type { EngineTag, Issue, Product } from "@/lib/types";

const COLUMNS = [
  { key: "backlog", label: "Backlog" },
  { key: "open", label: "Open" },
  { key: "doing", label: "In Progress" },
  { key: "done", label: "Done" },
] as const;

export default function KanbanPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [engine, setEngine] = useState<EngineTag | "all">("all");
  const [moving, setMoving] = useState<string | null>(null);

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

  async function moveIssue(issueId: string, newStatus: string) {
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
    } catch {
      // Revert on error would go here
    } finally {
      setMoving(null);
    }
  }

  return (
    <main>
      <div className="kicker">Kanban</div>
      <h1>Board</h1>
      <p className="lede">Drag-free status board. Click arrows to move issues between columns.</p>

      <div className="filters">
        {(["all", "cash-engine", "lab"] as const).map((v) => (
          <button key={v} className="chip" data-on={engine === v} onClick={() => setEngine(v)}>
            {v}
          </button>
        ))}
      </div>

      <div className="kanban">
        {COLUMNS.map((col) => {
          const colIssues = filteredIssues.filter((i) => i.status === col.key);
          return (
            <div key={col.key} className="kanban-col">
              <div className="kanban-header">
                <span className="kanban-title">{col.label}</span>
                <span className="kanban-count">{colIssues.length}</span>
              </div>
              <div className="kanban-cards">
                {colIssues.map((issue) => {
                  const colIdx = COLUMNS.findIndex((c) => c.key === col.key);
                  return (
                    <div key={issue.id} className={`kanban-card ${moving === issue.id ? "kanban-moving" : ""}`}>
                      <Link href={`/issues/${issue.id}`} className="kanban-card-title">
                        {issue.title}
                      </Link>
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
      </div>
    </main>
  );
}
