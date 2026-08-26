"use client";

import { useEffect, useState } from "react";

type Permission = {
  action: string;
  description: string;
  roles: string[];
};

type UserRole = {
  user: string;
  role: string;
  assigned_at: string;
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newUser, setNewUser] = useState("");
  const [newRole, setNewRole] = useState("member");

  useEffect(() => {
    fetch("/api/permissions")
      .then((r) => r.json())
      .then((data) => {
        setPermissions(data.permissions || []);
        setUserRoles(data.user_roles || []);
      });
  }, []);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser.trim()) return;
    await fetch("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: newUser.trim(), role: newRole }),
    });
    setNewUser("");
    const data = await fetch("/api/permissions").then((r) => r.json());
    setUserRoles(data.user_roles || []);
  }

  async function handleRoleChange(user: string, role: string) {
    await fetch("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, role }),
    });
    setUserRoles((prev) => prev.map((ur) => (ur.user === user ? { ...ur, role } : ur)));
  }

  const roleColors: Record<string, string> = { admin: "red", manager: "gold", member: "green", viewer: "mute" };

  return (
    <main>
      <div className="kicker">Administration</div>
      <h1>Permissions & Roles</h1>
      <p className="lede">Manage team roles and access control for workspace features.</p>

      <h2 className="section-title">Team Roles</h2>
      <div className="perm-roles-list">
        {userRoles.map((ur) => (
          <div key={ur.user} className="perm-role-card">
            <span className="perm-user">{ur.user}</span>
            <select
              value={ur.role}
              onChange={(e) => handleRoleChange(ur.user, e.target.value)}
              className="goal-status-select"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <span className={`priority ${roleColors[ur.role] || ""}`}>{ur.role}</span>
          </div>
        ))}
      </div>

      <form className="perm-form" onSubmit={handleAssign}>
        <input placeholder="Username" value={newUser} onChange={(e) => setNewUser(e.target.value)} required />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
        <button className="go" type="submit" disabled={!newUser.trim()}>Assign</button>
      </form>

      <h2 className="section-title">Permission Matrix</h2>
      <table className="perm-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Description</th>
            <th>Admin</th>
            <th>Manager</th>
            <th>Member</th>
            <th>Viewer</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((p) => (
            <tr key={p.action}>
              <td className="mono">{p.action}</td>
              <td className="hint">{p.description}</td>
              {(["admin", "manager", "member", "viewer"] as const).map((role) => (
                <td key={role} className="perm-check">{p.roles.includes(role) ? "Yes" : ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
