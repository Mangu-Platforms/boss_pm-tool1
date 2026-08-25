"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IssueCreate } from "@/components/IssueCreate";
import { IssueTable } from "@/components/IssueTable";
import { SyncButton } from "@/components/SyncButton";
import { formatCap } from "@/lib/money";
import type { Issue, IssueLink, Product } from "@/lib/types";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [links, setLinks] = useState<IssueLink[]>([]);

  const load = useCallback(async () => {
    const [issuesRes, linksRes] = await Promise.all([
      fetch("/api/issues").then((r) => r.json()),
      fetch(`/api/sync/github?slug=${slug}`).then((r) => r.json()),
    ]);
    const list = (issuesRes.products || []) as Product[];
    setProducts(list);
    const p = list.find((x) => x.slug === slug) || null;
    setProduct(p);
    setIssues((issuesRes.issues || []).filter((i: Issue) => i.product_id === p?.id));
    setLinks(linksRes.links || []);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOptimistic = useCallback((issue: Issue) => {
    setIssues((prev) => [issue, ...prev]);
  }, []);

  const handleCreated = useCallback((issue: Issue) => {
    setIssues((prev) => {
      const filtered = prev.filter((i) => !i.pending);
      return [issue, ...filtered];
    });
  }, []);

  if (!product) {
    return (
      <main>
        <div className="loading-state">
          <p className="hint">Loading product…</p>
        </div>
      </main>
    );
  }

  const agentIssues = issues.filter((i) => i.assignee_kind === "agent");
  const totalCap = agentIssues.reduce((acc, i) => acc + (i.cost_cap_cents || 0), 0);

  return (
    <main>
      <div className="kicker">
        {product.github_repo ? `${product.github_owner}/${product.github_repo}` : "unlinked"}
      </div>
      <h1>{product.name}</h1>
      <p className="lede">
        <span className={`tag ${product.engine_tag === "cash-engine" ? "engine" : "lab"}`}>
          {product.engine_tag}
        </span>
        {"  "}
        {product.money_note}
      </p>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-value">{issues.length}</span>
          <span className="stat-label">Issues</span>
        </div>
        <div className="stat">
          <span className="stat-value">{agentIssues.length}</span>
          <span className="stat-label">Agent tasks</span>
        </div>
        <div className="stat">
          <span className="stat-value">{formatCap(totalCap)}</span>
          <span className="stat-label">Total cap</span>
        </div>
        <div className="stat">
          <span className="stat-value">{links.length}</span>
          <span className="stat-label">GH issues</span>
        </div>
      </div>

      <IssueCreate
        products={products}
        defaultProductId={product.id}
        onOptimistic={handleOptimistic}
        onCreated={handleCreated}
      />

      <SyncButton
        slug={slug}
        onSynced={(data) => {
          if (data.links) setLinks(data.links as IssueLink[]);
          load();
        }}
      />

      <h2 className="section-title">Issues</h2>
      <IssueTable issues={issues} products={products} showProduct={false} />

      {links.length > 0 && (
        <>
          <h2 className="section-title">GitHub mirror</h2>
          <p className="hint" style={{ marginBottom: 12 }}>
            Read-only. Status syncs from GitHub on each pull.
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>State</th>
                <th>Synced</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id}>
                  <td>
                    <a href={l.github_html_url} target="_blank" rel="noreferrer" className="gh-link">
                      #{l.github_issue_number}
                    </a>
                  </td>
                  <td>{l.github_title}</td>
                  <td>
                    <span className={`status ${l.github_state === "closed" ? "done" : "open"}`}>
                      {l.github_state}
                    </span>
                  </td>
                  <td className="hint">{new Date(l.synced_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
