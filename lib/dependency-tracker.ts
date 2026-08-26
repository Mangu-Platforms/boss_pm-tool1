export type DepType = "npm" | "pip" | "gem" | "go" | "cargo" | "other";
export type DepStatus = "current" | "outdated" | "vulnerable" | "deprecated";

export type Dependency = {
  id: string;
  service_id: string;
  name: string;
  current_version: string;
  latest_version: string;
  type: DepType;
  status: DepStatus;
  license: string;
  direct: boolean;
  last_updated: string;
};

let nextId = 13;

const deps: Dependency[] = [
  { id: "dep-1", service_id: "svc-1", name: "next", current_version: "15.1.0", latest_version: "15.1.0", type: "npm", status: "current", license: "MIT", direct: true, last_updated: "2025-01-20T00:00:00Z" },
  { id: "dep-2", service_id: "svc-1", name: "react", current_version: "19.0.0", latest_version: "19.0.0", type: "npm", status: "current", license: "MIT", direct: true, last_updated: "2025-01-20T00:00:00Z" },
  { id: "dep-3", service_id: "svc-1", name: "lodash", current_version: "4.17.19", latest_version: "4.17.21", type: "npm", status: "vulnerable", license: "MIT", direct: true, last_updated: "2024-06-01T00:00:00Z" },
  { id: "dep-4", service_id: "svc-2", name: "express", current_version: "4.18.2", latest_version: "4.21.0", type: "npm", status: "outdated", license: "MIT", direct: true, last_updated: "2024-09-01T00:00:00Z" },
  { id: "dep-5", service_id: "svc-2", name: "moment", current_version: "2.29.4", latest_version: "2.30.1", type: "npm", status: "deprecated", license: "MIT", direct: true, last_updated: "2023-12-01T00:00:00Z" },
  { id: "dep-6", service_id: "svc-3", name: "fastapi", current_version: "0.108.0", latest_version: "0.109.0", type: "pip", status: "outdated", license: "MIT", direct: true, last_updated: "2025-01-10T00:00:00Z" },
  { id: "dep-7", service_id: "svc-3", name: "sqlalchemy", current_version: "2.0.25", latest_version: "2.0.25", type: "pip", status: "current", license: "MIT", direct: true, last_updated: "2025-01-15T00:00:00Z" },
  { id: "dep-8", service_id: "svc-4", name: "gin", current_version: "1.9.1", latest_version: "1.10.0", type: "go", status: "outdated", license: "MIT", direct: true, last_updated: "2024-11-01T00:00:00Z" },
  { id: "dep-9", service_id: "svc-1", name: "typescript", current_version: "5.3.3", latest_version: "5.7.0", type: "npm", status: "outdated", license: "Apache-2.0", direct: true, last_updated: "2024-12-01T00:00:00Z" },
  { id: "dep-10", service_id: "svc-1", name: "uuid", current_version: "9.0.0", latest_version: "11.0.0", type: "npm", status: "outdated", license: "MIT", direct: false, last_updated: "2024-01-01T00:00:00Z" },
  { id: "dep-11", service_id: "svc-5", name: "tokio", current_version: "1.35.0", latest_version: "1.36.0", type: "cargo", status: "outdated", license: "MIT", direct: true, last_updated: "2025-01-01T00:00:00Z" },
  { id: "dep-12", service_id: "svc-5", name: "serde", current_version: "1.0.195", latest_version: "1.0.195", type: "cargo", status: "current", license: "MIT/Apache-2.0", direct: true, last_updated: "2025-01-20T00:00:00Z" },
];

export function listDependencies(service_id?: string, type?: DepType, status?: DepStatus): Dependency[] {
  let result = [...deps];
  if (service_id) result = result.filter((d) => d.service_id === service_id);
  if (type) result = result.filter((d) => d.type === type);
  if (status) result = result.filter((d) => d.status === status);
  const statusOrder: Record<string, number> = { vulnerable: 0, deprecated: 1, outdated: 2, current: 3 };
  return result.sort((a, b) => (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4));
}

export function getDependency(id: string): Dependency | null {
  return deps.find((d) => d.id === id) || null;
}

export function createDependency(service_id: string, name: string, current_version: string, latest_version: string, type: DepType, license: string, direct: boolean): Dependency {
  const status: DepStatus = current_version === latest_version ? "current" : "outdated";
  const d: Dependency = {
    id: `dep-${nextId++}`,
    service_id,
    name,
    current_version,
    latest_version,
    type,
    status,
    license,
    direct,
    last_updated: new Date().toISOString(),
  };
  deps.push(d);
  return d;
}

export function updateDependency(id: string, updates: Partial<Pick<Dependency, "current_version" | "latest_version" | "status">>): Dependency | null {
  const d = deps.find((de) => de.id === id);
  if (!d) return null;
  Object.assign(d, updates);
  d.last_updated = new Date().toISOString();
  return d;
}

export function deleteDependency(id: string): boolean {
  const idx = deps.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  deps.splice(idx, 1);
  return true;
}

export function depStats(service_id?: string) {
  const filtered = service_id ? deps.filter((d) => d.service_id === service_id) : deps;
  const total = filtered.length;
  const by_status: Record<string, number> = {};
  const by_type: Record<string, number> = {};
  filtered.forEach((d) => {
    by_status[d.status] = (by_status[d.status] || 0) + 1;
    by_type[d.type] = (by_type[d.type] || 0) + 1;
  });
  const direct = filtered.filter((d) => d.direct).length;
  return { total, direct, transitive: total - direct, by_status, by_type };
}
