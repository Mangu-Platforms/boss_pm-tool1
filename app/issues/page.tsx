"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IssueCreate } from "@/components/IssueCreate";
import { formatCap } from "@/lib/money";
import type { Issue, Product } from "@/lib/types";

export default function IssuesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setIssues(data.issues || []);
      });
  }, []);

  const shown = useMemo(
    () => issues.filter((i) => filter === "all" || i.product_id === filter),
    [issues, filter]
  );

  function productName(id: string) {
    return products.find((p) => p.id === id)?.name || id;
  }

  return (
    <main>
      <div className="kicker">Golden path step 2–3</div>
      <h1>Issues</h1>
      <p className="lede">Create lands in this list immediately. Agent rows show a cap. GitHub sync is a separate read.</p>
      <IssueCreate products={products} onCreated={(issue) => setIssues((prev) => [issue, ...prev])} />
      <div className="filters">
        <button className="chip" data-on={filter === "all"} onClick={() => setFilter("all")}>
          all
        </button>
        {products.map((p) => (
          <button key={p.id} className="chip" data-on={filter === p.id} onClick={() => setFilter(p.id)}>
            {p.slug}
          </button>
        ))}
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Product</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Cap</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((i) => (
            <tr key={i.id} data-pending={i.pending ? "true" : "false"}>
              <td>{i.title}</td>
              <td>
                <Link href={`/products/${products.find((p) => p.id === i.product_id)?.slug || ""}`}>
                  {productName(i.product_id)}
                </Link>
              </td>
              <td className={`status ${i.status}`}>{i.status}</td>
              <td>{i.assignee_kind === "agent" ? <span className="hint">{i.agent_name}</span> : i.assignee_user}</td>
              <td>{formatCap(i.cost_cap_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
