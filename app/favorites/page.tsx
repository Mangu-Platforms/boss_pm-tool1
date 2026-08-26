"use client";

import { useEffect, useState } from "react";

type Favorite = {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  item_title: string;
  created_at: string;
};

const typeIcons: Record<string, string> = {
  issue: "B",
  product: "P",
  milestone: "M",
  sprint: "S",
  view: "V",
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [itemType, setItemType] = useState("issue");
  const [itemId, setItemId] = useState("");
  const [itemTitle, setItemTitle] = useState("");

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFavorites(d.favorites || []));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!itemId.trim() || !itemTitle.trim()) return;
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_type: itemType, item_id: itemId.trim(), item_title: itemTitle.trim() }),
    });
    setItemId("");
    setItemTitle("");
    const data = await fetch("/api/favorites").then((r) => r.json());
    setFavorites(data.favorites || []);
  }

  async function handleRemove(itemId: string) {
    await fetch(`/api/favorites?item_id=${encodeURIComponent(itemId)}`, { method: "DELETE" });
    const data = await fetch("/api/favorites").then((r) => r.json());
    setFavorites(data.favorites || []);
  }

  return (
    <main>
      <div className="kicker">Quick Access</div>
      <h1>Favorites</h1>
      <p className="lede">Your starred items for quick access.</p>

      <div className="fav-list">
        {favorites.length === 0 && <p className="hint">No favorites yet.</p>}
        {favorites.map((f) => (
          <div key={f.id} className="fav-card">
            <span className="fav-icon">{typeIcons[f.item_type] || "?"}</span>
            <div className="fav-info">
              <span className="fav-title">{f.item_title}</span>
              <span className="hint">{f.item_type} &middot; {f.item_id}</span>
            </div>
            <button className="btn-sm danger" onClick={() => handleRemove(f.item_id)}>Remove</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Favorite</h2>
      <form className="fav-form" onSubmit={handleAdd}>
        <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
          <option value="issue">Issue</option>
          <option value="product">Product</option>
          <option value="milestone">Milestone</option>
          <option value="sprint">Sprint</option>
          <option value="view">View</option>
        </select>
        <input placeholder="Item ID" value={itemId} onChange={(e) => setItemId(e.target.value)} required />
        <input placeholder="Item Title" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} required />
        <button className="go" type="submit" disabled={!itemId.trim() || !itemTitle.trim()}>Star</button>
      </form>
    </main>
  );
}
