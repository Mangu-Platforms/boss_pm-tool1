"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCap } from "@/lib/money";
import type { Comment } from "@/lib/comments";
import type { Issue, IssuePriority, Product } from "@/lib/types";

const STATUSES = ["backlog", "open", "doing", "done", "cancelled"] as const;
const PRIORITIES = ["critical", "high", "medium", "low"] as const;

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [issueRes, productsRes, commentsRes] = await Promise.all([
      fetch(`/api/issues/${id}`).then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch(`/api/issues/${id}/comments`).then((r) => r.json()),
    ]);
    setIssue(issueRes.issue || null);
    setProducts(productsRes.products || []);
    setComments(commentsRes.comments || []);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(status: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "update failed");
        return;
      }
      setIssue(data.issue);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function setPriority(priority: IssuePriority) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "update failed");
        return;
      }
      setIssue(data.issue);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this issue?")) return;
    const res = await fetch(`/api/issues/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/issues");
    }
  }

  if (!issue) {
    return (
      <main>
        <div className="loading-state">
          <p className="hint">Loading issue…</p>
        </div>
      </main>
    );
  }

  const product = products.find((p) => p.id === issue.product_id);

  return (
    <main>
      <div className="kicker">
        {product ? (
          <Link href={`/products/${product.slug}`}>
            {product.github_owner}/{product.github_repo || product.slug}
          </Link>
        ) : (
          "issue"
        )}
      </div>
      <h1>{issue.title}</h1>
      {issue.body && <p className="lede">{issue.body}</p>}

      <div className="detail-grid">
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <div className="status-selector">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`chip ${issue.status === s ? "chip-active" : ""}`}
                data-on={issue.status === s}
                onClick={() => setStatus(s)}
                disabled={saving}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Priority</span>
          <div className="status-selector">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                className={`chip ${issue.priority === p ? "chip-active" : ""}`}
                data-on={issue.priority === p}
                onClick={() => setPriority(p)}
                disabled={saving}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Assignee</span>
          <span>
            {issue.assignee_kind === "agent" ? (
              <span className="agent-badge">{issue.agent_name}</span>
            ) : (
              issue.assignee_user
            )}
            <span className="hint" style={{ marginLeft: 8 }}>({issue.assignee_kind})</span>
          </span>
        </div>

        {issue.assignee_kind === "agent" && (
          <div className="detail-row">
            <span className="detail-label">Cost cap</span>
            <span className="cap-cell">{formatCap(issue.cost_cap_cents)}</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Product</span>
          <span>
            {product ? (
              <Link href={`/products/${product.slug}`} className="product-link">
                {product.name}
              </Link>
            ) : (
              issue.product_id
            )}
          </span>
        </div>

        {issue.due_on && (
          <div className="detail-row">
            <span className="detail-label">Due</span>
            <span>{issue.due_on}</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Created</span>
          <span className="hint">{new Date(issue.created_at).toLocaleString()}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Updated</span>
          <span className="hint">{new Date(issue.updated_at).toLocaleString()}</span>
        </div>
      </div>

      {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}

      <h2 className="section-title">Notes</h2>
      <div className="comments-list">
        {comments.length === 0 && <p className="hint">No notes yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-meta">
              <span className="comment-author">{c.author}</span>
              <span className="comment-time">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <div className="comment-body">{c.body}</div>
          </div>
        ))}
      </div>
      <form
        className="comment-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newComment.trim()) return;
          const res = await fetch(`/api/issues/${id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: newComment }),
          });
          if (res.ok) {
            const data = await res.json();
            setComments((prev) => [...prev, data.comment]);
            setNewComment("");
          }
        }}
      >
        <input
          placeholder="Add a note..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          autoComplete="off"
        />
        <button className="go" type="submit" disabled={!newComment.trim()}>Add</button>
      </form>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/issues" className="chip">Back to issues</Link>
        <button className="chip" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={handleDelete} type="button">
          Delete
        </button>
      </div>
    </main>
  );
}
