export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatar_url: string | null;
  capacity_hours: number;
  created_at: string;
};

const store: TeamMember[] = [
  {
    id: "user-max",
    name: "Max",
    email: "max@mangu-publishers.com",
    role: "admin",
    avatar_url: null,
    capacity_hours: 40,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "user-alice",
    name: "Alice",
    email: "alice@mangu-publishers.com",
    role: "member",
    avatar_url: null,
    capacity_hours: 40,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "user-bob",
    name: "Bob",
    email: "bob@mangu-publishers.com",
    role: "member",
    avatar_url: null,
    capacity_hours: 32,
    created_at: "2025-02-01T00:00:00Z",
  },
];

export function listTeamMembers(): TeamMember[] {
  return [...store].sort((a, b) => a.name.localeCompare(b.name));
}

export function getTeamMember(id: string): TeamMember | null {
  return store.find((m) => m.id === id) || null;
}

export function createTeamMember(name: string, email: string, role: TeamMember["role"] = "member", capacityHours = 40): TeamMember {
  const member: TeamMember = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    avatar_url: null,
    capacity_hours: capacityHours,
    created_at: new Date().toISOString(),
  };
  store.push(member);
  return member;
}

export function updateTeamMember(id: string, updates: Partial<Pick<TeamMember, "name" | "email" | "role" | "capacity_hours">>): TeamMember | null {
  const member = store.find((m) => m.id === id);
  if (!member) return null;
  if (updates.name !== undefined) member.name = updates.name;
  if (updates.email !== undefined) member.email = updates.email;
  if (updates.role !== undefined) member.role = updates.role;
  if (updates.capacity_hours !== undefined) member.capacity_hours = updates.capacity_hours;
  return member;
}

export function deleteTeamMember(id: string): boolean {
  const idx = store.findIndex((m) => m.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}
