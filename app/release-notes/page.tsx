"use client";

import { useEffect, useState } from "react";

type ReleaseNote = {
  id: string;
  version: string;
  title: string;
  body: string;
  category: string;
  published: boolean;
};

const categoryColors: Record<string, string> = {
  feature: "green",
  bugfix: "red",
  improvement: "gold",
  breaking: "danger",
};

export default function ReleaseNotesPage() {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("feature");

  useEffect(() => {
    fetch("/api/release-notes")
      .then((r) => r.json())
      .then((d) => setNotes(d.release_notes || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!version.trim() || !title.trim()) return;
    await fetch("/api/release-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: version.trim(), title: title.trim(), body: body.trim(), category }),
    });
    setVersion("");
    setTitle("");
    setBody("");
    const data = await fetch("/api/release-notes").then((r) => r.json());
    setNotes(data.release_notes || []);
  }

  async function handlePublish(id: string) {
    await fetch("/api/release-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", id }),
    });
    const data = await fetch("/api/release-notes").then((r) => r.json());
    setNotes(data.release_notes || []);
  }

  return (
    <main>
      <div className="kicker">Documentation</div>
      <h1>Release Notes</h1>
      <p className="lede">Document changes for each release version.</p>

      <div className="rn-list">
        {notes.map((n) => (
          <div key={n.id} className={`rn-card ${n.published ? "" : "rn-draft"}`}>
            <div className="rn-header">
              <span className="rn-version">{n.version}</span>
              <h3>{n.title}</h3>
              <span className={`priority ${categoryColors[n.category] || "mute"}`}>{n.category}</span>
            </div>
            <p className="rn-body">{n.body}</p>
            <div className="rn-footer">
              {n.published ? <span className="priority green">Published</span> : (
                <button className="btn-sm" onClick={() => handlePublish(n.id)}>Publish</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Release Note</h2>
      <form className="rn-form" onSubmit={handleCreate}>
        <input placeholder="Version (e.g. 1.2.0)" value={version} onChange={(e) => setVersion(e.target.value)} required />
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="feature">Feature</option>
          <option value="bugfix">Bug Fix</option>
          <option value="improvement">Improvement</option>
          <option value="breaking">Breaking</option>
        </select>
        <textarea placeholder="Description" value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
        <button className="go" type="submit" disabled={!version.trim() || !title.trim()}>Add</button>
      </form>
    </main>
  );
}
