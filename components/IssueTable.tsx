"use client";

import Link from "next/link";
import { formatCap } from "@/lib/money";
import type { Issue, Product } from "@/lib/types";

type Props = {
  issues: Issue[];
  products: Product[];
  showProduct?: boolean;
};

export function IssueTable({ issues, products, showProduct = true }: Props) {
  function productName(id: string) {
    return products.find((p) => p.id === id)?.name || id;
  }
  function productSlug(id: string) {
    return products.find((p) => p.id === id)?.slug || "";
  }

  if (!issues.length) {
    return <p className="hint" style={{ padding: "16px 0" }}>No issues yet. Create one above.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Title</th>
          {showProduct && <th>Product</th>}
          <th>Status</th>
          <th>Assignee</th>
          <th>Cap</th>
          <th>Due</th>
        </tr>
      </thead>
      <tbody>
        {issues.map((i) => (
          <tr key={i.id} className={i.pending ? "row-pending" : ""}>
            <td>
              {i.pending ? (
                <span className="issue-title">{i.title}</span>
              ) : (
                <Link href={`/issues/${i.id}`} className="issue-title issue-link">{i.title}</Link>
              )}
              {i.pending && <span className="badge-pending">saving</span>}
            </td>
            {showProduct && (
              <td>
                <Link href={`/products/${productSlug(i.product_id)}`} className="product-link">
                  {productName(i.product_id)}
                </Link>
              </td>
            )}
            <td>
              <span className={`status ${i.status}`}>{i.status}</span>
            </td>
            <td>
              {i.assignee_kind === "agent" ? (
                <span className="agent-badge">{i.agent_name}</span>
              ) : (
                <span>{i.assignee_user}</span>
              )}
            </td>
            <td className="cap-cell">{formatCap(i.cost_cap_cents)}</td>
            <td className="hint">{i.due_on || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
