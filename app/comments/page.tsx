"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: string;
  issue_id: string;
  author: string;
  body: string;
  created_at: string;
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [issueId, setIssueId] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [filterIssue, setFilterIssue] = useState("");

  useEffect(() => {
    loadComments();
  }, []);

  function loadComments() {
    const params = filterIssue ? `?issue_id=${filterIssue}` : "";
    fetch(`/api/comments${params}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!issueId.trim() || !body.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_id: issueId.trim(), body: body.trim(), author: author.trim() || "operator" }),
    });
    setBody("");
    loadComments();
  }

  async function handleDelete(id: string) {
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <main>
      <div className="kicker">Collaboration</div>
      <h1>Comments</h1>
      <p className="lede">Discussion threads on issues.</p>

      <div className="cmt-filters">
        <input
          className="cmt-filter-input"
          placeholder="Filter by issue ID..."
          value={filterIssue}
          onChange={(e) => setFilterIssue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadComments()}
        />
        <button className="subtle-btn" onClick={loadComments}>Filter</button>
      </div>

      <div className="cmt-list">
        {comments.length === 0 && <p className="hint">No comments yet.</p>}
        {comments.map((cmt) => (
          <div key={cmt.id} className="cmt-card">
            <div className="cmt-header">
              <span className="cmt-author">{cmt.author}</span>
              <span className="mono hint">{cmt.issue_id}</span>
              <span className="hint">{new Date(cmt.created_at).toLocaleString()}</span>
            </div>
            <p className="cmt-body">{cmt.body}</p>
            <button className="subtle-btn" onClick={() => handleDelete(cmt.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Comment</h2>
      <form className="cmt-form" onSubmit={handleCreate}>
        <input placeholder="Issue ID" value={issueId} onChange={(e) => setIssueId(e.target.value)} required />
        <input placeholder="Author (optional)" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <textarea placeholder="Comment..." value={body} onChange={(e) => setBody(e.target.value)} rows={3} required />
        <button className="go" type="submit" disabled={!issueId.trim() || !body.trim()}>Post</button>
      </form>
    </main>
  );
}
