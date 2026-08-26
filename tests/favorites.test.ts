import { describe, it, expect } from "vitest";
import { listFavorites, addFavorite, removeFavorite, isFavorite, getFavorite, favoritesCount } from "@/lib/favorites";

describe("favorites", () => {
  it("starts empty for a user", () => {
    expect(listFavorites("test-user")).toEqual([]);
  });

  it("adds a favorite", () => {
    const fav = addFavorite("fav-user", "issue", "iss-1", "Bug fix");
    expect(fav.item_type).toBe("issue");
    expect(fav.item_title).toBe("Bug fix");
  });

  it("prevents duplicate favorites", () => {
    addFavorite("fav-user2", "product", "prod-1", "Main App");
    addFavorite("fav-user2", "product", "prod-1", "Main App");
    const favs = listFavorites("fav-user2");
    expect(favs.filter((f) => f.item_id === "prod-1").length).toBe(1);
  });

  it("checks isFavorite", () => {
    addFavorite("fav-user3", "milestone", "ms-1", "v1.0");
    expect(isFavorite("fav-user3", "ms-1")).toBe(true);
    expect(isFavorite("fav-user3", "ms-999")).toBe(false);
  });

  it("removes a favorite", () => {
    addFavorite("fav-user4", "sprint", "sp-1", "Sprint 1");
    expect(removeFavorite("fav-user4", "sp-1")).toBe(true);
    expect(isFavorite("fav-user4", "sp-1")).toBe(false);
  });

  it("returns false removing nonexistent", () => {
    expect(removeFavorite("fav-user5", "nope")).toBe(false);
  });

  it("lists sorted newest first", () => {
    addFavorite("fav-user6", "issue", "a1", "First");
    addFavorite("fav-user6", "issue", "a2", "Second");
    const favs = listFavorites("fav-user6");
    expect(favs[0].item_id).toBe("a2");
  });

  it("gets favorite by id", () => {
    const fav = getFavorite("fav-1");
    expect(fav).not.toBeNull();
    expect(fav!.user_id).toBe("max");
  });

  it("counts favorites for user", () => {
    const count = favoritesCount("max");
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
