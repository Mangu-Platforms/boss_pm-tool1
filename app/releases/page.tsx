"use client";

import { useEffect, useState } from "react";
import { Markdown } from "@/components/Markdown";

type Release = {
  id: string;
  version: string;
  title: string;
  notes: string;
  issue_ids: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
};

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [newVersion, setNewVersion] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    fetch("/api/releases")
      .then((r) => r.json())
      .then((data) => setReleases(data.releases || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newVersion.trim() || !newTitle.trim()) return;
    const res = await fetch("/api/releases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: newVersion.trim(), title: newTitle.trim(), notes: newNotes }),
    });
    if (res.ok) {
      setNewVersion("");
      setNewTitle("");
      setNewNotes("");
      const data = await fetch("/api/releases").then((r) => r.json());
      setReleases(data.releases || []);
    }
  }

  async function handlePublish(id: string) {
    await fetch("/api/releases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", id }),
    });
    setReleases((prev) => prev.map((r) =>
      r.id === id ? { ...r, published: true, published_at: new Date().toISOString() } : r
    ));
  }

  return (
    <main>
      <div className="kicker">Ship</div>
      <h1>Releases</h1>
      <p className="lede">Track versions, write release notes, and publish changelogs.</p>

      <div className="release-list">
        {releases.map((rel) => (
          <div key={rel.id} className={`release-card ${rel.published ? "release-published" : ""}`}>
            <div className="release-header">
              <span className="release-version">{rel.version}</span>
              <h3 className="release-title">{rel.title}</h3>
              {rel.published ? (
                <span className="status active">published</span>
              ) : (
                <span className="status planning">draft</span>
              )}
            </div>
            {rel.notes && <Markdown text={rel.notes} />}
            <div className="release-meta">
              {rel.published_at && <span className="hint">Published {new Date(rel.published_at).toLocaleDateString()}</span>}
              <span className="hint">{rel.issue_ids.length} issues</span>
            </div>
            {!rel.published && (
              <button className="chip chip-sm go" onClick={() => handlePublish(rel.id)} style={{ marginTop: 8 }}>
                Publish
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="section-title">New release</h2>
      <form className="release-form" onSubmit={handleCreate}>
        <input placeholder="Version (e.g. 1.2.0)" value={newVersion} onChange={(e) => setNewVersion(e.target.value)} required />
        <input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Release notes (markdown)" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={4} />
        <button className="go" type="submit" disabled={!newVersion.trim() || !newTitle.trim()}>Create release</button>
      </form>
    </main>
  );
}
