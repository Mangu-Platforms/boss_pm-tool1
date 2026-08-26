export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Approval = {
  id: string;
  entity_type: "issue" | "release" | "milestone" | "sprint";
  entity_id: string;
  title: string;
  requested_by: string;
  approvers: string[];
  status: ApprovalStatus;
  decided_by: string | null;
  decided_at: string | null;
  notes: string;
  created_at: string;
};

let nextId = 4;
function genId() { return `apv-${nextId++}`; }

const store: Approval[] = [
  { id: "apv-1", entity_type: "release", entity_id: "rel-1", title: "Release v1.0 approval", requested_by: "max", approvers: ["alice", "bob"], status: "approved", decided_by: "alice", decided_at: "2025-02-01T12:00:00Z", notes: "Looks good to ship", created_at: "2025-02-01T10:00:00Z" },
  { id: "apv-2", entity_type: "issue", entity_id: "BOSS-5", title: "Cost cap increase", requested_by: "alice", approvers: ["max"], status: "pending", decided_by: null, decided_at: null, notes: "", created_at: "2025-03-15T14:00:00Z" },
  { id: "apv-3", entity_type: "milestone", entity_id: "ms-1", title: "Milestone completion sign-off", requested_by: "max", approvers: ["alice"], status: "pending", decided_by: null, decided_at: null, notes: "", created_at: "2025-03-20T10:00:00Z" },
];

export function listApprovals(status?: ApprovalStatus): Approval[] {
  if (status) return store.filter((a) => a.status === status);
  return [...store];
}

export function getApproval(id: string): Approval | null {
  return store.find((a) => a.id === id) || null;
}

export function requestApproval(entityType: Approval["entity_type"], entityId: string, title: string, requestedBy: string, approvers: string[]): Approval {
  const a: Approval = { id: genId(), entity_type: entityType, entity_id: entityId, title, requested_by: requestedBy, approvers, status: "pending", decided_by: null, decided_at: null, notes: "", created_at: new Date().toISOString() };
  store.push(a);
  return a;
}

export function decideApproval(id: string, decision: "approved" | "rejected", decidedBy: string, notes = ""): Approval | null {
  const a = store.find((ap) => ap.id === id);
  if (!a || a.status !== "pending") return null;
  if (!a.approvers.includes(decidedBy)) return null;
  a.status = decision;
  a.decided_by = decidedBy;
  a.decided_at = new Date().toISOString();
  a.notes = notes;
  return a;
}

export function deleteApproval(id: string): boolean {
  const idx = store.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function pendingForUser(user: string): Approval[] {
  return store.filter((a) => a.status === "pending" && a.approvers.includes(user));
}
