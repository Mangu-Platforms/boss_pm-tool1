export type ServiceTier = "tier-0" | "tier-1" | "tier-2" | "tier-3";
export type ServiceHealth = "healthy" | "degraded" | "outage" | "maintenance";

export type Service = {
  id: string;
  name: string;
  description: string;
  tier: ServiceTier;
  health: ServiceHealth;
  owner: string;
  team: string;
  repo_url: string | null;
  docs_url: string | null;
  dependencies: string[];
  sla_uptime: number;
  created_at: string;
};

const services: Service[] = [
  { id: "svc-1", name: "API Gateway", description: "Main API entry point", tier: "tier-0", health: "healthy", owner: "max", team: "platform", repo_url: "https://github.com/mangu/api-gateway", docs_url: null, dependencies: [], sla_uptime: 99.99, created_at: "2024-01-01T00:00:00Z" },
  { id: "svc-2", name: "Auth Service", description: "Authentication and authorization", tier: "tier-0", health: "healthy", owner: "sami", team: "security", repo_url: "https://github.com/mangu/auth", docs_url: null, dependencies: ["svc-1"], sla_uptime: 99.99, created_at: "2024-01-01T00:00:00Z" },
  { id: "svc-3", name: "Notification Service", description: "Email, SMS, push notifications", tier: "tier-1", health: "degraded", owner: "priya", team: "platform", repo_url: null, docs_url: null, dependencies: ["svc-1", "svc-2"], sla_uptime: 99.9, created_at: "2024-03-15T00:00:00Z" },
  { id: "svc-4", name: "Analytics Pipeline", description: "Data ingestion and processing", tier: "tier-2", health: "healthy", owner: "carlos", team: "data", repo_url: null, docs_url: null, dependencies: ["svc-1"], sla_uptime: 99.5, created_at: "2024-06-01T00:00:00Z" },
  { id: "svc-5", name: "CDN", description: "Static asset delivery", tier: "tier-1", health: "healthy", owner: "max", team: "infra", repo_url: null, docs_url: null, dependencies: [], sla_uptime: 99.95, created_at: "2024-02-01T00:00:00Z" },
];

let nextId = 6;

export function listServices(tier?: ServiceTier): Service[] {
  let result = [...services];
  if (tier) result = result.filter((s) => s.tier === tier);
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function getService(id: string): Service | null {
  return services.find((s) => s.id === id) || null;
}

export function createService(name: string, description: string, tier: ServiceTier, owner: string, team: string, slaUptime: number): Service {
  const svc: Service = {
    id: `svc-${nextId++}`,
    name,
    description,
    tier,
    health: "healthy",
    owner,
    team,
    repo_url: null,
    docs_url: null,
    dependencies: [],
    sla_uptime: slaUptime,
    created_at: new Date().toISOString(),
  };
  services.push(svc);
  return svc;
}

export function updateService(id: string, updates: Partial<Pick<Service, "health" | "tier" | "owner" | "team" | "description">>): Service | null {
  const svc = services.find((s) => s.id === id);
  if (!svc) return null;
  Object.assign(svc, updates);
  return svc;
}

export function addDependency(id: string, depId: string): Service | null {
  const svc = services.find((s) => s.id === id);
  if (!svc || id === depId) return null;
  if (!svc.dependencies.includes(depId)) svc.dependencies.push(depId);
  return svc;
}

export function deleteService(id: string): boolean {
  const idx = services.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  services.splice(idx, 1);
  return true;
}

export function dependencyGraph(): { nodes: string[]; edges: [string, string][] } {
  const nodes = services.map((s) => s.id);
  const edges: [string, string][] = [];
  for (const svc of services) {
    for (const dep of svc.dependencies) {
      edges.push([svc.id, dep]);
    }
  }
  return { nodes, edges };
}
