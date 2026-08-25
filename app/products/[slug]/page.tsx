"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IssueCreate } from "@/components/IssueCreate";
import { formatCap } from "@/lib/money";
import type { Issue, IssueLink, Product } from "@/lib/types";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [links, setLinks] = useState<IssueLink[]>([]);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/issues");
    const data = await res.json();
    const list = (data.products || []) as Product[];
    setProducts(list);
    const p = list.find((x) => x.slug === slug) || null;
    setProduct(p);
    setIssues((data.issues || []).filter((i: Issue) => i.product_id === p?.id));
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function sync() {
    setSyncMsg("syncing…");
    const res = await fetch("/api/sync/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSyncMsg(data.error || "sync failed");
      return;
    }
    const row = data.results?.[0];
    setSyncMsg(row?.ok ? `pulled ${row.count} GitHub issues · mirrored ${data.mirrored}` : row?.error || "sync failed");
    if (data.links) setLinks(data.links);
    await load();
  }

  if (!product) {
    return (
      <main>
        <p className="hint">Loading product…</p>
      </main>
    );
  }

  return (
    <main>
      <div className="kicker">
        {product.github_repo ? `${product.github_owner}/${product.github_repo}` : "unlinked"}
      </div>
      <h1>{product.name}</h1>
      <p className="lede">
        <span className={`tag ${product.engine_tag === "cash-engine" ? "engine" : "lab"}`}>{product.engine_tag}</span>
        {"  "}
        {product.money_note}
      </p>
      <IssueCreate
        products={products}
        defaultProductId={product.id}
        onCreated={(issue) => setIssues((prev) => [issue, ...prev])}
      />
      <div className="filters">
        <button className="chip" onClick={sync} type="button">
          Sync GitHub issues
        </button>
        {syncMsg ? <span className="hint">{syncMsg}</span> : <span className="hint">one-way read. status mirrors GH when linked.</span>}
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Cap</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => (
            <tr key={i.id}>
              <td>{i.title}</td>
              <td className={`status ${i.status}`}>{i.status}</td>
              <td>{i.assignee_kind === "agent" ? i.agent_name : i.assignee_user}</td>
              <td>{formatCap(i.cost_cap_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {links.length ? (
        <>
          <h1 style={{ fontSize: 18, marginTop: 28 }}>GitHub mirror</h1>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>GH state</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id}>
                  <td>
                    <a href={l.github_html_url} target="_blank" rel="noreferrer">
                      {l.github_issue_number}
                    </a>
                  </td>
                  <td>{l.github_title}</td>
                  <td className={`status ${l.github_state === "closed" ? "done" : "open"}`}>{l.github_state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </main>
  );
}
