export type EngineTag = "cash-engine" | "lab";
export type IssueStatus = "backlog" | "open" | "doing" | "done" | "cancelled";
export type IssuePriority = "critical" | "high" | "medium" | "low";
export type AssigneeKind = "user" | "agent";
export type AgentName = "alice" | "swarm";

export type Product = {
  id: string;
  slug: string;
  name: string;
  engine_tag: EngineTag;
  github_owner: string;
  github_repo: string | null;
  homepage: string | null;
  money_note: string | null;
  created_at: string;
};

export type Issue = {
  id: string;
  product_id: string;
  title: string;
  body: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee_kind: AssigneeKind;
  assignee_user: string | null;
  agent_name: AgentName | null;
  cost_cap_cents: number | null;
  due_on: string | null;
  created_at: string;
  updated_at: string;
  pending?: boolean;
};

export type IssueLink = {
  id: string;
  issue_id: string | null;
  product_id: string;
  github_owner: string;
  github_repo: string;
  github_issue_number: number;
  github_issue_id: string | null;
  github_state: string;
  github_title: string;
  github_html_url: string;
  synced_at: string;
};

export type CreateIssueInput = {
  product_id: string;
  title: string;
  body?: string;
  priority?: IssuePriority;
  assignee_kind: AssigneeKind;
  assignee_user?: string | null;
  agent_name?: AgentName | null;
  cost_cap_cents?: number | null;
  due_on?: string | null;
};
