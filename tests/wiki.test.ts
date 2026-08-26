import { describe, it, expect } from "vitest";
import { listWikiPages, getWikiPage, getWikiPageBySlug, createWikiPage, updateWikiPage, deleteWikiPage, getChildPages, searchWiki } from "@/lib/wiki";

describe("wiki", () => {
  it("lists default pages", () => {
    const pages = listWikiPages();
    expect(pages.length).toBeGreaterThanOrEqual(3);
  });

  it("gets page by id", () => {
    const page = getWikiPage("wiki-getting-started");
    expect(page).toBeTruthy();
    expect(page!.title).toBe("Getting Started");
  });

  it("gets page by slug", () => {
    const page = getWikiPageBySlug("architecture");
    expect(page).toBeTruthy();
    expect(page!.title).toBe("Architecture Overview");
  });

  it("creates a page", () => {
    const page = createWikiPage("API Reference", "Details about our API endpoints", "Alice");
    expect(page.slug).toBe("api-reference");
    expect(page.author).toBe("Alice");
  });

  it("updates a page", () => {
    const page = createWikiPage("Update Test", "original");
    const updated = updateWikiPage(page.id, { content: "updated content" });
    expect(updated!.content).toBe("updated content");
  });

  it("updates slug when title changes", () => {
    const page = createWikiPage("Old Title", "");
    updateWikiPage(page.id, { title: "New Title" });
    expect(getWikiPage(page.id)!.slug).toBe("new-title");
  });

  it("deletes a page and orphans children", () => {
    const parent = createWikiPage("Parent", "");
    const child = createWikiPage("Child", "", "operator", parent.id);
    expect(deleteWikiPage(parent.id)).toBe(true);
    expect(getWikiPage(child.id)!.parent_id).toBeNull();
  });

  it("gets child pages", () => {
    const children = getChildPages("wiki-getting-started");
    expect(children.length).toBeGreaterThanOrEqual(1);
  });

  it("searches wiki content", () => {
    const results = searchWiki("React");
    expect(results.length).toBeGreaterThan(0);
  });
});
