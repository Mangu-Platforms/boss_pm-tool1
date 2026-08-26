"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCap } from "@/lib/money";
import { recordView } from "@/components/RecentlyViewed";
import type { Comment } from "@/lib/comments";
import type { IssueRelation } from "@/lib/relations";
import type { Subtask } from "@/lib/subtasks";
import type { TimeEntry } from "@/lib/timelog";
import type { Label } from "@/lib/labels";
import type { Issue, IssueLink, IssuePriority, Product } from "@/lib/types";

const STATUSES = ["backlog", "open", "doing", "done", "cancelled"] as const;
const PRIORITIES = ["critical", "high", "medium", "low"] as const;

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [links, setLinks] = useState<IssueLink[]>([]);
  const [relations, setRelations] = useState<IssueRelation[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [totalMins, setTotalMins] = useState(0);
  const [timeMinutes, setTimeMinutes] = useState("");
  const [timeNote, setTimeNote] = useState("");
  const [issueLabels, setIssueLabels] = useState<Label[]>([]);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [newRelationType, setNewRelationType] = useState<string>("relates-to");
  const [newRelationTarget, setNewRelationTarget] = useState("");
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingBody, setEditingBody] = useState(false);
  const [bodyDraft, setBodyDraft] = useState("");

  const load = useCallback(async () => {
    const [issueRes, productsRes, commentsRes, linksRes, relationsRes, subtasksRes, timeRes, labelsRes, allLabelsRes, issuesRes] = await Promise.all([
      fetch(`/api/issues/${id}`).then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch(`/api/issues/${id}/comments`).then((r) => r.json()),
      fetch(`/api/issues/${id}/links`).then((r) => r.json()),
      fetch(`/api/issues/${id}/relations`).then((r) => r.json()),
      fetch(`/api/issues/${id}/subtasks`).then((r) => r.json()),
      fetch(`/api/issues/${id}/time`).then((r) => r.json()),
      fetch(`/api/issues/${id}/labels`).then((r) => r.json()),
      fetch("/api/labels").then((r) => r.json()),
      fetch("/api/issues").then((r) => r.json()),
    ]);
    setIssue(issueRes.issue || null);
    setProducts(productsRes.products || []);
    setComments(commentsRes.comments || []);
    setLinks(linksRes.links || []);
    setRelations(relationsRes.relations || []);
    setSubtasks(subtasksRes.subtasks || []);
    setTimeEntries(timeRes.entries || []);
    setTotalMins(timeRes.total_minutes || 0);
    setIssueLabels(labelsRes.labels || []);
    setAllLabels(allLabelsRes.labels || []);
    setAllIssues(issuesRes.issues || []);
    if (issueRes.issue) recordView(issueRes.issue.id, issueRes.issue.title);
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
          <span className="detail-label">Labels</span>
          <div className="label-editor">
            <div className="label-tags">
              {issueLabels.map((lbl) => (
                <span key={lbl.id} className="label-tag" style={{ borderColor: lbl.color, color: lbl.color }}>
                  {lbl.name}
                  <button
                    className="label-remove"
                    type="button"
                    onClick={async () => {
                      const res = await fetch(`/api/issues/${id}/labels?label_id=${lbl.id}`, { method: "DELETE" });
                      if (res.ok) {
                        const data = await res.json();
                        setIssueLabels(data.labels);
                      }
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {allLabels.filter((l) => !issueLabels.find((il) => il.id === l.id)).length > 0 && (
              <select
                className="label-select"
                value=""
                onChange={async (e) => {
                  const labelId = e.target.value;
                  if (!labelId) return;
                  const res = await fetch(`/api/issues/${id}/labels`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ label_id: labelId }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setIssueLabels(data.labels);
                  }
                }}
              >
                <option value="">+ Add label</option>
                {allLabels.filter((l) => !issueLabels.find((il) => il.id === l.id)).map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            )}
          </div>
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

      <div className="relations-section">
        <h2 className="section-title">Relations</h2>
        {relations.length > 0 && (
          <div className="relations-list">
            {relations.map((rel) => {
              const otherId = rel.from_issue_id === id ? rel.to_issue_id : rel.from_issue_id;
              const otherIssue = allIssues.find((i) => i.id === otherId);
              const displayType = rel.from_issue_id === id ? rel.relation_type : (
                rel.relation_type === "blocks" ? "blocked-by" :
                rel.relation_type === "blocked-by" ? "blocks" :
                rel.relation_type
              );
              return (
                <div key={rel.id} className="relation-item">
                  <span className="relation-type">{displayType}</span>
                  <Link href={`/issues/${otherId}`} className="relation-title">
                    {otherIssue?.title || otherId}
                  </Link>
                  <button
                    className="relation-remove"
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/issues/${id}/relations?relation_id=${rel.id}`, { method: "DELETE" });
                      setRelations((prev) => prev.filter((r) => r.id !== rel.id));
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <form
          className="relation-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newRelationTarget) return;
            const res = await fetch(`/api/issues/${id}/relations`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ to_issue_id: newRelationTarget, relation_type: newRelationType }),
            });
            if (res.ok) {
              const data = await res.json();
              setRelations((prev) => [...prev, data.relation]);
              setNewRelationTarget("");
            }
          }}
        >
          <select value={newRelationType} onChange={(e) => setNewRelationType(e.target.value)}>
            <option value="relates-to">relates to</option>
            <option value="blocks">blocks</option>
            <option value="blocked-by">blocked by</option>
            <option value="duplicates">duplicates</option>
          </select>
          <select value={newRelationTarget} onChange={(e) => setNewRelationTarget(e.target.value)}>
            <option value="">Select issue…</option>
            {allIssues.filter((i) => i.id !== id).map((i) => (
              <option key={i.id} value={i.id}>{i.title}</option>
            ))}
          </select>
          <button className="go" type="submit" disabled={!newRelationTarget}>Link</button>
        </form>
      </div>

      <div className="subtasks-section">
        <h2 className="section-title">
          Sub-tasks
          {subtasks.length > 0 && (
            <span className="subtask-progress">
              {subtasks.filter((s) => s.done).length}/{subtasks.length}
            </span>
          )}
        </h2>
        {subtasks.length > 0 && (
          <div className="subtask-bar">
            <div
              className="subtask-bar-fill"
              style={{ width: `${(subtasks.filter((s) => s.done).length / subtasks.length) * 100}%` }}
            />
          </div>
        )}
        <div className="subtask-list">
          {subtasks.map((st) => (
            <div key={st.id} className={`subtask-item ${st.done ? "subtask-done" : ""}`}>
              <input
                type="checkbox"
                checked={st.done}
                onChange={async () => {
                  const res = await fetch(`/api/issues/${id}/subtasks?subtask_id=${st.id}`, { method: "PATCH" });
                  if (res.ok) {
                    const data = await res.json();
                    setSubtasks((prev) => prev.map((s) => s.id === st.id ? data.subtask : s));
                  }
                }}
              />
              <span className="subtask-title">{st.title}</span>
              <button
                className="relation-remove"
                type="button"
                onClick={async () => {
                  await fetch(`/api/issues/${id}/subtasks?subtask_id=${st.id}`, { method: "DELETE" });
                  setSubtasks((prev) => prev.filter((s) => s.id !== st.id));
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <form
          className="subtask-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newSubtask.trim()) return;
            const res = await fetch(`/api/issues/${id}/subtasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: newSubtask.trim() }),
            });
            if (res.ok) {
              const data = await res.json();
              setSubtasks((prev) => [...prev, data.subtask]);
              setNewSubtask("");
            }
          }}
        >
          <input
            placeholder="Add a sub-task..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            autoComplete="off"
          />
          <button className="go" type="submit" disabled={!newSubtask.trim()}>Add</button>
        </form>
      </div>

      <div className="time-section">
        <h2 className="section-title">
          Time logged
          {totalMins > 0 && <span className="time-total">{formatMinutes(totalMins)}</span>}
        </h2>
        {timeEntries.length > 0 && (
          <div className="time-list">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="time-entry">
                <span className="time-amount">{formatMinutes(entry.minutes)}</span>
                <span className="time-note">{entry.note || "—"}</span>
                <span className="hint">{new Date(entry.logged_at).toLocaleDateString()}</span>
                <button
                  className="relation-remove"
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/issues/${id}/time?entry_id=${entry.id}`, { method: "DELETE" });
                    setTimeEntries((prev) => prev.filter((e) => e.id !== entry.id));
                    setTotalMins((prev) => prev - entry.minutes);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <form
          className="time-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const mins = Number(timeMinutes);
            if (!mins || mins <= 0) return;
            const res = await fetch(`/api/issues/${id}/time`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ minutes: mins, note: timeNote }),
            });
            if (res.ok) {
              const data = await res.json();
              setTimeEntries((prev) => [data.entry, ...prev]);
              setTotalMins((prev) => prev + mins);
              setTimeMinutes("");
              setTimeNote("");
            }
          }}
        >
          <input
            type="number"
            placeholder="mins"
            className="time-minutes-input"
            value={timeMinutes}
            onChange={(e) => setTimeMinutes(e.target.value)}
            min="1"
          />
          <input
            placeholder="Note (optional)"
            value={timeNote}
            onChange={(e) => setTimeNote(e.target.value)}
            autoComplete="off"
          />
          <button className="go" type="submit" disabled={!timeMinutes || Number(timeMinutes) <= 0}>Log</button>
        </form>
      </div>

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
