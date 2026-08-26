export type CostEntry = {
  id: string;
  issue_id: string;
  category: "development" | "infrastructure" | "licensing" | "support" | "other";
  amount_cents: number;
  description: string;
  recorded_by: string;
  created_at: string;
};

export type CostSummary = {
  total_cents: number;
  by_category: Record<string, number>;
  by_issue: Record<string, number>;
  entry_count: number;
};

let nextId = 5;
function genId() { return `cost-${nextId++}`; }

const store: CostEntry[] = [
  { id: "cost-1", issue_id: "BOSS-1", category: "development", amount_cents: 50000, description: "Developer time (5h)", recorded_by: "max", created_at: "2025-03-01T10:00:00Z" },
  { id: "cost-2", issue_id: "BOSS-1", category: "infrastructure", amount_cents: 1200, description: "CI compute", recorded_by: "max", created_at: "2025-03-02T10:00:00Z" },
  { id: "cost-3", issue_id: "BOSS-3", category: "development", amount_cents: 75000, description: "Agent task cost", recorded_by: "alice", created_at: "2025-03-05T10:00:00Z" },
  { id: "cost-4", issue_id: "BOSS-5", category: "licensing", amount_cents: 9900, description: "API license fee", recorded_by: "max", created_at: "2025-03-10T10:00:00Z" },
];

export function listCostEntries(issueId?: string): CostEntry[] {
  if (issueId) return store.filter((c) => c.issue_id === issueId);
  return [...store];
}

export function getCostEntry(id: string): CostEntry | null {
  return store.find((c) => c.id === id) || null;
}

export function createCostEntry(issueId: string, category: CostEntry["category"], amountCents: number, description: string, recordedBy: string): CostEntry {
  const entry: CostEntry = { id: genId(), issue_id: issueId, category, amount_cents: amountCents, description, recorded_by: recordedBy, created_at: new Date().toISOString() };
  store.push(entry);
  return entry;
}

export function deleteCostEntry(id: string): boolean {
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function costSummary(issueId?: string): CostSummary {
  const entries = issueId ? store.filter((c) => c.issue_id === issueId) : store;
  const byCategory: Record<string, number> = {};
  const byIssue: Record<string, number> = {};
  let total = 0;
  for (const e of entries) {
    total += e.amount_cents;
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount_cents;
    byIssue[e.issue_id] = (byIssue[e.issue_id] || 0) + e.amount_cents;
  }
  return { total_cents: total, by_category: byCategory, by_issue: byIssue, entry_count: entries.length };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
