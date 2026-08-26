export type Permission =
  | "issues:read" | "issues:write" | "issues:delete"
  | "products:read" | "products:write"
  | "milestones:read" | "milestones:write"
  | "sprints:read" | "sprints:write"
  | "team:read" | "team:write"
  | "settings:read" | "settings:write"
  | "admin";

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system: boolean;
  created_at: string;
};

let nextId = 5;
function genId() { return `role-${nextId++}`; }

const store: Role[] = [
  {
    id: "role-1", name: "Admin", description: "Full access to all features",
    permissions: ["admin"], is_system: true, created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-2", name: "Manager", description: "Manage issues, products, and team",
    permissions: ["issues:read", "issues:write", "products:read", "products:write", "milestones:read", "milestones:write", "sprints:read", "sprints:write", "team:read", "team:write"],
    is_system: true, created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-3", name: "Developer", description: "Work on issues and view products",
    permissions: ["issues:read", "issues:write", "products:read", "milestones:read", "sprints:read", "team:read"],
    is_system: true, created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-4", name: "Viewer", description: "Read-only access",
    permissions: ["issues:read", "products:read", "milestones:read", "sprints:read", "team:read"],
    is_system: true, created_at: "2025-01-01T00:00:00Z",
  },
];

export function listRoles(): Role[] { return [...store]; }

export function getRole(id: string): Role | null {
  return store.find((r) => r.id === id) || null;
}

export function createRole(name: string, description: string, permissions: Permission[]): Role {
  const role: Role = { id: genId(), name, description, permissions, is_system: false, created_at: new Date().toISOString() };
  store.push(role);
  return role;
}

export function updateRole(id: string, updates: Partial<Pick<Role, "name" | "description" | "permissions">>): Role | null {
  const role = store.find((r) => r.id === id);
  if (!role || role.is_system) return null;
  if (updates.name !== undefined) role.name = updates.name;
  if (updates.description !== undefined) role.description = updates.description;
  if (updates.permissions !== undefined) role.permissions = updates.permissions;
  return role;
}

export function deleteRole(id: string): boolean {
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  if (store[idx].is_system) return false;
  store.splice(idx, 1);
  return true;
}

export function hasPermission(roleId: string, permission: Permission): boolean {
  const role = store.find((r) => r.id === roleId);
  if (!role) return false;
  if (role.permissions.includes("admin")) return true;
  return role.permissions.includes(permission);
}
