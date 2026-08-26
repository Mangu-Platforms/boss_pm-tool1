export type WikiPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  parent_id: string | null;
  author: string;
  updated_at: string;
  created_at: string;
};

const store: WikiPage[] = [
  {
    id: "wiki-getting-started",
    title: "Getting Started",
    slug: "getting-started",
    content: "Welcome to Boss PM! This guide covers the basics of setting up your workspace, creating products, and managing issues.\n\n## Quick Start\n1. Create a product from the Portfolio page\n2. Add issues with priorities and assignments\n3. Organize into sprints and milestones\n4. Track progress on the Dashboard",
    parent_id: null,
    author: "Max",
    updated_at: "2025-02-01T00:00:00.000Z",
    created_at: "2025-01-10T00:00:00.000Z",
  },
  {
    id: "wiki-architecture",
    title: "Architecture Overview",
    slug: "architecture",
    content: "Boss PM uses Next.js 15 with App Router.\n\n## Stack\n- **Frontend**: React 19, Tailwind CSS\n- **API**: Next.js API routes\n- **Data**: In-memory stores (lib/ modules)\n- **Testing**: Vitest\n\n## Key Directories\n- `app/` - Pages and API routes\n- `lib/` - Business logic and data modules\n- `components/` - Shared React components\n- `tests/` - Vitest test files",
    parent_id: null,
    author: "Max",
    updated_at: "2025-02-05T00:00:00.000Z",
    created_at: "2025-01-12T00:00:00.000Z",
  },
  {
    id: "wiki-workflows",
    title: "Workflow Guide",
    slug: "workflows",
    content: "## Issue Workflow\nbacklog -> open -> doing -> done\n\n## Sprint Planning\n1. Create sprint with dates\n2. Add issues to sprint\n3. Track progress on burndown chart\n4. Review in retrospective",
    parent_id: "wiki-getting-started",
    author: "Alice",
    updated_at: "2025-02-10T00:00:00.000Z",
    created_at: "2025-02-08T00:00:00.000Z",
  },
];

export function listWikiPages(): WikiPage[] {
  return [...store].sort((a, b) => a.title.localeCompare(b.title));
}

export function getWikiPage(id: string): WikiPage | null {
  return store.find((p) => p.id === id) || null;
}

export function getWikiPageBySlug(slug: string): WikiPage | null {
  return store.find((p) => p.slug === slug) || null;
}

export function createWikiPage(title: string, content: string, author = "operator", parentId: string | null = null): WikiPage {
  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const now = new Date().toISOString();
  const page: WikiPage = {
    id: `wiki-${crypto.randomUUID().slice(0, 8)}`,
    title: title.trim(),
    slug,
    content,
    parent_id: parentId,
    author,
    updated_at: now,
    created_at: now,
  };
  store.push(page);
  return page;
}

export function updateWikiPage(id: string, updates: Partial<Pick<WikiPage, "title" | "content" | "parent_id">>): WikiPage | null {
  const page = store.find((p) => p.id === id);
  if (!page) return null;
  if (updates.title !== undefined) {
    page.title = updates.title;
    page.slug = updates.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  if (updates.content !== undefined) page.content = updates.content;
  if (updates.parent_id !== undefined) page.parent_id = updates.parent_id;
  page.updated_at = new Date().toISOString();
  return page;
}

export function deleteWikiPage(id: string): boolean {
  const idx = store.findIndex((p) => p.id === id);
  if (idx < 0) return false;
  store.forEach((p) => { if (p.parent_id === id) p.parent_id = null; });
  store.splice(idx, 1);
  return true;
}

export function getChildPages(parentId: string): WikiPage[] {
  return store.filter((p) => p.parent_id === parentId);
}

export function searchWiki(query: string): WikiPage[] {
  const q = query.toLowerCase();
  return store.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
}
