"use client";

import { useEffect, useState } from "react";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  capacity_hours: number;
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("member");

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => setMembers(data.members || []));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), role: newRole }),
    });
    if (res.ok) {
      setNewName("");
      setNewEmail("");
      setNewRole("member");
      const data = await fetch("/api/team").then((r) => r.json());
      setMembers(data.members || []);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this team member?")) return;
    const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" });
    if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <main>
      <div className="kicker">People</div>
      <h1>Team</h1>
      <p className="lede">Manage team members, roles, and capacity.</p>

      <div className="team-grid">
        {members.map((m) => (
          <div key={m.id} className="team-card">
            <div className="team-avatar">{m.name.charAt(0).toUpperCase()}</div>
            <div className="team-info">
              <span className="team-name">{m.name}</span>
              <span className="team-email">{m.email}</span>
            </div>
            <div className="team-meta">
              <span className={`status ${m.role}`}>{m.role}</span>
              <span className="hint">{m.capacity_hours}h/wk</span>
            </div>
            <button className="relation-remove" type="button" onClick={() => handleRemove(m.id)}>×</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add member</h2>
      <form className="milestone-form" onSubmit={handleAdd}>
        <input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <input placeholder="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
        <button className="go" type="submit" disabled={!newName.trim() || !newEmail.trim()}>Add</button>
      </form>
    </main>
  );
}
