export type Label = {
  id: string;
  name: string;
  color: string;
};

export type IssueLabel = {
  issue_id: string;
  label_id: string;
};

const labels: Label[] = [
  { id: "lbl-bug", name: "bug", color: "#ff7a6e" },
  { id: "lbl-feature", name: "feature", color: "#7cffb2" },
  { id: "lbl-ux", name: "ux", color: "#c9b7ff" },
  { id: "lbl-infra", name: "infra", color: "#e2b657" },
  { id: "lbl-docs", name: "docs", color: "#8a8376" },
  { id: "lbl-perf", name: "perf", color: "#6ec4ff" },
];

const issueLabels: IssueLabel[] = [];

export function listLabels(): Label[] {
  return [...labels];
}

export function createLabel(name: string, color: string): Label {
  const existing = labels.find((l) => l.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const label: Label = { id: crypto.randomUUID(), name, color };
  labels.push(label);
  return label;
}

export function deleteLabel(id: string): boolean {
  const idx = labels.findIndex((l) => l.id === id);
  if (idx < 0) return false;
  labels.splice(idx, 1);
  const toRemove = issueLabels.filter((il) => il.label_id === id);
  for (const il of toRemove) {
    const i = issueLabels.indexOf(il);
    if (i >= 0) issueLabels.splice(i, 1);
  }
  return true;
}

export function addLabelToIssue(issueId: string, labelId: string): boolean {
  if (!labels.find((l) => l.id === labelId)) return false;
  if (issueLabels.find((il) => il.issue_id === issueId && il.label_id === labelId)) return true;
  issueLabels.push({ issue_id: issueId, label_id: labelId });
  return true;
}

export function removeLabelFromIssue(issueId: string, labelId: string): boolean {
  const idx = issueLabels.findIndex((il) => il.issue_id === issueId && il.label_id === labelId);
  if (idx < 0) return false;
  issueLabels.splice(idx, 1);
  return true;
}

export function labelsForIssue(issueId: string): Label[] {
  const labelIds = issueLabels.filter((il) => il.issue_id === issueId).map((il) => il.label_id);
  return labels.filter((l) => labelIds.includes(l.id));
}

export function issuesWithLabel(labelId: string): string[] {
  return issueLabels.filter((il) => il.label_id === labelId).map((il) => il.issue_id);
}
