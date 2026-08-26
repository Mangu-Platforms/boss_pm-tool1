export type ChangeRequestStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "implemented";
export type ChangeRequestPriority = "critical" | "high" | "medium" | "low";
export type ChangeCategory = "feature" | "bugfix" | "infrastructure" | "process" | "security";

export type ChangeRequest = {
  id: string;
  title: string;
  description: string;
  category: ChangeCategory;
  priority: ChangeRequestPriority;
  status: ChangeRequestStatus;
  requester: string;
  reviewer: string | null;
  affected_systems: string[];
  risk_level: "low" | "medium" | "high";
  rollback_plan: string;
  submitted_at: string;
  reviewed_at: string | null;
  implemented_at: string | null;
  created_at: string;
};

const changeRequests: ChangeRequest[] = [
  { id: "cr-1", title: "Migrate DB to PostgreSQL 16", description: "Upgrade from PG14 to PG16 for performance", category: "infrastructure", priority: "high", status: "approved", requester: "max", reviewer: "sami", affected_systems: ["database", "api"], risk_level: "high", rollback_plan: "Restore PG14 backup", submitted_at: "2025-08-01T10:00:00Z", reviewed_at: "2025-08-03T14:00:00Z", implemented_at: null, created_at: "2025-08-01T10:00:00Z" },
  { id: "cr-2", title: "Add rate limiting to API", description: "Implement 100req/min per user", category: "security", priority: "critical", status: "implemented", requester: "sami", reviewer: "max", affected_systems: ["api", "gateway"], risk_level: "medium", rollback_plan: "Remove middleware", submitted_at: "2025-07-20T08:00:00Z", reviewed_at: "2025-07-21T09:00:00Z", implemented_at: "2025-07-25T16:00:00Z", created_at: "2025-07-20T08:00:00Z" },
  { id: "cr-3", title: "Redesign notification system", description: "Move to event-driven architecture", category: "feature", priority: "medium", status: "under_review", requester: "priya", reviewer: "max", affected_systems: ["notifications", "events", "api"], risk_level: "medium", rollback_plan: "Revert to polling", submitted_at: "2025-08-15T12:00:00Z", reviewed_at: null, implemented_at: null, created_at: "2025-08-15T12:00:00Z" },
  { id: "cr-4", title: "Update CI pipeline to use Docker", description: "Containerize build environment", category: "infrastructure", priority: "low", status: "draft", requester: "carlos", reviewer: null, affected_systems: ["ci"], risk_level: "low", rollback_plan: "Revert pipeline config", submitted_at: "2025-08-20T11:00:00Z", reviewed_at: null, implemented_at: null, created_at: "2025-08-20T11:00:00Z" },
];

let nextId = 5;

export function listChangeRequests(status?: ChangeRequestStatus): ChangeRequest[] {
  let result = [...changeRequests];
  if (status) result = result.filter((cr) => cr.status === status);
  return result.sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
}

export function getChangeRequest(id: string): ChangeRequest | null {
  return changeRequests.find((cr) => cr.id === id) || null;
}

export function createChangeRequest(title: string, description: string, category: ChangeCategory, priority: ChangeRequestPriority, requester: string, affectedSystems: string[], riskLevel: "low" | "medium" | "high", rollbackPlan: string): ChangeRequest {
  const now = new Date().toISOString();
  const cr: ChangeRequest = {
    id: `cr-${nextId++}`,
    title,
    description,
    category,
    priority,
    status: "draft",
    requester,
    reviewer: null,
    affected_systems: affectedSystems,
    risk_level: riskLevel,
    rollback_plan: rollbackPlan,
    submitted_at: now,
    reviewed_at: null,
    implemented_at: null,
    created_at: now,
  };
  changeRequests.push(cr);
  return cr;
}

export function updateChangeRequest(id: string, updates: Partial<Pick<ChangeRequest, "status" | "reviewer" | "priority" | "risk_level">>): ChangeRequest | null {
  const cr = changeRequests.find((c) => c.id === id);
  if (!cr) return null;
  if (updates.status === "approved" || updates.status === "rejected") cr.reviewed_at = new Date().toISOString();
  if (updates.status === "implemented") cr.implemented_at = new Date().toISOString();
  Object.assign(cr, updates);
  return cr;
}

export function deleteChangeRequest(id: string): boolean {
  const idx = changeRequests.findIndex((cr) => cr.id === id);
  if (idx < 0) return false;
  changeRequests.splice(idx, 1);
  return true;
}

export function changeRequestStats(): { total: number; pending: number; approved: number; rejected: number; implemented: number } {
  return {
    total: changeRequests.length,
    pending: changeRequests.filter((cr) => cr.status === "submitted" || cr.status === "under_review").length,
    approved: changeRequests.filter((cr) => cr.status === "approved").length,
    rejected: changeRequests.filter((cr) => cr.status === "rejected").length,
    implemented: changeRequests.filter((cr) => cr.status === "implemented").length,
  };
}
