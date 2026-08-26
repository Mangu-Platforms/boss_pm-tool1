export type ProjectTemplateIssue = {
  title: string;
  body: string;
  priority: "critical" | "high" | "medium" | "low";
  labels: string[];
};

export type ProjectTemplateCategory = "development" | "marketing" | "support" | "operations" | "general";

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  category: ProjectTemplateCategory;
  issues: ProjectTemplateIssue[];
  default_milestones: { name: string; offset_days: number }[];
  default_labels: string[];
  created_at: string;
};

const store: ProjectTemplate[] = [
  {
    id: "tpl-mvp",
    name: "MVP Launch",
    description: "Standard issues for launching an MVP product",
    category: "development",
    default_milestones: [{ name: "Alpha", offset_days: 30 }, { name: "Beta", offset_days: 60 }, { name: "GA", offset_days: 90 }],
    default_labels: ["launch", "product", "release"],
    issues: [
      { title: "Set up CI/CD pipeline", body: "Configure automated builds and deployments", priority: "high", labels: ["infra"] },
      { title: "User authentication", body: "Implement login/signup/password reset flows", priority: "critical", labels: ["feature"] },
      { title: "Landing page", body: "Design and build the public landing page", priority: "high", labels: ["ux"] },
      { title: "Database schema design", body: "Define core data models and relationships", priority: "high", labels: ["infra"] },
      { title: "Error monitoring setup", body: "Configure error tracking and alerting", priority: "medium", labels: ["infra"] },
      { title: "API documentation", body: "Write OpenAPI spec for public endpoints", priority: "medium", labels: ["docs"] },
    ],
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "tpl-bug-bash",
    name: "Bug Bash",
    description: "Template for organizing a bug bash session",
    category: "support",
    default_milestones: [{ name: "Triage Complete", offset_days: 7 }],
    default_labels: ["bug", "triage"],
    issues: [
      { title: "Create test plan", body: "Define areas to test and edge cases", priority: "high", labels: ["docs"] },
      { title: "Set up bug triage process", body: "Define severity levels and assignment rules", priority: "medium", labels: ["infra"] },
      { title: "Schedule bug bash session", body: "Coordinate with team on timing", priority: "low", labels: [] },
      { title: "Prepare test data", body: "Seed staging with realistic data", priority: "medium", labels: ["infra"] },
    ],
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "tpl-sprint",
    name: "Sprint Ceremonies",
    description: "Standard sprint ceremony tasks",
    category: "development",
    default_milestones: [{ name: "Sprint End", offset_days: 14 }],
    default_labels: ["sprint"],
    issues: [
      { title: "Sprint planning", body: "Review backlog and commit to sprint goals", priority: "high", labels: [] },
      { title: "Daily standup notes", body: "Track blockers and progress", priority: "low", labels: [] },
      { title: "Sprint review/demo", body: "Demonstrate completed work to stakeholders", priority: "medium", labels: [] },
      { title: "Sprint retrospective", body: "Discuss what went well and improvements", priority: "medium", labels: [] },
    ],
    created_at: "2025-01-01T00:00:00Z",
  },
];

export function listProjectTemplates(category?: string): ProjectTemplate[] {
  if (category) return store.filter((t) => t.category === category);
  return [...store];
}

export function getProjectTemplate(id: string): ProjectTemplate | null {
  return store.find((t) => t.id === id) || null;
}

export function createProjectTemplate(name: string, description: string, issues: ProjectTemplateIssue[], category: ProjectTemplateCategory = "general"): ProjectTemplate {
  const tpl: ProjectTemplate = {
    id: crypto.randomUUID(),
    name,
    description,
    category,
    issues,
    default_milestones: [],
    default_labels: [],
    created_at: new Date().toISOString(),
  };
  store.push(tpl);
  return tpl;
}

export function deleteProjectTemplate(id: string): boolean {
  const idx = store.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}
