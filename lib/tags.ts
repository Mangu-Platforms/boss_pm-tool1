export type Tag = {
  id: string;
  name: string;
  color: string;
  description: string;
};

export type IssueTag = {
  issue_id: string;
  tag_id: string;
};

const tags: Tag[] = [
  { id: "tag-bug", name: "bug", color: "#ff7a6e", description: "Something is broken" },
  { id: "tag-feature", name: "feature", color: "#7cffb2", description: "New functionality" },
  { id: "tag-improvement", name: "improvement", color: "#c9b7ff", description: "Enhancement to existing feature" },
  { id: "tag-docs", name: "docs", color: "#e2b657", description: "Documentation" },
  { id: "tag-design", name: "design", color: "#ff9edc", description: "Design work" },
  { id: "tag-infra", name: "infra", color: "#6ec8ff", description: "Infrastructure and DevOps" },
];

const issueTags: IssueTag[] = [];

export function listTags(): Tag[] {
  return [...tags];
}

export function getTag(id: string): Tag | null {
  return tags.find((t) => t.id === id) || null;
}

export function createTag(name: string, color: string, description = ""): Tag {
  if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Tag name already exists");
  }
  const tag: Tag = {
    id: `tag-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    color,
    description,
  };
  tags.push(tag);
  return tag;
}

export function updateTag(id: string, updates: Partial<Pick<Tag, "name" | "color" | "description">>): Tag | null {
  const t = tags.find((tag) => tag.id === id);
  if (!t) return null;
  if (updates.name !== undefined) t.name = updates.name.trim();
  if (updates.color !== undefined) t.color = updates.color;
  if (updates.description !== undefined) t.description = updates.description;
  return t;
}

export function deleteTag(id: string): boolean {
  const idx = tags.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  tags.splice(idx, 1);
  const toRemove = issueTags.filter((it) => it.tag_id === id);
  for (const it of toRemove) {
    const i = issueTags.indexOf(it);
    if (i >= 0) issueTags.splice(i, 1);
  }
  return true;
}

export function addTagToIssue(issueId: string, tagId: string): boolean {
  if (!tags.some((t) => t.id === tagId)) return false;
  if (issueTags.some((it) => it.issue_id === issueId && it.tag_id === tagId)) return true;
  issueTags.push({ issue_id: issueId, tag_id: tagId });
  return true;
}

export function removeTagFromIssue(issueId: string, tagId: string): boolean {
  const idx = issueTags.findIndex((it) => it.issue_id === issueId && it.tag_id === tagId);
  if (idx < 0) return false;
  issueTags.splice(idx, 1);
  return true;
}

export function tagsForIssue(issueId: string): Tag[] {
  const tagIds = issueTags.filter((it) => it.issue_id === issueId).map((it) => it.tag_id);
  return tags.filter((t) => tagIds.includes(t.id));
}

export function issuesForTag(tagId: string): string[] {
  return issueTags.filter((it) => it.tag_id === tagId).map((it) => it.issue_id);
}
