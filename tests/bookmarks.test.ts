import { describe, it, expect } from "vitest";
import { listBookmarks, createBookmark, deleteBookmark, isBookmarked } from "@/lib/bookmarks";

describe("bookmarks", () => {
  it("lists default bookmarks", () => {
    const bms = listBookmarks();
    expect(bms.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by user", () => {
    const bms = listBookmarks("Max");
    for (const bm of bms) {
      expect(bm.user).toBe("Max");
    }
  });

  it("creates a bookmark", () => {
    const bm = createBookmark("Eve", "issue", "BOSS-5", "Test issue");
    expect(bm.entity_type).toBe("issue");
  });

  it("prevents duplicate bookmarks", () => {
    const bm1 = createBookmark("Dup", "wiki", "wiki-1", "Page 1");
    const bm2 = createBookmark("Dup", "wiki", "wiki-1", "Page 1");
    expect(bm1.id).toBe(bm2.id);
  });

  it("deletes a bookmark", () => {
    const bm = createBookmark("Del", "risk", "risk-1", "Test risk");
    expect(deleteBookmark(bm.id)).toBe(true);
  });

  it("checks if bookmarked", () => {
    createBookmark("Check", "goal", "goal-1", "Test goal");
    expect(isBookmarked("Check", "goal-1")).toBe(true);
    expect(isBookmarked("Check", "nonexistent")).toBe(false);
  });
});
