"use client";

import { useEffect, useState } from "react";

type Label = {
  id: string;
  name: string;
  color: string;
};

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#8a8376");

  useEffect(() => {
    fetch("/api/labels")
      .then((r) => r.json())
      .then((data) => setLabels(data.labels || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    });
    setNewName("");
    setNewColor("#8a8376");
    const data = await fetch("/api/labels").then((r) => r.json());
    setLabels(data.labels || []);
  }

  async function handleDelete(id: string) {
    await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setLabels((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <main>
      <div className="kicker">Configuration</div>
      <h1>Labels</h1>
      <p className="lede">Manage labels for categorizing issues.</p>

      <div className="label-list">
        {labels.map((label) => (
          <div key={label.id} className="label-card">
            <span className="label-swatch" style={{ background: label.color }} />
            <span className="label-name">{label.name}</span>
            <span className="label-color mono hint">{label.color}</span>
            <button className="subtle-btn" onClick={() => handleDelete(label.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Label</h2>
      <form className="label-form" onSubmit={handleCreate}>
        <input placeholder="Label name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
        <button className="go" type="submit" disabled={!newName.trim()}>Add</button>
      </form>
    </main>
  );
}
