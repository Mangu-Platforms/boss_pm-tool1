export type ArticleStatus = "draft" | "published" | "archived";
export type ArticleCategory = "guide" | "faq" | "troubleshooting" | "reference" | "tutorial";

export type KBArticle = {
  id: string;
  title: string;
  content: string;
  category: ArticleCategory;
  status: ArticleStatus;
  author: string;
  tags: string[];
  views: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
};

const articles: KBArticle[] = [
  { id: "kb-1", title: "Getting Started with Boss PM", content: "Welcome to Boss PM. This guide covers the basics of setting up your first project...", category: "guide", status: "published", author: "max", tags: ["onboarding", "basics"], views: 1520, helpful_count: 89, created_at: "2025-01-15T00:00:00Z", updated_at: "2025-08-01T00:00:00Z" },
  { id: "kb-2", title: "How to Create Custom Workflows", content: "Custom workflows allow you to define automated pipelines...", category: "tutorial", status: "published", author: "sami", tags: ["workflows", "automation"], views: 830, helpful_count: 45, created_at: "2025-03-10T00:00:00Z", updated_at: "2025-07-20T00:00:00Z" },
  { id: "kb-3", title: "Troubleshooting CI Failures", content: "Common CI failure patterns and their solutions...", category: "troubleshooting", status: "published", author: "priya", tags: ["ci", "debugging"], views: 2100, helpful_count: 156, created_at: "2025-04-05T00:00:00Z", updated_at: "2025-08-15T00:00:00Z" },
  { id: "kb-4", title: "API Rate Limits FAQ", content: "Frequently asked questions about API rate limiting...", category: "faq", status: "published", author: "carlos", tags: ["api", "limits"], views: 450, helpful_count: 23, created_at: "2025-06-01T00:00:00Z", updated_at: "2025-06-01T00:00:00Z" },
  { id: "kb-5", title: "Agent Configuration Reference", content: "Complete reference for configuring AI agents in Boss PM...", category: "reference", status: "draft", author: "max", tags: ["agents", "config"], views: 0, helpful_count: 0, created_at: "2025-08-20T00:00:00Z", updated_at: "2025-08-20T00:00:00Z" },
];

let nextId = 6;

export function listArticles(category?: ArticleCategory, status?: ArticleStatus): KBArticle[] {
  let result = [...articles];
  if (category) result = result.filter((a) => a.category === category);
  if (status) result = result.filter((a) => a.status === status);
  return result.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getArticle(id: string): KBArticle | null {
  return articles.find((a) => a.id === id) || null;
}

export function createArticle(title: string, content: string, category: ArticleCategory, author: string, tags: string[]): KBArticle {
  const now = new Date().toISOString();
  const article: KBArticle = {
    id: `kb-${nextId++}`,
    title,
    content,
    category,
    status: "draft",
    author,
    tags,
    views: 0,
    helpful_count: 0,
    created_at: now,
    updated_at: now,
  };
  articles.push(article);
  return article;
}

export function updateArticle(id: string, updates: Partial<Pick<KBArticle, "title" | "content" | "status" | "category" | "tags">>): KBArticle | null {
  const article = articles.find((a) => a.id === id);
  if (!article) return null;
  Object.assign(article, updates, { updated_at: new Date().toISOString() });
  return article;
}

export function recordView(id: string): KBArticle | null {
  const article = articles.find((a) => a.id === id);
  if (!article) return null;
  article.views++;
  return article;
}

export function markHelpful(id: string): KBArticle | null {
  const article = articles.find((a) => a.id === id);
  if (!article) return null;
  article.helpful_count++;
  return article;
}

export function deleteArticle(id: string): boolean {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  articles.splice(idx, 1);
  return true;
}

export function searchArticles(query: string): KBArticle[] {
  const q = query.toLowerCase();
  return articles.filter((a) => a.status === "published" && (a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))));
}

export function popularArticles(limit: number = 5): KBArticle[] {
  return [...articles].filter((a) => a.status === "published").sort((a, b) => b.views - a.views).slice(0, limit);
}
