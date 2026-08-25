"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IssueCreate } from "@/components/IssueCreate";
import { IssueTable } from "@/components/IssueTable";
import { SearchInput } from "@/components/SearchInput";
import type { Issue, IssueStatus, Product } from "@/lib/types";

export default function IssuesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "user" | "agent">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setIssues(data.issues || []);
      });
  }, []);

  const shown = useMemo(
    () =>
      issues.filter((i) => {
        if (productFilter !== "all" && i.product_id !== productFilter) return false;
        if (statusFilter !== "all" && i.status !== statusFilter) return false;
        if (assigneeFilter !== "all" && i.assignee_kind !== assigneeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = i.title.toLowerCase().includes(q);
          const matchBody = i.body.toLowerCase().includes(q);
          const matchAssignee = (i.assignee_user || i.agent_name || "").toLowerCase().includes(q);
          if (!matchTitle && !matchBody && !matchAssignee) return false;
        }
        return true;
      }),
    [issues, productFilter, statusFilter, assigneeFilter, search]
  );

  const handleOptimistic = useCallback((issue: Issue) => {
    setIssues((prev) => [issue, ...prev]);
  }, []);

  const handleCreated = useCallback((issue: Issue) => {
    setIssues((prev) => {
      const filtered = prev.filter((i) => !i.pending);
      return [issue, ...filtered];
    });
  }, []);

  return (
    <main>
      <div className="kicker">All issues</div>
      <h1>Issues</h1>
      <p className="lede">
        Create lands instantly — before the network roundtrip. Agent rows show a cap.
      </p>

      <SearchInput value={search} onChange={setSearch} />

      <IssueCreate
        products={products}
        onOptimistic={handleOptimistic}
        onCreated={handleCreated}
      />

      <div className="filters">
        <button className="chip" data-on={productFilter === "all"} onClick={() => setProductFilter("all")}>
          all products
        </button>
        {products.map((p) => (
          <button key={p.id} className="chip" data-on={productFilter === p.id} onClick={() => setProductFilter(p.id)}>
            {p.slug}
          </button>
        ))}
      </div>

      <div className="filters">
        {(["all", "open", "doing", "backlog", "done", "cancelled"] as const).map((s) => (
          <button key={s} className="chip" data-on={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {s}
          </button>
        ))}
        <span className="filter-sep">|</span>
        {(["all", "user", "agent"] as const).map((a) => (
          <button key={a} className="chip" data-on={assigneeFilter === a} onClick={() => setAssigneeFilter(a)}>
            {a}
          </button>
        ))}
      </div>

      <div className="issue-count-bar">
        <span className="hint">{shown.length} issue{shown.length !== 1 ? "s" : ""}</span>
      </div>

      <IssueTable issues={shown} products={products} />
    </main>
  );
}
