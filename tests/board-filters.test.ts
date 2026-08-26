import { describe, it, expect } from "vitest";
import { listFilters, getFilter, createFilter, updateFilter, deleteFilter, sharedFilters } from "../lib/board-filters";

describe("board-filters", () => {
  it("lists all filters", () => {
    const filters = listFilters();
    expect(filters.length).toBeGreaterThanOrEqual(4);
  });

  it("includes shared filters for owner", () => {
    const filters = listFilters("max");
    const shared = filters.filter((f) => f.owner !== "max" && f.is_shared);
    expect(shared.length).toBeGreaterThan(0);
  });

  it("gets filter by id", () => {
    const f = getFilter("filter-1");
    expect(f).not.toBeNull();
    expect(f!.name).toBe("My Open Issues");
  });

  it("creates filter", () => {
    const f = createFilter("Test Filter", "max", [{ field: "status", operator: "eq", value: "open" }]);
    expect(f.name).toBe("Test Filter");
    expect(f.conditions).toHaveLength(1);
  });

  it("updates filter", () => {
    const f = updateFilter("filter-1", { name: "Updated Filter" });
    expect(f).not.toBeNull();
    expect(f!.name).toBe("Updated Filter");
  });

  it("lists shared filters", () => {
    const shared = sharedFilters();
    expect(shared.every((f) => f.is_shared)).toBe(true);
  });

  it("deletes filter", () => {
    const f = createFilter("Del Filter", "max", []);
    expect(deleteFilter(f.id)).toBe(true);
    expect(getFilter(f.id)).toBeNull();
  });
});
