"use client";

import { useEffect, useState } from "react";
import { Markdown } from "@/components/Markdown";

type ChangelogEntry = {
  id: string;
  version: string;
  title: string;
  body: string;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [newVersion, setNewVersion] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("feature");

  useEffect(() => {
    fetch("/api/changelog")
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newVersion.trim() || !newTitle.trim()) return;
    const res = await fetch("/api/changelog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: newVersion.trim(), title: newTitle.trim(), body: newBody, category: newCategory }),
    });
    if (res.ok) {
      setNewVersion("");
      setNewTitle("");
      setNewBody("");
      const data = await fetch("/api/changelog").then((r) => r.json());
      setEntries(data.entries || []);
    }
  }

  async function handlePublish(id: string) {
    await fetch("/api/changelog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", id }),
    });
    setEntries((prev) => prev.map((e) =>
      e.id === id ? { ...e, published: true, published_at: new Date().toISOString() } : e
    ));
  }

  const categoryColors: Record<string, string> = {
    feature: "engine", fix: "danger", improvement: "lab", breaking: "danger", other: "mute",
  };

  return (
    <main>
      <div className="kicker">History</div>
      <h1>Changelog</h1>
      <p className="lede">Track what changed across versions.</p>

      <div className="changelog-list">
        {entries.map((entry) => (
          <div key={entry.id} className={`changelog-entry ${!entry.published ? "changelog-draft" : ""}`}>
            <div className="changelog-header">
              <span className="release-version">{entry.version}</span>
              <h3 className="changelog-title">{entry.title}</h3>
              <span className={`chip chip-sm`} style={{ color: `var(--${categoryColors[entry.category] || "mute"})` }}>
                {entry.category}
              </span>
              {!entry.published && <span className="status planning">draft</span>}
            </div>
            {entry.body && <Markdown text={entry.body} />}
            <div className="changelog-meta">
              {entry.published_at && <span className="hint">Published {new Date(entry.published_at).toLocaleDateString()}</span>}
              {!entry.published && (
                <button className="chip chip-sm go" onClick={() => handlePublish(entry.id)}>Publish</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">New entry</h2>
      <form className="changelog-form" onSubmit={handleCreate}>
        <div className="changelog-form-row">
          <input placeholder="Version" value={newVersion} onChange={(e) => setNewVersion(e.target.value)} required />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            <option value="feature">Feature</option>
            <option value="fix">Fix</option>
            <option value="improvement">Improvement</option>
            <option value="breaking">Breaking</option>
            <option value="other">Other</option>
          </select>
        </div>
        <input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Body (markdown)" value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={5} />
        <button className="go" type="submit" disabled={!newVersion.trim() || !newTitle.trim()}>Create entry</button>
      </form>
    </main>
  );
}
