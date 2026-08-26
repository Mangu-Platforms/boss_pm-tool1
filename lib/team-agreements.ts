export type AgreementType = "working_agreement" | "definition_of_done" | "code_standards" | "review_policy" | "communication" | "on_call_policy";
export type AgreementStatus = "draft" | "active" | "archived";

export type Agreement = {
  id: string;
  team: string;
  type: AgreementType;
  title: string;
  content: string;
  status: AgreementStatus;
  version: number;
  author: string;
  approved_by: string[];
  created_at: string;
  updated_at: string;
};

let nextId = 8;

const agreements: Agreement[] = [
  { id: "ag-1", team: "platform", type: "working_agreement", title: "Core Hours", content: "Team available 10am-4pm EST for synchronous work. Async communication preferred outside core hours.", status: "active", version: 2, author: "max", approved_by: ["sami", "alex"], created_at: "2024-11-01T00:00:00Z", updated_at: "2025-01-10T00:00:00Z" },
  { id: "ag-2", team: "platform", type: "definition_of_done", title: "Definition of Done", content: "Code reviewed, tests passing, docs updated, deployed to staging, QA approved.", status: "active", version: 3, author: "sami", approved_by: ["max", "alex", "pat"], created_at: "2024-10-01T00:00:00Z", updated_at: "2025-01-05T00:00:00Z" },
  { id: "ag-3", team: "platform", type: "code_standards", title: "Code Review Standards", content: "All PRs require 2 approvals. Reviews within 4 hours during core hours. No self-merges.", status: "active", version: 1, author: "alex", approved_by: ["max", "sami"], created_at: "2024-12-01T00:00:00Z", updated_at: "2024-12-01T00:00:00Z" },
  { id: "ag-4", team: "frontend", type: "code_standards", title: "Component Guidelines", content: "Use TypeScript strict mode. Prefer composition over inheritance. All components need Storybook stories.", status: "active", version: 2, author: "pat", approved_by: ["max"], created_at: "2024-11-15T00:00:00Z", updated_at: "2025-01-08T00:00:00Z" },
  { id: "ag-5", team: "frontend", type: "review_policy", title: "PR Size Policy", content: "PRs should be under 400 lines. Larger PRs need justification and should be split if possible.", status: "active", version: 1, author: "max", approved_by: ["pat"], created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "ag-6", team: "infra", type: "on_call_policy", title: "On-Call Rotation", content: "Weekly rotation, primary + secondary. Handoff at Monday 9am. Escalation after 15 min no-response.", status: "active", version: 1, author: "sami", approved_by: ["max", "alex"], created_at: "2024-12-15T00:00:00Z", updated_at: "2024-12-15T00:00:00Z" },
  { id: "ag-7", team: "platform", type: "communication", title: "Meeting Policy (Old)", content: "No meetings on Wednesdays.", status: "archived", version: 1, author: "max", approved_by: ["sami"], created_at: "2024-06-01T00:00:00Z", updated_at: "2024-12-01T00:00:00Z" },
];

export function listAgreements(team?: string, type?: AgreementType, status?: AgreementStatus): Agreement[] {
  let result = [...agreements];
  if (team) result = result.filter((a) => a.team === team);
  if (type) result = result.filter((a) => a.type === type);
  if (status) result = result.filter((a) => a.status === status);
  return result.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getAgreement(id: string): Agreement | null {
  return agreements.find((a) => a.id === id) || null;
}

export function createAgreement(team: string, type: AgreementType, title: string, content: string, author: string): Agreement {
  const ag: Agreement = {
    id: `ag-${nextId++}`,
    team,
    type,
    title,
    content,
    status: "draft",
    version: 1,
    author,
    approved_by: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  agreements.push(ag);
  return ag;
}

export function updateAgreement(id: string, updates: Partial<Pick<Agreement, "title" | "content" | "status" | "type">>): Agreement | null {
  const ag = agreements.find((a) => a.id === id);
  if (!ag) return null;
  const contentChanged = updates.content !== undefined && updates.content !== ag.content;
  Object.assign(ag, updates);
  if (contentChanged) ag.version++;
  ag.updated_at = new Date().toISOString();
  return ag;
}

export function approveAgreement(id: string, approver: string): Agreement | null {
  const ag = agreements.find((a) => a.id === id);
  if (!ag) return null;
  if (!ag.approved_by.includes(approver)) {
    ag.approved_by.push(approver);
  }
  return ag;
}

export function deleteAgreement(id: string): boolean {
  const idx = agreements.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  agreements.splice(idx, 1);
  return true;
}

export function agreementStats(team?: string) {
  const filtered = team ? agreements.filter((a) => a.team === team) : agreements;
  const total = filtered.length;
  const active = filtered.filter((a) => a.status === "active").length;
  const by_type: Record<string, number> = {};
  filtered.forEach((a) => { by_type[a.type] = (by_type[a.type] || 0) + 1; });
  return { total, active, by_type };
}
