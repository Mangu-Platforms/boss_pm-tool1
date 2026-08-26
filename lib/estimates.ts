export type EstimateUnit = "points" | "hours" | "days";

export type Estimate = {
  id: string;
  issue_id: string;
  value: number;
  unit: EstimateUnit;
  estimated_by: string;
  created_at: string;
};

const estimates: Estimate[] = [
  { id: "est-1", issue_id: "BOSS-1", value: 5, unit: "points", estimated_by: "alice", created_at: "2025-03-01T00:00:00.000Z" },
  { id: "est-2", issue_id: "BOSS-2", value: 8, unit: "points", estimated_by: "bob", created_at: "2025-03-01T00:00:00.000Z" },
  { id: "est-3", issue_id: "BOSS-3", value: 3, unit: "points", estimated_by: "alice", created_at: "2025-03-02T00:00:00.000Z" },
  { id: "est-4", issue_id: "BOSS-4", value: 2, unit: "days", estimated_by: "carol", created_at: "2025-03-03T00:00:00.000Z" },
];

export function listEstimates(issueId?: string): Estimate[] {
  if (issueId) return estimates.filter((e) => e.issue_id === issueId);
  return [...estimates];
}

export function getEstimate(id: string): Estimate | null {
  return estimates.find((e) => e.id === id) || null;
}

export function createEstimate(issueId: string, value: number, unit: EstimateUnit, estimatedBy: string): Estimate {
  const est: Estimate = {
    id: `est-${crypto.randomUUID().slice(0, 8)}`,
    issue_id: issueId,
    value,
    unit,
    estimated_by: estimatedBy,
    created_at: new Date().toISOString(),
  };
  estimates.push(est);
  return est;
}

export function updateEstimate(id: string, value: number): Estimate | null {
  const est = estimates.find((e) => e.id === id);
  if (!est) return null;
  est.value = value;
  return est;
}

export function deleteEstimate(id: string): boolean {
  const idx = estimates.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  estimates.splice(idx, 1);
  return true;
}

export function totalEstimate(unit?: EstimateUnit): number {
  const items = unit ? estimates.filter((e) => e.unit === unit) : estimates;
  return items.reduce((sum, e) => sum + e.value, 0);
}

export function averageEstimate(unit?: EstimateUnit): number {
  const items = unit ? estimates.filter((e) => e.unit === unit) : estimates;
  if (items.length === 0) return 0;
  return items.reduce((sum, e) => sum + e.value, 0) / items.length;
}
