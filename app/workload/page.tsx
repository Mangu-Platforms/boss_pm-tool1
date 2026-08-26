"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Issue, Product } from "@/lib/types";

type Assignee = {
  key: string;
  kind: "user" | "agent";
  name: string;
  issues: Issue[];
  totalCapCents: number;
};

export default function WorkloadPage() {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => {
        const issues: Issue[] = data.issues || [];
        setProducts(data.products || []);

        const map = new Map<string, Assignee>();
        for (const issue of issues) {
          if (issue.status === "done" || issue.status === "cancelled") continue;
          const key = issue.assignee_kind === "agent"
            ? `agent:${issue.agent_name}`
            : `user:${issue.assignee_user}`;
          if (!map.has(key)) {
            map.set(key, {
              key,
              kind: issue.assignee_kind,
              name: issue.assignee_kind === "agent" ? issue.agent_name || "unknown" : issue.assignee_user || "unassigned",
              issues: [],
              totalCapCents: 0,
            });
          }
          const a = map.get(key)!;
          a.issues.push(issue);
          if (issue.cost_cap_cents) a.totalCapCents += issue.cost_cap_cents;
        }

        setAssignees(Array.from(map.values()).sort((a, b) => b.issues.length - a.issues.length));
      });
  }, []);

  const maxIssues = Math.max(...assignees.map((a) => a.issues.length), 1);

  function productName(id: string) {
    return products.find((p) => p.id === id)?.name || id;
  }

  return (
    <main>
      <div className="kicker">Team capacity</div>
      <h1>Workload</h1>
      <p className="lede">Active issue distribution across people and agents.</p>

      <div className="workload-grid">
        {assignees.map((a) => (
          <div key={a.key} className="workload-card">
            <div className="workload-header">
              <span className={a.kind === "agent" ? "agent-badge" : ""}>{a.name}</span>
              <span className="workload-count">{a.issues.length} active</span>
            </div>
            <div className="workload-bar-track">
              <div
                className="workload-bar-fill"
                style={{ width: `${(a.issues.length / maxIssues) * 100}%` }}
              />
            </div>
            {a.kind === "agent" && a.totalCapCents > 0 && (
              <span className="hint">Cap: ${(a.totalCapCents / 100).toFixed(0)}</span>
            )}
            <div className="workload-issues">
              {a.issues.slice(0, 5).map((i) => (
                <Link key={i.id} href={`/issues/${i.id}`} className="workload-issue-link">
                  <span className={`status ${i.status}`}>{i.status}</span>
                  <span className="workload-issue-title">{i.title}</span>
                  <span className="hint">{productName(i.product_id)}</span>
                </Link>
              ))}
              {a.issues.length > 5 && (
                <span className="hint">+{a.issues.length - 5} more</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {assignees.length === 0 && <p className="hint">No active issues assigned.</p>}
    </main>
  );
}
