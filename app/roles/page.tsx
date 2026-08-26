"use client";

import { useEffect, useState } from "react";

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.json())
      .then((d) => setRoles(d.roles || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim(), permissions: [] }),
    });
    setName("");
    setDescription("");
    const data = await fetch("/api/roles").then((r) => r.json());
    setRoles(data.roles || []);
  }

  async function handleDelete(id: string) {
    await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const data = await fetch("/api/roles").then((r) => r.json());
    setRoles(data.roles || []);
  }

  return (
    <main>
      <div className="kicker">Access Control</div>
      <h1>Roles</h1>
      <p className="lede">Define roles and permissions for team members.</p>

      <div className="role-list">
        {roles.map((r) => (
          <div key={r.id} className="role-card">
            <div className="role-header">
              <h3>{r.name}</h3>
              {r.is_system && <span className="priority mute">System</span>}
              {!r.is_system && <button className="btn-sm danger" onClick={() => handleDelete(r.id)}>Delete</button>}
            </div>
            <p className="hint">{r.description}</p>
            <div className="role-perms">
              {r.permissions.map((p) => <span key={p} className="role-perm">{p}</span>)}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Create Role</h2>
      <form className="role-form" onSubmit={handleCreate}>
        <input placeholder="Role name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="go" type="submit" disabled={!name.trim()}>Create</button>
      </form>
    </main>
  );
}
