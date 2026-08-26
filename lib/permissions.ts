export type Role = "admin" | "manager" | "member" | "viewer";

export type Permission = {
  action: string;
  description: string;
  roles: Role[];
};

export type UserRole = {
  user: string;
  role: Role;
  assigned_at: string;
};

const permissions: Permission[] = [
  { action: "project.create", description: "Create new projects", roles: ["admin", "manager"] },
  { action: "project.delete", description: "Delete projects", roles: ["admin"] },
  { action: "project.edit", description: "Edit project settings", roles: ["admin", "manager"] },
  { action: "issue.create", description: "Create issues", roles: ["admin", "manager", "member"] },
  { action: "issue.edit", description: "Edit issues", roles: ["admin", "manager", "member"] },
  { action: "issue.delete", description: "Delete issues", roles: ["admin", "manager"] },
  { action: "issue.assign", description: "Assign issues to members", roles: ["admin", "manager"] },
  { action: "sprint.manage", description: "Create and manage sprints", roles: ["admin", "manager"] },
  { action: "team.manage", description: "Manage team members", roles: ["admin"] },
  { action: "settings.edit", description: "Edit workspace settings", roles: ["admin"] },
  { action: "report.view", description: "View reports and analytics", roles: ["admin", "manager", "member", "viewer"] },
  { action: "comment.create", description: "Add comments", roles: ["admin", "manager", "member"] },
  { action: "risk.manage", description: "Manage risk register", roles: ["admin", "manager"] },
  { action: "decision.approve", description: "Accept or reject decisions", roles: ["admin", "manager"] },
];

const userRoles: UserRole[] = [
  { user: "Max", role: "admin", assigned_at: "2025-01-01T00:00:00.000Z" },
  { user: "Alice", role: "manager", assigned_at: "2025-01-01T00:00:00.000Z" },
  { user: "Bob", role: "member", assigned_at: "2025-01-01T00:00:00.000Z" },
  { user: "Charlie", role: "viewer", assigned_at: "2025-01-15T00:00:00.000Z" },
];

export function listPermissions(): Permission[] {
  return [...permissions];
}

export function listUserRoles(): UserRole[] {
  return [...userRoles];
}

export function getUserRole(user: string): UserRole | null {
  return userRoles.find((ur) => ur.user.toLowerCase() === user.toLowerCase()) || null;
}

export function setUserRole(user: string, role: Role): UserRole {
  const existing = userRoles.find((ur) => ur.user.toLowerCase() === user.toLowerCase());
  if (existing) {
    existing.role = role;
    existing.assigned_at = new Date().toISOString();
    return existing;
  }
  const ur: UserRole = { user, role, assigned_at: new Date().toISOString() };
  userRoles.push(ur);
  return ur;
}

export function removeUserRole(user: string): boolean {
  const idx = userRoles.findIndex((ur) => ur.user.toLowerCase() === user.toLowerCase());
  if (idx < 0) return false;
  userRoles.splice(idx, 1);
  return true;
}

export function hasPermission(user: string, action: string): boolean {
  const ur = getUserRole(user);
  if (!ur) return false;
  const perm = permissions.find((p) => p.action === action);
  if (!perm) return false;
  return perm.roles.includes(ur.role);
}

export function permissionsForRole(role: Role): Permission[] {
  return permissions.filter((p) => p.roles.includes(role));
}
