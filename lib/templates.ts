import type { IssuePriority } from "./types";

export type IssueTemplate = {
  id: string;
  name: string;
  title_prefix: string;
  body: string;
  priority: IssuePriority;
  assignee_kind: "user" | "agent";
  agent_name?: string;
  cost_cap_cents?: number;
};

export const TEMPLATES: IssueTemplate[] = [
  {
    id: "bug",
    name: "Bug Report",
    title_prefix: "[Bug] ",
    body: "Steps to reproduce:\n1. \n\nExpected:\n\nActual:\n",
    priority: "high",
    assignee_kind: "user",
  },
  {
    id: "feature",
    name: "Feature Request",
    title_prefix: "[Feature] ",
    body: "As a user, I want to...\n\nSo that...\n\nAcceptance criteria:\n- [ ] \n",
    priority: "medium",
    assignee_kind: "user",
  },
  {
    id: "agent-task",
    name: "Agent Task",
    title_prefix: "[Agent] ",
    body: "Task description:\n\nConstraints:\n- Must stay within cap\n- No new dependencies\n",
    priority: "medium",
    assignee_kind: "agent",
    agent_name: "alice",
    cost_cap_cents: 400,
  },
  {
    id: "research",
    name: "Research Spike",
    title_prefix: "[Spike] ",
    body: "Question to answer:\n\nTime-box: 2 hours\n\nDeliverables:\n- Written summary\n- Recommendation\n",
    priority: "low",
    assignee_kind: "user",
  },
  {
    id: "swarm",
    name: "Swarm Task",
    title_prefix: "[Swarm] ",
    body: "Objective:\n\nVariants to produce:\n\nSuccess criteria:\n",
    priority: "medium",
    assignee_kind: "agent",
    agent_name: "swarm",
    cost_cap_cents: 600,
  },
];
