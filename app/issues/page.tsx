"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IssueCreate } from "@/components/IssueCreate";
import { IssueTable } from "@/components/IssueTable";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { SearchInput } from "@/components/SearchInput";
import { toast } from "@/components/Toast";
import type { SavedView } from "@/lib/views";
import type { Issue, IssuePriority, IssueStatus, Product } from "@/lib/types";

export default function IssuesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "user" | "agent">("all");
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | "all">("all");
  const [sortBy, setSortBy] = useState<"created" | "priority" | "due">("created");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setIssues(data.issues || []);
      });
    fetch("/api/views")
      .then((r) => r.json())
      .then((data) => setSavedViews(data.views || []));
  }, []);

  const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  const shown = useMemo(() => {
    const filtered = issues.filter((i) => {
      if (productFilter !== "all" && i.product_id !== productFilter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (assigneeFilter !== "all" && i.assignee_kind !== assigneeFilter) return false;
      if (priorityFilter !== "all" && i.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = i.title.toLowerCase().includes(q);
        const matchBody = i.body.toLowerCase().includes(q);
        const matchAssignee = (i.assignee_user || i.agent_name || "").toLowerCase().includes(q);
        if (!matchTitle && !matchBody && !matchAssignee) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "priority") {
        return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
      }
      if (sortBy === "due") {
        const aD = a.due_on || "9999";
        const bD = b.due_on || "9999";
        return aD.localeCompare(bD);
      }
      return b.created_at.localeCompare(a.created_at);
    });
  }, [issues, productFilter, statusFilter, assigneeFilter, priorityFilter, sortBy, search]);

  const handleOptimistic = useCallback((issue: Issue) => {
    setIssues((prev) => [issue, ...prev]);
  }, []);

  const handleCreated = useCallback((issue: Issue) => {
    setIssues((prev) => {
      const filtered = prev.filter((i) => !i.pending);
      return [issue, ...filtered];
    });
  }, []);

  const handleToggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelected((prev) => {
      if (shown.every((i) => prev.has(i.id))) return new Set();
      return new Set(shown.map((i) => i.id));
    });
  }, [shown]);

  async function bulkSetStatus(status: IssueStatus) {
    const ids = Array.from(selected);
    const res = await fetch("/api/issues/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", ids, status }),
    });
    if (res.ok) {
      setIssues((prev) => prev.map((i) => ids.includes(i.id) ? { ...i, status, updated_at: new Date().toISOString() } : i));
      setSelected(new Set());
      toast(`${ids.length} issue${ids.length > 1 ? "s" : ""} → ${status}`);
    }
  }

  async function bulkSetPriority(priority: IssuePriority) {
    const ids = Array.from(selected);
    const res = await fetch("/api/issues/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_priority", ids, priority }),
    });
    if (res.ok) {
      setIssues((prev) => prev.map((i) => ids.includes(i.id) ? { ...i, priority, updated_at: new Date().toISOString() } : i));
      setSelected(new Set());
      toast(`${ids.length} issue${ids.length > 1 ? "s" : ""} → ${priority}`);
    }
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    if (!confirm(`Delete ${ids.length} issue${ids.length > 1 ? "s" : ""}?`)) return;
    const res = await fetch("/api/issues/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids }),
    });
    if (res.ok) {
      setIssues((prev) => prev.filter((i) => !ids.includes(i.id)));
      setSelected(new Set());
      toast(`Deleted ${ids.length} issue${ids.length > 1 ? "s" : ""}`);
    }
  }

  return (
    <main>
      <div className="kicker">All issues</div>
      <h1>Issues</h1>
      <p className="lede">
        Create lands instantly — before the network roundtrip. Agent rows show a cap.
      </p>

      <SearchInput value={search} onChange={setSearch} />

      <RecentlyViewed />

      <IssueCreate
        products={products}
        onOptimistic={handleOptimistic}
        onCreated={handleCreated}
      />

      {savedViews.length > 0 && (
        <div className="saved-views">
          <span className="hint">Views:</span>
          {savedViews.map((v) => (
            <button
              key={v.id}
              className="chip chip-sm"
              onClick={() => {
                if (v.filters.product) setProductFilter(v.filters.product);
                else setProductFilter("all");
                if (v.filters.status) setStatusFilter(v.filters.status as IssueStatus | "all");
                else setStatusFilter("all");
                if (v.filters.assignee) setAssigneeFilter(v.filters.assignee as "all" | "user" | "agent");
                else setAssigneeFilter("all");
                if (v.filters.priority) setPriorityFilter(v.filters.priority as IssuePriority | "all");
                else setPriorityFilter("all");
                if (v.sort) setSortBy(v.sort as "created" | "priority" | "due");
                toast(`View: ${v.name}`);
              }}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

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
        <span className="filter-sep">|</span>
        {(["all", "critical", "high", "medium", "low"] as const).map((p) => (
          <button key={p} className="chip" data-on={priorityFilter === p} onClick={() => setPriorityFilter(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="issue-count-bar">
        <span className="hint">{shown.length} issue{shown.length !== 1 ? "s" : ""}</span>
        <span className="filter-sep">|</span>
        <span className="hint">Sort:</span>
        {(["created", "priority", "due"] as const).map((s) => (
          <button key={s} className="chip chip-sm" data-on={sortBy === s} onClick={() => setSortBy(s)}>
            {s}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selected.size} selected</span>
          <div className="bulk-actions">
            <span className="hint">Status:</span>
            {(["open", "doing", "backlog", "done", "cancelled"] as const).map((s) => (
              <button key={s} className="chip chip-sm" onClick={() => bulkSetStatus(s)}>{s}</button>
            ))}
            <span className="filter-sep">|</span>
            <span className="hint">Priority:</span>
            {(["critical", "high", "medium", "low"] as const).map((p) => (
              <button key={p} className="chip chip-sm" onClick={() => bulkSetPriority(p)}>{p}</button>
            ))}
            <span className="filter-sep">|</span>
            <button className="chip chip-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={bulkDelete}>
              delete
            </button>
          </div>
          <button className="chip chip-sm" onClick={() => setSelected(new Set())}>clear</button>
        </div>
      )}

      <IssueTable
        issues={shown}
        products={products}
        selected={selected}
        onToggle={handleToggle}
        onToggleAll={handleToggleAll}
      />
    </main>
  );
}
