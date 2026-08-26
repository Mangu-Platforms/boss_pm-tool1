export type SLAPriority = "critical" | "high" | "medium" | "low";

export type SLAPolicy = {
  id: string;
  name: string;
  priority: SLAPriority;
  response_hours: number;
  resolution_hours: number;
  business_hours_only: boolean;
  active: boolean;
  created_at: string;
};

export type SLABreach = {
  id: string;
  policy_id: string;
  issue_id: string;
  breach_type: "response" | "resolution";
  breached_at: string;
};

let nextPolicyId = 5;
let nextBreachId = 3;
function policyId() { return `slap-${nextPolicyId++}`; }
function breachId() { return `slab-${nextBreachId++}`; }

const policies: SLAPolicy[] = [
  { id: "slap-1", name: "Critical SLA", priority: "critical", response_hours: 1, resolution_hours: 4, business_hours_only: false, active: true, created_at: "2025-01-15T10:00:00Z" },
  { id: "slap-2", name: "High Priority SLA", priority: "high", response_hours: 4, resolution_hours: 24, business_hours_only: true, active: true, created_at: "2025-01-15T10:00:00Z" },
  { id: "slap-3", name: "Medium Priority SLA", priority: "medium", response_hours: 8, resolution_hours: 48, business_hours_only: true, active: true, created_at: "2025-01-15T10:00:00Z" },
  { id: "slap-4", name: "Low Priority SLA", priority: "low", response_hours: 24, resolution_hours: 120, business_hours_only: true, active: true, created_at: "2025-01-15T10:00:00Z" },
];

const breaches: SLABreach[] = [
  { id: "slab-1", policy_id: "slap-1", issue_id: "BOSS-3", breach_type: "response", breached_at: "2025-03-20T15:00:00Z" },
  { id: "slab-2", policy_id: "slap-2", issue_id: "BOSS-5", breach_type: "resolution", breached_at: "2025-03-25T18:00:00Z" },
];

export function listPolicies(): SLAPolicy[] { return [...policies]; }

export function getPolicy(id: string): SLAPolicy | null {
  return policies.find((p) => p.id === id) || null;
}

export function createPolicy(name: string, priority: SLAPriority, responseHours: number, resolutionHours: number, businessHoursOnly = true): SLAPolicy {
  const p: SLAPolicy = { id: policyId(), name, priority, response_hours: responseHours, resolution_hours: resolutionHours, business_hours_only: businessHoursOnly, active: true, created_at: new Date().toISOString() };
  policies.push(p);
  return p;
}

export function updatePolicy(id: string, updates: Partial<Pick<SLAPolicy, "name" | "response_hours" | "resolution_hours" | "business_hours_only" | "active">>): SLAPolicy | null {
  const p = policies.find((pol) => pol.id === id);
  if (!p) return null;
  if (updates.name !== undefined) p.name = updates.name;
  if (updates.response_hours !== undefined) p.response_hours = updates.response_hours;
  if (updates.resolution_hours !== undefined) p.resolution_hours = updates.resolution_hours;
  if (updates.business_hours_only !== undefined) p.business_hours_only = updates.business_hours_only;
  if (updates.active !== undefined) p.active = updates.active;
  return p;
}

export function deletePolicy(id: string): boolean {
  const idx = policies.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  policies.splice(idx, 1);
  return true;
}

export function listBreaches(policyId?: string): SLABreach[] {
  if (policyId) return breaches.filter((b) => b.policy_id === policyId);
  return [...breaches];
}

export function recordBreach(policyId: string, issueId: string, breachType: "response" | "resolution"): SLABreach {
  const b: SLABreach = { id: breachId(), policy_id: policyId, issue_id: issueId, breach_type: breachType, breached_at: new Date().toISOString() };
  breaches.push(b);
  return b;
}

export function policyForPriority(priority: SLAPriority): SLAPolicy | null {
  return policies.find((p) => p.priority === priority && p.active) || null;
}
