"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCap } from "@/lib/money";
import type { Comment } from "@/lib/comments";
import type { Issue, IssueLink, IssuePriority, Product } from "@/lib/types";

const STATUSES = ["backlog", "open", "doing", "done", "cancelled"] as const;
const PRIORITIES = ["critical", "high", "medium", "low"] as const;

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [links, setLinks] = useState<IssueLink[]>([]);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingBody, setEditingBody] = useState(false);
  const [bodyDraft, setBodyDraft] = useState("");

  const load = useCallback(async () => {
    const [issueRes, productsRes, commentsRes, linksRes] = await Promise.all([
      fetch(`/api/issues/${id}`).then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch(`/api/issues/${id}/comments`).then((r) => r.json()),
      fetch(`/api/issues/${id}/links`).then((r) => r.json()),
    ]);
    setIssue(issueRes.issue || null);
    setProducts(productsRes.products || []);
    setComments(commentsRes.comments || []);
    setLinks(linksRes.links || []);
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

  async function saveTitle() {
    if (!titleDraft.trim() || titleDraft.trim() === issue?.title) {
      setEditingTitle(false);
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleDraft.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setIssue(data.issue);
    }
    setSaving(false);
    setEditingTitle(false);
  }

  async function saveBody() {
    if (bodyDraft === issue?.body) {
      setEditingBody(false);
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: bodyDraft }),
    });
    if (res.ok) {
      const data = await res.json();
      setIssue(data.issue);
    }
    setSaving(false);
    setEditingBody(false);
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
      {editingTitle ? (
        <div className="inline-edit">
          <input
            className="inline-edit-input inline-edit-title"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") setEditingTitle(false);
            }}
            onBlur={saveTitle}
            autoFocus
          />
        </div>
      ) : (
        <h1
          className="editable-title"
          onClick={() => { setTitleDraft(issue.title); setEditingTitle(true); }}
        >
          {issue.title}
        </h1>
      )}

      {editingBody ? (
        <div className="inline-edit">
          <textarea
            className="inline-edit-input inline-edit-body"
            value={bodyDraft}
            onChange={(e) => setBodyDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditingBody(false);
              if (e.key === "Enter" && e.metaKey) saveBody();
            }}
            onBlur={saveBody}
            rows={3}
            autoFocus
          />
          <span className="hint">Cmd+Enter to save, Esc to cancel</span>
        </div>
      ) : (
        <p
          className="lede editable-body"
          onClick={() => { setBodyDraft(issue.body); setEditingBody(true); }}
        >
          {issue.body || <span className="hint">Click to add description…</span>}
        </p>
      )}

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
          <div className="assignee-editor">
            <div className="status-selector">
              <button
                className="chip"
                data-on={issue.assignee_kind === "user"}
                onClick={async () => {
                  if (issue.assignee_kind === "user") return;
                  setSaving(true);
                  const res = await fetch(`/api/issues/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ assignee_kind: "user", assignee_user: "operator" }),
                  });
                  if (res.ok) setIssue((await res.json()).issue);
                  setSaving(false);
                }}
                disabled={saving}
                type="button"
              >
                user
              </button>
              <button
                className="chip"
                data-on={issue.assignee_kind === "agent"}
                onClick={async () => {
                  if (issue.assignee_kind === "agent") return;
                  setSaving(true);
                  const res = await fetch(`/api/issues/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ assignee_kind: "agent", agent_name: "alice", cost_cap_cents: 400 }),
                  });
                  if (res.ok) setIssue((await res.json()).issue);
                  setSaving(false);
                }}
                disabled={saving}
                type="button"
              >
                agent
              </button>
            </div>
            {issue.assignee_kind === "agent" ? (
              <span className="assignee-detail">
                <span className="agent-badge">{issue.agent_name}</span>
                <span className="cap-cell">{formatCap(issue.cost_cap_cents)}</span>
              </span>
            ) : (
              <span className="assignee-detail">{issue.assignee_user}</span>
            )}
          </div>
        </div>

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

        <div className="detail-row">
          <span className="detail-label">Due</span>
          <span className="due-date-cell">
            <input
              type="date"
              className="date-input"
              value={issue.due_on || ""}
              onChange={async (e) => {
                const val = e.target.value || null;
                setSaving(true);
                const res = await fetch(`/api/issues/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ due_on: val }),
                });
                if (res.ok) {
                  const data = await res.json();
                  setIssue(data.issue);
                }
                setSaving(false);
              }}
            />
            {issue.due_on && (
              <button
                className="chip chip-sm"
                type="button"
                onClick={async () => {
                  setSaving(true);
                  const res = await fetch(`/api/issues/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ due_on: null }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setIssue(data.issue);
                  }
                  setSaving(false);
                }}
              >
                clear
              </button>
            )}
          </span>
        </div>

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

      {links.length > 0 && (
        <>
          <h2 className="section-title">GitHub Links</h2>
          <div className="gh-links">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.github_html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-link-item"
              >
                <span className={`gh-state gh-state-${link.github_state}`}>{link.github_state}</span>
                <span className="gh-link-title">{link.github_title}</span>
                <span className="gh-link-repo">{link.github_owner}/{link.github_repo}#{link.github_issue_number}</span>
              </a>
            ))}
          </div>
        </>
      )}

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
