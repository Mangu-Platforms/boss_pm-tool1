"use client";

import Link from "next/link";
import { formatCap } from "@/lib/money";
import { dueLabel } from "@/lib/dates";
import { PriorityBadge } from "./PriorityBadge";
import type { Issue, Product } from "@/lib/types";

type Props = {
  issues: Issue[];
  products: Product[];
  showProduct?: boolean;
  selected?: Set<string>;
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
};

export function IssueTable({ issues, products, showProduct = true, selected, onToggle, onToggleAll }: Props) {
  function productName(id: string) {
    return products.find((p) => p.id === id)?.name || id;
  }
  function productSlug(id: string) {
    return products.find((p) => p.id === id)?.slug || "";
  }

  const selectable = !!selected && !!onToggle;
  const allSelected = selectable && issues.length > 0 && issues.every((i) => selected.has(i.id));

  if (!issues.length) {
    return <p className="hint" style={{ padding: "16px 0" }}>No issues match the current filters.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: 32 }}>
                <input type="checkbox" checked={allSelected} onChange={onToggleAll} />
              </th>
            )}
            <th>Title</th>
            {showProduct && <th>Product</th>}
            <th>Priority</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Cap</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => {
            const due = dueLabel(i.due_on);
            return (
              <tr key={i.id} className={`${i.pending ? "row-pending" : ""} ${selectable && selected.has(i.id) ? "row-selected" : ""}`}>
                {selectable && (
                  <td>
                    <input type="checkbox" checked={selected.has(i.id)} onChange={() => onToggle(i.id)} />
                  </td>
                )}
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
                <td><PriorityBadge priority={i.priority} /></td>
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
                <td>
                  <span className={`due-${due.urgency}`}>{due.text}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
