"use client";

import { useEffect, useState } from "react";

type Bookmark = {
  id: string;
  user: string;
  entity_type: string;
  entity_id: string;
  label: string;
  created_at: string;
};

const typeIcons: Record<string, string> = {
  issue: "Issue",
  product: "Product",
  wiki: "Wiki",
  risk: "Risk",
  goal: "Goal",
  epic: "Epic",
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((data) => setBookmarks(data.bookmarks || []));
  }, []);

  async function handleRemove(id: string) {
    await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <main>
      <div className="kicker">Personal</div>
      <h1>Bookmarks</h1>
      <p className="lede">Your saved items for quick access.</p>

      <div className="bookmark-list">
        {bookmarks.length === 0 && <p className="hint">No bookmarks yet. Bookmark items from other pages to see them here.</p>}
        {bookmarks.map((bm) => (
          <div key={bm.id} className="bookmark-card">
            <span className="bookmark-type">{typeIcons[bm.entity_type] || bm.entity_type}</span>
            <span className="bookmark-label">{bm.label}</span>
            <span className="hint">{bm.user}</span>
            <span className="hint">{new Date(bm.created_at).toLocaleDateString()}</span>
            <button className="subtle-btn" onClick={() => handleRemove(bm.id)}>Remove</button>
          </div>
        ))}
      </div>
    </main>
  );
}
