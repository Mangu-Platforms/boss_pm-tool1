export type IssueTemplate = {
  id: string;
  name: string;
  description: string;
  title_template: string;
  body_template: string;
  default_priority: string;
  default_labels: string[];
  fields: { name: string; placeholder: string; required: boolean }[];
};

const store: IssueTemplate[] = [
  {
    id: "tmpl-bug",
    name: "Bug Report",
    description: "Report a bug or defect",
    title_template: "[Bug] ",
    body_template: "## Description\n\n## Steps to Reproduce\n1. \n2. \n3. \n\n## Expected Behavior\n\n## Actual Behavior\n\n## Environment\n- OS: \n- Browser: \n- Version: ",
    default_priority: "high",
    default_labels: ["bug"],
    fields: [
      { name: "severity", placeholder: "Critical/Major/Minor", required: true },
      { name: "reproducible", placeholder: "Always/Sometimes/Rarely", required: false },
    ],
  },
  {
    id: "tmpl-feature",
    name: "Feature Request",
    description: "Request a new feature or enhancement",
    title_template: "[Feature] ",
    body_template: "## Problem Statement\n\n## Proposed Solution\n\n## Acceptance Criteria\n- [ ] \n- [ ] \n\n## Additional Context\n",
    default_priority: "medium",
    default_labels: ["feature"],
    fields: [
      { name: "impact", placeholder: "High/Medium/Low user impact", required: true },
    ],
  },
  {
    id: "tmpl-task",
    name: "Task",
    description: "A general task or to-do item",
    title_template: "",
    body_template: "## Objective\n\n## Steps\n- [ ] \n\n## Done when\n",
    default_priority: "medium",
    default_labels: [],
    fields: [],
  },
  {
    id: "tmpl-spike",
    name: "Research Spike",
    description: "Investigate or research a topic",
    title_template: "[Spike] ",
    body_template: "## Question\n\n## Context\n\n## Time box\n\n## Deliverable\n- [ ] Summary document\n- [ ] Recommendation\n",
    default_priority: "low",
    default_labels: ["research"],
    fields: [
      { name: "time_box", placeholder: "Hours allocated", required: true },
    ],
  },
];

export function listIssueTemplates(): IssueTemplate[] {
  return [...store];
}

export function getIssueTemplate(id: string): IssueTemplate | null {
  return store.find((t) => t.id === id) || null;
}

export function createIssueTemplate(
  name: string,
  description: string,
  titleTemplate: string,
  bodyTemplate: string,
  defaultPriority = "medium",
  defaultLabels: string[] = [],
  fields: IssueTemplate["fields"] = []
): IssueTemplate {
  const template: IssueTemplate = {
    id: `tmpl-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    description,
    title_template: titleTemplate,
    body_template: bodyTemplate,
    default_priority: defaultPriority,
    default_labels: defaultLabels,
    fields,
  };
  store.push(template);
  return template;
}

export function updateIssueTemplate(id: string, updates: Partial<Pick<IssueTemplate, "name" | "description" | "title_template" | "body_template" | "default_priority" | "default_labels">>): IssueTemplate | null {
  const t = store.find((tpl) => tpl.id === id);
  if (!t) return null;
  if (updates.name !== undefined) t.name = updates.name;
  if (updates.description !== undefined) t.description = updates.description;
  if (updates.title_template !== undefined) t.title_template = updates.title_template;
  if (updates.body_template !== undefined) t.body_template = updates.body_template;
  if (updates.default_priority !== undefined) t.default_priority = updates.default_priority;
  if (updates.default_labels !== undefined) t.default_labels = updates.default_labels;
  return t;
}

export function deleteIssueTemplate(id: string): boolean {
  const idx = store.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}
