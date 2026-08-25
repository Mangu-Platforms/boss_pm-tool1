"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EngineTag, Issue, Product } from "@/lib/types";

type ActivityItem = { id: string; action: string; detail: string; created_at: string };

export default function BoardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [engine, setEngine] = useState<EngineTag | "all">("all");

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setIssues(data.issues || []);
      });
    fetch("/api/activity?limit=5")
      .then((r) => r.json())
      .then((data) => setActivity(data.events || []));
  }, []);

  const shown = useMemo(
    () => products.filter((p) => engine === "all" || p.engine_tag === engine),
    [products, engine]
  );

  function issueCount(productId: string) {
    return issues.filter((i) => i.product_id === productId && i.status !== "done" && i.status !== "cancelled").length;
  }

  function agentCount(productId: string) {
    return issues.filter((i) => i.product_id === productId && i.assignee_kind === "agent").length;
  }

  const totalOpen = issues.filter((i) => i.status !== "done" && i.status !== "cancelled").length;
  const totalAgent = issues.filter((i) => i.assignee_kind === "agent").length;
  const totalCap = issues
    .filter((i) => i.cost_cap_cents != null)
    .reduce((acc, i) => acc + (i.cost_cap_cents || 0), 0);

  return (
    <main>
      <div className="kicker">Portfolio truth</div>
      <h1>Boss PM</h1>
      <p className="lede">
        One board for the entire Mangu portfolio. Cash engines earn. Labs learn.
        Assign Alice or a swarm with a dollar cap.
      </p>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-value">{products.length}</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalOpen}</span>
          <span className="stat-label">Open issues</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalAgent}</span>
          <span className="stat-label">Agent tasks</span>
        </div>
        <div className="stat">
          <span className="stat-value">${(totalCap / 100).toFixed(2)}</span>
          <span className="stat-label">Total cap</span>
        </div>
      </div>

      <div className="claims">
        <div className="claim">
          <strong>1 · Instant UI</strong>
          <p>Optimistic create. Issue appears before the network roundtrip completes.</p>
        </div>
        <div className="claim">
          <strong>2 · Agent-native</strong>
          <p>Assign a user or an agent. Swarm requires a cost cap — API rejects without one.</p>
        </div>
        <div className="claim">
          <strong>3 · Portfolio truth</strong>
          <p>Every repo. Engine filter. GitHub status mirrored on sync.</p>
        </div>
      </div>

      <div className="filters">
        {(["all", "cash-engine", "lab"] as const).map((v) => (
          <button key={v} className="chip" data-on={engine === v} onClick={() => setEngine(v)}>
            {v === "all" ? `All (${products.length})` : `${v} (${products.filter((p) => p.engine_tag === v).length})`}
          </button>
        ))}
      </div>

      <div className="grid">
        {shown.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="card">
            <div className="card-top">
              <span className={`tag ${p.engine_tag === "cash-engine" ? "engine" : "lab"}`}>{p.engine_tag}</span>
              {issueCount(p.id) > 0 && (
                <span className="issue-count">{issueCount(p.id)} open</span>
              )}
            </div>
            <strong>{p.name}</strong>
            <span className="hint">
              {p.github_repo ? `${p.github_owner}/${p.github_repo}` : "no repo"}
            </span>
            {agentCount(p.id) > 0 && (
              <span className="agent-count-badge">{agentCount(p.id)} agent task{agentCount(p.id) > 1 ? "s" : ""}</span>
            )}
            <span className="money">{p.money_note}</span>
          </Link>
        ))}
      </div>

      {activity.length > 0 && (
        <div className="home-activity">
          <div className="home-activity-header">
            <h2 className="section-title">Recent activity</h2>
            <Link href="/activity" className="chip chip-sm">View all</Link>
          </div>
          <div className="home-activity-list">
            {activity.map((a) => (
              <div key={a.id} className="home-activity-item">
                <span className="home-activity-action">{a.action}</span>
                <span className="home-activity-detail">{a.detail}</span>
                <span className="home-activity-time">{new Date(a.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
