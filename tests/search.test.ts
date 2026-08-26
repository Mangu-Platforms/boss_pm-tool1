import { describe, it, expect, beforeEach } from "vitest";
import { search } from "../lib/search";

beforeEach(() => {
  const g = globalThis as typeof globalThis & { __boss?: unknown };
  delete g.__boss;
});

describe("Search logic", () => {
  it("finds issues by title substring", async () => {
    const { listIssues } = await import("@/lib/store");
    const issues = listIssues();
    const q = "synopsis";
    const results = issues.filter((i) => i.title.toLowerCase().includes(q));
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toContain("synopsis");
  });

  it("finds products by slug", async () => {
    const { listProducts } = await import("@/lib/store");
    const products = listProducts();
    const q = "hathor";
    const results = products.filter((p) => p.slug.toLowerCase().includes(q));
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe("hathor-red");
  });

  it("returns empty for no match", async () => {
    const { listIssues } = await import("@/lib/store");
    const issues = listIssues();
    const q = "zzzznonexistent";
    const results = issues.filter((i) => i.title.toLowerCase().includes(q));
    expect(results.length).toBe(0);
  });
});

describe("Duplicate detection", () => {
  function similarity(a: string, b: string): number {
    const aWords = new Set(a.toLowerCase().split(/\s+/));
    const bWords = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...aWords].filter((w) => bWords.has(w));
    const union = new Set([...aWords, ...bWords]);
    return intersection.length / union.size;
  }

  it("detects high similarity", () => {
    const score = similarity(
      "Fix checkout empty cart flash",
      "Fix checkout empty cart bug"
    );
    expect(score).toBeGreaterThan(0.5);
  });

  it("detects low similarity", () => {
    const score = similarity(
      "Fix checkout empty-cart flash",
      "Audio waveform rendering in player component"
    );
    expect(score).toBeLessThan(0.2);
  });

  it("perfect match returns 1", () => {
    const score = similarity("hello world", "hello world");
    expect(score).toBe(1);
  });

  it("finds duplicates from seed data", async () => {
    const { listIssues } = await import("@/lib/store");
    const issues = listIssues();
    const title = "Prove GitHub sync on my_publishing";
    const candidates = issues
      .map((i) => ({ issue: i, score: similarity(title, i.title) }))
      .filter((c) => c.score >= 0.3)
      .sort((a, b) => b.score - a.score);
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].issue.title).toContain("GitHub");
  });
});

describe("search module", () => {
  it("returns empty for blank query", () => {
    expect(search("")).toEqual([]);
  });

  it("finds results across types", () => {
    const results = search("boss");
    expect(results.length).toBeGreaterThan(0);
  });

  it("filters by type", () => {
    const results = search("boss", ["product"]);
    expect(results.every((r) => r.type === "product")).toBe(true);
  });

  it("includes match_field and snippet", () => {
    const results = search("boss");
    for (const r of results) {
      expect(r.match_field).toBeDefined();
      expect(r.snippet.length).toBeGreaterThan(0);
    }
  });
});
