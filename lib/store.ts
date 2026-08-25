import { SEED_ISSUES, SEED_PRODUCTS } from "./seed";
import type { CreateIssueInput, Issue, IssueLink, Product } from "./types";

type Memory = {
  products: Product[];
  issues: Issue[];
  links: IssueLink[];
};

const g = globalThis as typeof globalThis & { __boss?: Memory };

function mem(): Memory {
  if (!g.__boss) {
    g.__boss = {
      products: SEED_PRODUCTS.map((p) => ({ ...p })),
      issues: SEED_ISSUES.map((i) => ({ ...i })),
      links: [],
    };
  }
  return g.__boss;
}

export function listProducts(): Product[] {
  return mem().products.slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function getProduct(slug: string): Product | undefined {
  return mem().products.find((p) => p.slug === slug || p.id === slug);
}

export function listIssues(productId?: string): Issue[] {
  const rows = mem().issues.filter((i) => !productId || i.product_id === productId);
  return rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function listLinks(productId?: string): IssueLink[] {
  return mem().links.filter((l) => !productId || l.product_id === productId);
}

export function validateCreate(input: CreateIssueInput): string | null {
  if (!input.title?.trim()) return "title required";
  if (!input.product_id) return "product_id required";
  if (!getProduct(input.product_id) && !mem().products.some((p) => p.id === input.product_id)) {
    return "unknown product";
  }
  if (input.assignee_kind === "agent") {
    if (!input.agent_name) return "agent_name required";
    if (input.cost_cap_cents == null || Number.isNaN(input.cost_cap_cents)) {
      return "cost_cap_cents required for agent";
    }
    if (input.cost_cap_cents < 0) return "cost cap cannot be negative";
  }
  if (input.assignee_kind === "user" && !input.assignee_user?.trim()) {
    return "assignee_user required";
  }
  return null;
}

export function createIssue(input: CreateIssueInput): Issue {
  const err = validateCreate(input);
  if (err) throw new Error(err);
  const now = new Date().toISOString();
  const issue: Issue = {
    id: crypto.randomUUID(),
    product_id: input.product_id,
    title: input.title.trim(),
    body: input.body?.trim() ?? "",
    status: "open",
    assignee_kind: input.assignee_kind,
    assignee_user: input.assignee_kind === "user" ? input.assignee_user!.trim() : null,
    agent_name: input.assignee_kind === "agent" ? input.agent_name! : null,
    cost_cap_cents: input.assignee_kind === "agent" ? input.cost_cap_cents! : null,
    due_on: input.due_on ?? null,
    created_at: now,
    updated_at: now,
  };
  mem().issues.unshift(issue);
  return issue;
}

export function getIssue(id: string): Issue | undefined {
  return mem().issues.find((i) => i.id === id);
}

export function updateIssue(id: string, updates: Partial<Pick<Issue, "status" | "title" | "body" | "due_on">>): Issue | null {
  const m = mem();
  const idx = m.issues.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  const issue = m.issues[idx];
  if (updates.status !== undefined) issue.status = updates.status;
  if (updates.title !== undefined) issue.title = updates.title;
  if (updates.body !== undefined) issue.body = updates.body;
  if (updates.due_on !== undefined) issue.due_on = updates.due_on;
  issue.updated_at = new Date().toISOString();
  return issue;
}

export function deleteIssue(id: string): boolean {
  const m = mem();
  const idx = m.issues.findIndex((i) => i.id === id);
  if (idx < 0) return false;
  m.issues.splice(idx, 1);
  return true;
}

export function upsertLinks(incoming: IssueLink[]): IssueLink[] {
  const m = mem();
  for (const row of incoming) {
    const i = m.links.findIndex(
      (l) =>
        l.github_owner === row.github_owner &&
        l.github_repo === row.github_repo &&
        l.github_issue_number === row.github_issue_number
    );
    if (i >= 0) m.links[i] = { ...m.links[i], ...row };
    else m.links.push(row);
  }
  return incoming;
}

export function mirrorStatusFromGithub(): number {
  const m = mem();
  let n = 0;
  for (const issue of m.issues) {
    const link = m.links.find((l) => l.issue_id === issue.id);
    if (!link) continue;
    const next = link.github_state === "closed" ? "done" : "open";
    if (issue.status !== next && issue.status !== "cancelled") {
      issue.status = next;
      issue.updated_at = new Date().toISOString();
      n += 1;
    }
  }
  return n;
}
