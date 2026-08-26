"use client";

import { useEffect, useState } from "react";

type CustomField = {
  id: string;
  name: string;
  type: string;
  options?: string[];
  required: boolean;
};

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("text");
  const [newRequired, setNewRequired] = useState(false);
  const [newOptions, setNewOptions] = useState("");

  useEffect(() => {
    fetch("/api/custom-fields")
      .then((r) => r.json())
      .then((data) => setFields(data.fields || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const options = newType === "select" ? newOptions.split(",").map((o) => o.trim()).filter(Boolean) : undefined;
    await fetch("/api/custom-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), type: newType, required: newRequired, options }),
    });
    setNewName("");
    setNewOptions("");
    setNewRequired(false);
    const data = await fetch("/api/custom-fields").then((r) => r.json());
    setFields(data.fields || []);
  }

  async function handleDelete(id: string) {
    await fetch("/api/custom-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <main>
      <div className="kicker">Configuration</div>
      <h1>Custom Fields</h1>
      <p className="lede">Define custom metadata fields for issues and other entities.</p>

      <div className="cf-list">
        {fields.map((f) => (
          <div key={f.id} className="cf-card">
            <span className="cf-name">{f.name}</span>
            <span className="cf-type">{f.type}</span>
            {f.required && <span className="priority red">Required</span>}
            {f.options && f.options.length > 0 && (
              <span className="hint">Options: {f.options.join(", ")}</span>
            )}
            <button className="subtle-btn" onClick={() => handleDelete(f.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Custom Field</h2>
      <form className="cf-form" onSubmit={handleCreate}>
        <input placeholder="Field name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <select value={newType} onChange={(e) => setNewType(e.target.value)}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="select">Select</option>
          <option value="url">URL</option>
        </select>
        {newType === "select" && (
          <input placeholder="Options (comma-separated)" value={newOptions} onChange={(e) => setNewOptions(e.target.value)} />
        )}
        <label className="cf-required-label">
          <input type="checkbox" checked={newRequired} onChange={(e) => setNewRequired(e.target.checked)} />
          Required
        </label>
        <button className="go" type="submit" disabled={!newName.trim()}>Add Field</button>
      </form>
    </main>
  );
}
