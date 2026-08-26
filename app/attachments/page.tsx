"use client";

import { useEffect, useState } from "react";

type Attachment = {
  id: string;
  issue_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  url: string;
  uploaded_by: string;
  created_at: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [issueId, setIssueId] = useState("");
  const [filename, setFilename] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    fetch("/api/attachments")
      .then((r) => r.json())
      .then((data) => setAttachments(data.attachments || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!issueId.trim() || !filename.trim() || !url.trim()) return;
    await fetch("/api/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_id: issueId.trim(), filename: filename.trim(), url: url.trim() }),
    });
    setIssueId("");
    setFilename("");
    setUrl("");
    const data = await fetch("/api/attachments").then((r) => r.json());
    setAttachments(data.attachments || []);
  }

  async function handleDelete(id: string) {
    await fetch("/api/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <main>
      <div className="kicker">Collaboration</div>
      <h1>Attachments</h1>
      <p className="lede">Files attached to issues.</p>

      <div className="att-list">
        {attachments.length === 0 && <p className="hint">No attachments yet.</p>}
        {attachments.map((att) => (
          <div key={att.id} className="att-card">
            <div className="att-icon">
              {att.content_type.startsWith("image/") ? "\u{1F5BC}" : "\u{1F4CE}"}
            </div>
            <div className="att-info">
              <span className="att-filename">{att.filename}</span>
              <span className="hint">{att.issue_id} - {formatSize(att.size_bytes)} - {att.uploaded_by}</span>
            </div>
            <button className="subtle-btn" onClick={() => handleDelete(att.id)}>Remove</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Attachment</h2>
      <form className="att-form" onSubmit={handleCreate}>
        <input placeholder="Issue ID" value={issueId} onChange={(e) => setIssueId(e.target.value)} required />
        <input placeholder="Filename" value={filename} onChange={(e) => setFilename(e.target.value)} required />
        <input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <button className="go" type="submit" disabled={!issueId.trim() || !filename.trim() || !url.trim()}>Add</button>
      </form>
    </main>
  );
}
