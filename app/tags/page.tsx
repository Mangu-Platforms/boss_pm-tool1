"use client";

import { useEffect, useState } from "react";

type Tag = {
  id: string;
  name: string;
  color: string;
  description: string;
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#8a8376");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => setTags(data.tags || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor, description: newDesc }),
    });
    if (res.ok) {
      const data = await res.json();
      setTags((prev) => [...prev, data.tag]);
      setNewName("");
      setNewDesc("");
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setTags((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <main>
      <div className="kicker">Organize</div>
      <h1>Tags</h1>
      <p className="lede">Create and manage tags to categorize issues.</p>

      <div className="tags-grid">
        {tags.map((tag) => (
          <div key={tag.id} className="tag-card">
            <div className="tag-header">
              <span className="tag-swatch" style={{ background: tag.color }} />
              <span className="tag-name">{tag.name}</span>
              <button className="chip chip-sm danger" onClick={() => handleDelete(tag.id)}>Remove</button>
            </div>
            {tag.description && <p className="tag-desc">{tag.description}</p>}
          </div>
        ))}
      </div>

      <h2 className="section-title">New tag</h2>
      <form className="tag-form" onSubmit={handleCreate}>
        <div className="tag-form-row">
          <input
            placeholder="Tag name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="tag-color-input"
          />
        </div>
        <input
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <button className="go" type="submit" disabled={!newName.trim()}>Create tag</button>
      </form>
    </main>
  );
}
