export type ReleaseType = "major" | "minor" | "patch" | "hotfix";
export type ReleaseCalendarStatus = "planned" | "in_progress" | "released" | "cancelled";

export type CalendarRelease = {
  id: string;
  version: string;
  name: string;
  type: ReleaseType;
  status: ReleaseCalendarStatus;
  planned_date: string;
  actual_date: string | null;
  owner: string;
  features: string[];
  created_at: string;
};

let nextId = 6;
function genId() { return `calrel-${nextId++}`; }

const store: CalendarRelease[] = [
  { id: "calrel-1", version: "2.0.0", name: "Platform Rewrite", type: "major", status: "released", planned_date: "2025-03-01", actual_date: "2025-03-03", owner: "max", features: ["New UI", "API v2", "Auth overhaul"], created_at: "2025-01-15T10:00:00Z" },
  { id: "calrel-2", version: "2.1.0", name: "Analytics Dashboard", type: "minor", status: "in_progress", planned_date: "2025-04-15", actual_date: null, owner: "alice", features: ["Dashboard widgets", "Export reports"], created_at: "2025-03-01T10:00:00Z" },
  { id: "calrel-3", version: "2.1.1", name: "Bug Fixes", type: "patch", status: "planned", planned_date: "2025-04-30", actual_date: null, owner: "bob", features: ["Fix login", "Fix export"], created_at: "2025-03-15T10:00:00Z" },
  { id: "calrel-4", version: "2.0.1", name: "Security Patch", type: "hotfix", status: "released", planned_date: "2025-03-10", actual_date: "2025-03-10", owner: "max", features: ["XSS fix", "Rate limiting"], created_at: "2025-03-08T10:00:00Z" },
  { id: "calrel-5", version: "3.0.0", name: "Enterprise Features", type: "major", status: "planned", planned_date: "2025-07-01", actual_date: null, owner: "max", features: ["SSO", "RBAC", "Audit trails"], created_at: "2025-04-01T10:00:00Z" },
];

export function listReleases(status?: ReleaseCalendarStatus): CalendarRelease[] {
  if (status) return store.filter((r) => r.status === status).sort((a, b) => a.planned_date.localeCompare(b.planned_date));
  return [...store].sort((a, b) => a.planned_date.localeCompare(b.planned_date));
}

export function getRelease(id: string): CalendarRelease | null {
  return store.find((r) => r.id === id) || null;
}

export function createRelease(version: string, name: string, type: ReleaseType, plannedDate: string, owner: string): CalendarRelease {
  const release: CalendarRelease = {
    id: genId(), version, name, type, status: "planned",
    planned_date: plannedDate, actual_date: null, owner, features: [],
    created_at: new Date().toISOString(),
  };
  store.push(release);
  return release;
}

export function updateRelease(id: string, updates: Partial<Pick<CalendarRelease, "name" | "status" | "planned_date" | "actual_date" | "features">>): CalendarRelease | null {
  const r = store.find((rl) => rl.id === id);
  if (!r) return null;
  if (updates.name !== undefined) r.name = updates.name;
  if (updates.status !== undefined) r.status = updates.status;
  if (updates.planned_date !== undefined) r.planned_date = updates.planned_date;
  if (updates.actual_date !== undefined) r.actual_date = updates.actual_date;
  if (updates.features !== undefined) r.features = updates.features;
  return r;
}

export function upcomingReleases(days: number = 60): CalendarRelease[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const nowStr = now.toISOString().split("T")[0];
  return store.filter((r) => r.planned_date >= nowStr && r.planned_date <= cutoffStr && r.status !== "released" && r.status !== "cancelled");
}

export function deleteRelease(id: string): boolean {
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
