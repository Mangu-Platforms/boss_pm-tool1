import { describe, it, expect } from "vitest";
import { listArticles, getArticle, createArticle, updateArticle, recordView, markHelpful, deleteArticle, searchArticles, popularArticles } from "../lib/knowledge-base";

describe("knowledge-base", () => {
  it("lists articles sorted by updated_at", () => {
    const all = listArticles();
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].updated_at >= all[i].updated_at).toBe(true);
    }
  });

  it("filters by category", () => {
    const guides = listArticles("guide");
    expect(guides.every((a) => a.category === "guide")).toBe(true);
  });

  it("gets by id", () => {
    const a = getArticle("kb-1");
    expect(a).not.toBeNull();
    expect(a!.title).toContain("Getting Started");
  });

  it("creates article as draft", () => {
    const a = createArticle("Test Article", "content", "faq", "max", ["test"]);
    expect(a.status).toBe("draft");
    expect(a.views).toBe(0);
  });

  it("records view", () => {
    const before = getArticle("kb-1")!.views;
    recordView("kb-1");
    expect(getArticle("kb-1")!.views).toBe(before + 1);
  });

  it("marks helpful", () => {
    const before = getArticle("kb-1")!.helpful_count;
    markHelpful("kb-1");
    expect(getArticle("kb-1")!.helpful_count).toBe(before + 1);
  });

  it("searches published articles", () => {
    const results = searchArticles("CI");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((a) => a.status === "published")).toBe(true);
  });

  it("returns popular articles", () => {
    const pop = popularArticles(3);
    expect(pop.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < pop.length; i++) {
      expect(pop[i - 1].views).toBeGreaterThanOrEqual(pop[i].views);
    }
  });

  it("deletes article", () => {
    const a = createArticle("ToDel", "c", "faq", "max", []);
    expect(deleteArticle(a.id)).toBe(true);
    expect(getArticle(a.id)).toBeNull();
  });
});
