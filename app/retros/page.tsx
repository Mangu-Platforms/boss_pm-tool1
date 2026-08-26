"use client";

import { useEffect, useState } from "react";

type RetroItem = {
  id: string;
  type: "went_well" | "to_improve" | "action_item";
  text: string;
  votes: number;
  author: string;
  resolved: boolean;
};

type Retrospective = {
  id: string;
  title: string;
  sprint_id: string | null;
  items: RetroItem[];
  status: "open" | "in_progress" | "completed";
  created_at: string;
};

export default function RetrosPage() {
  const [retros, setRetros] = useState<Retrospective[]>([]);
  const [selected, setSelected] = useState<Retrospective | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [newItemType, setNewItemType] = useState<RetroItem["type"]>("went_well");

  useEffect(() => {
    fetch("/api/retros")
      .then((r) => r.json())
      .then((data) => setRetros(data.retros || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch("/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    if (res.ok) {
      setNewTitle("");
      const data = await fetch("/api/retros").then((r) => r.json());
      setRetros(data.retros || []);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !newItemText.trim()) return;
    const res = await fetch("/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_item", retro_id: selected.id, type: newItemType, text: newItemText }),
    });
    if (res.ok) {
      setNewItemText("");
      const data = await fetch(`/api/retros?id=${selected.id}`).then((r) => r.json());
      setSelected(data.retro);
      const listData = await fetch("/api/retros").then((r) => r.json());
      setRetros(listData.retros || []);
    }
  }

  async function handleVote(itemId: string) {
    if (!selected) return;
    await fetch("/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vote", retro_id: selected.id, item_id: itemId }),
    });
    const data = await fetch(`/api/retros?id=${selected.id}`).then((r) => r.json());
    setSelected(data.retro);
  }

  async function handleResolve(itemId: string) {
    if (!selected) return;
    await fetch("/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", retro_id: selected.id, item_id: itemId }),
    });
    const data = await fetch(`/api/retros?id=${selected.id}`).then((r) => r.json());
    setSelected(data.retro);
  }

  const typeLabels: Record<RetroItem["type"], string> = {
    went_well: "Went Well",
    to_improve: "To Improve",
    action_item: "Action Item",
  };

  const typeColors: Record<RetroItem["type"], string> = {
    went_well: "green",
    to_improve: "orange",
    action_item: "blue",
  };

  return (
    <main>
      <div className="kicker">Continuous Improvement</div>
      <h1>Retrospectives</h1>
      <p className="lede">Reflect on sprints and identify what went well, what to improve, and actions to take.</p>

      <div className="retro-grid">
        <div className="retro-list-panel">
          <h2 className="section-title">All Retros</h2>
          {retros.map((retro) => (
            <button
              key={retro.id}
              className={`retro-card ${selected?.id === retro.id ? "retro-card-active" : ""}`}
              onClick={() => setSelected(retro)}
            >
              <span className="retro-card-title">{retro.title}</span>
              <span className={`retro-status retro-status-${retro.status}`}>{retro.status.replace("_", " ")}</span>
              <span className="hint">{retro.items.length} items</span>
            </button>
          ))}

          <form className="retro-create-form" onSubmit={handleCreate}>
            <input placeholder="New retro title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            <button className="go" type="submit" disabled={!newTitle.trim()}>Create</button>
          </form>
        </div>

        <div className="retro-detail-panel">
          {selected ? (
            <>
              <h2>{selected.title}</h2>
              <div className="retro-columns">
                {(["went_well", "to_improve", "action_item"] as const).map((type) => (
                  <div key={type} className={`retro-column retro-column-${type}`}>
                    <h3 className="retro-column-header">{typeLabels[type]}</h3>
                    {selected.items
                      .filter((item) => item.type === type)
                      .sort((a, b) => b.votes - a.votes)
                      .map((item) => (
                        <div key={item.id} className={`retro-item ${item.resolved ? "retro-item-resolved" : ""}`}>
                          <p className="retro-item-text">{item.text}</p>
                          <div className="retro-item-meta">
                            <button className="retro-vote-btn" onClick={() => handleVote(item.id)}>
                              +{item.votes}
                            </button>
                            <span className="hint">{item.author}</span>
                            {!item.resolved && item.type === "action_item" && (
                              <button className="retro-resolve-btn" onClick={() => handleResolve(item.id)}>
                                Resolve
                              </button>
                            )}
                            {item.resolved && <span className={`priority ${typeColors[type]}`}>Done</span>}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              <form className="retro-add-item-form" onSubmit={handleAddItem}>
                <select value={newItemType} onChange={(e) => setNewItemType(e.target.value as RetroItem["type"])}>
                  <option value="went_well">Went Well</option>
                  <option value="to_improve">To Improve</option>
                  <option value="action_item">Action Item</option>
                </select>
                <input placeholder="Add item..." value={newItemText} onChange={(e) => setNewItemText(e.target.value)} required />
                <button className="go" type="submit" disabled={!newItemText.trim()}>Add</button>
              </form>
            </>
          ) : (
            <p className="hint">Select a retrospective to view details.</p>
          )}
        </div>
      </div>
    </main>
  );
}
