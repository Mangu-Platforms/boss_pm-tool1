"use client";

import { useEffect, useState } from "react";

type WikiPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  parent_id: string | null;
  author: string;
  updated_at: string;
};

export default function WikiPageView() {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [selected, setSelected] = useState<WikiPage | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch("/api/wiki")
      .then((r) => r.json())
      .then((data) => setPages(data.pages || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await fetch("/api/wiki", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), content: newContent }),
    });
    setNewTitle("");
    setNewContent("");
    const data = await fetch("/api/wiki").then((r) => r.json());
    setPages(data.pages || []);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) {
      const data = await fetch("/api/wiki").then((r) => r.json());
      setPages(data.pages || []);
      return;
    }
    const data = await fetch(`/api/wiki?search=${encodeURIComponent(search)}`).then((r) => r.json());
    setPages(data.pages || []);
  }

  async function handleSaveEdit() {
    if (!selected) return;
    await fetch("/api/wiki", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: selected.id, content: editContent }),
    });
    setEditing(false);
    const data = await fetch(`/api/wiki?id=${selected.id}`).then((r) => r.json());
    setSelected(data.page);
  }

  function selectPage(page: WikiPage) {
    setSelected(page);
    setEditing(false);
    setEditContent(page.content);
  }

  return (
    <main>
      <div className="kicker">Knowledge Base</div>
      <h1>Wiki</h1>
      <p className="lede">Team knowledge base for documentation, guides, and shared reference.</p>

      <div className="wiki-grid">
        <div className="wiki-sidebar">
          <form className="wiki-search" onSubmit={handleSearch}>
            <input placeholder="Search wiki..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          {pages.map((p) => (
            <button
              key={p.id}
              className={`wiki-nav-item ${selected?.id === p.id ? "wiki-nav-active" : ""}`}
              onClick={() => selectPage(p)}
            >
              {p.parent_id && <span className="wiki-indent" />}
              {p.title}
            </button>
          ))}
        </div>

        <div className="wiki-content">
          {selected ? (
            <>
              <div className="wiki-content-header">
                <h2>{selected.title}</h2>
                <div className="wiki-content-meta">
                  <span className="hint">By {selected.author}</span>
                  <span className="hint">Updated {new Date(selected.updated_at).toLocaleDateString()}</span>
                  <button className="subtle-btn" onClick={() => { setEditing(!editing); setEditContent(selected.content); }}>
                    {editing ? "Cancel" : "Edit"}
                  </button>
                </div>
              </div>
              {editing ? (
                <div className="wiki-editor">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={12} />
                  <button className="go" onClick={handleSaveEdit}>Save</button>
                </div>
              ) : (
                <div className="wiki-body">
                  {selected.content.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) return <h3 key={i}>{line.slice(3)}</h3>;
                    if (line.startsWith("- ")) return <p key={i} className="wiki-list-item">{line.slice(2)}</p>;
                    if (line.match(/^\d+\.\s/)) return <p key={i} className="wiki-list-item">{line}</p>;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              )}
            </>
          ) : (
            <p className="hint">Select a page from the sidebar to read it.</p>
          )}
        </div>
      </div>

      <h2 className="section-title">Create Page</h2>
      <form className="wiki-create-form" onSubmit={handleCreate}>
        <input placeholder="Page title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Content (markdown-ish)" value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} />
        <button className="go" type="submit" disabled={!newTitle.trim()}>Create Page</button>
      </form>
    </main>
  );
}
