export type CostCategory = "compute" | "storage" | "network" | "licensing" | "support" | "other";
export type AllocationPeriod = "monthly" | "quarterly" | "annual";

export type CostEntry = {
  id: string;
  service_id: string;
  team: string;
  category: CostCategory;
  amount_cents: number;
  period: AllocationPeriod;
  period_label: string;
  description: string;
  created_at: string;
};

let nextId = 13;

const entries: CostEntry[] = [
  { id: "ca-1", service_id: "svc-1", team: "platform", category: "compute", amount_cents: 450000, period: "monthly", period_label: "Jan 2025", description: "AWS EC2 instances", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-2", service_id: "svc-1", team: "platform", category: "storage", amount_cents: 120000, period: "monthly", period_label: "Jan 2025", description: "S3 and EBS volumes", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-3", service_id: "svc-2", team: "platform", category: "compute", amount_cents: 280000, period: "monthly", period_label: "Jan 2025", description: "GKE cluster", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-4", service_id: "svc-2", team: "platform", category: "network", amount_cents: 85000, period: "monthly", period_label: "Jan 2025", description: "CDN and load balancer", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-5", service_id: "svc-3", team: "data", category: "compute", amount_cents: 600000, period: "monthly", period_label: "Jan 2025", description: "Data pipeline compute", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-6", service_id: "svc-3", team: "data", category: "storage", amount_cents: 350000, period: "monthly", period_label: "Jan 2025", description: "BigQuery storage", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-7", service_id: "svc-4", team: "frontend", category: "compute", amount_cents: 150000, period: "monthly", period_label: "Jan 2025", description: "Vercel hosting", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-8", service_id: "svc-1", team: "platform", category: "licensing", amount_cents: 200000, period: "monthly", period_label: "Jan 2025", description: "Datadog monitoring", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-9", service_id: "svc-1", team: "platform", category: "compute", amount_cents: 480000, period: "monthly", period_label: "Feb 2025", description: "AWS EC2 instances", created_at: "2025-02-01T00:00:00Z" },
  { id: "ca-10", service_id: "svc-2", team: "platform", category: "compute", amount_cents: 295000, period: "monthly", period_label: "Feb 2025", description: "GKE cluster", created_at: "2025-02-01T00:00:00Z" },
  { id: "ca-11", service_id: "svc-5", team: "infra", category: "support", amount_cents: 500000, period: "monthly", period_label: "Jan 2025", description: "AWS Enterprise Support", created_at: "2025-01-01T00:00:00Z" },
  { id: "ca-12", service_id: "svc-5", team: "infra", category: "other", amount_cents: 75000, period: "monthly", period_label: "Jan 2025", description: "SSL certificates", created_at: "2025-01-01T00:00:00Z" },
];

export function listCosts(service_id?: string, team?: string, category?: CostCategory, period_label?: string): CostEntry[] {
  let result = [...entries];
  if (service_id) result = result.filter((e) => e.service_id === service_id);
  if (team) result = result.filter((e) => e.team === team);
  if (category) result = result.filter((e) => e.category === category);
  if (period_label) result = result.filter((e) => e.period_label === period_label);
  return result.sort((a, b) => b.amount_cents - a.amount_cents);
}

export function getCost(id: string): CostEntry | null {
  return entries.find((e) => e.id === id) || null;
}

export function createCost(service_id: string, team: string, category: CostCategory, amount_cents: number, period: AllocationPeriod, period_label: string, description: string): CostEntry {
  const e: CostEntry = {
    id: `ca-${nextId++}`,
    service_id,
    team,
    category,
    amount_cents,
    period,
    period_label,
    description,
    created_at: new Date().toISOString(),
  };
  entries.push(e);
  return e;
}

export function deleteCost(id: string): boolean {
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  entries.splice(idx, 1);
  return true;
}

export function costSummary(period_label?: string) {
  const filtered = period_label ? entries.filter((e) => e.period_label === period_label) : entries;
  const total_cents = filtered.reduce((s, e) => s + e.amount_cents, 0);
  const by_team: Record<string, number> = {};
  const by_category: Record<string, number> = {};
  const by_service: Record<string, number> = {};
  filtered.forEach((e) => {
    by_team[e.team] = (by_team[e.team] || 0) + e.amount_cents;
    by_category[e.category] = (by_category[e.category] || 0) + e.amount_cents;
    by_service[e.service_id] = (by_service[e.service_id] || 0) + e.amount_cents;
  });
  return { total_cents, by_team, by_category, by_service, entry_count: filtered.length };
}
