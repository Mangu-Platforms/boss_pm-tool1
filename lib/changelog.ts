export type ChangelogEntry = {
  id: string;
  version: string;
  title: string;
  body: string;
  category: "feature" | "fix" | "improvement" | "breaking" | "other";
  published: boolean;
  published_at: string | null;
  created_at: string;
};

const store: ChangelogEntry[] = [
  {
    id: "cl-1",
    version: "0.1.0",
    title: "Initial Release",
    body: "- Portfolio view with engine tagging\n- Issue management with CRUD\n- Agent assignment with cost caps\n- Kanban board\n- GitHub sync",
    category: "feature",
    published: true,
    published_at: "2025-01-15T00:00:00.000Z",
    created_at: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "cl-2",
    version: "0.2.0",
    title: "Sprint & Team Management",
    body: "- Sprint planning with velocity tracking\n- Team members with capacity\n- Burndown charts\n- Milestones with progress\n- Activity feed",
    category: "feature",
    published: true,
    published_at: "2025-02-01T00:00:00.000Z",
    created_at: "2025-02-01T00:00:00.000Z",
  },
  {
    id: "cl-3",
    version: "0.3.0",
    title: "Automations & Integrations",
    body: "- Rule-based automations engine\n- Integration management\n- Webhook configurations\n- SLA policies\n- Custom fields\n- Markdown rendering",
    category: "feature",
    published: true,
    published_at: "2025-03-01T00:00:00.000Z",
    created_at: "2025-03-01T00:00:00.000Z",
  },
];

export function listChangelog(): ChangelogEntry[] {
  return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getChangelogEntry(id: string): ChangelogEntry | null {
  return store.find((e) => e.id === id) || null;
}

export function createChangelogEntry(
  version: string,
  title: string,
  body: string,
  category: ChangelogEntry["category"] = "feature"
): ChangelogEntry {
  const entry: ChangelogEntry = {
    id: `cl-${crypto.randomUUID().slice(0, 8)}`,
    version,
    title: title.trim(),
    body,
    category,
    published: false,
    published_at: null,
    created_at: new Date().toISOString(),
  };
  store.push(entry);
  return entry;
}

export function publishChangelogEntry(id: string): ChangelogEntry | null {
  const entry = store.find((e) => e.id === id);
  if (!entry) return null;
  entry.published = true;
  entry.published_at = new Date().toISOString();
  return entry;
}

export function deleteChangelogEntry(id: string): boolean {
  const idx = store.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}
