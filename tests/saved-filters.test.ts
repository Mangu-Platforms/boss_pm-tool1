import { describe, it, expect } from "vitest";
import { listSavedFilters, getSavedFilter, createSavedFilter, updateSavedFilter, deleteSavedFilter } from "@/lib/saved-filters";

describe("saved-filters", () => {
  it("lists seed filters", () => {
    const filters = listSavedFilters();
    expect(filters.length).toBeGreaterThanOrEqual(3);
  });

  it("lists filters visible to owner (own + shared)", () => {
    const filters = listSavedFilters("max");
    expect(filters.length).toBeGreaterThanOrEqual(2);
  });

  it("gets filter by id", () => {
    const sf = getSavedFilter("sf-1");
    expect(sf).not.toBeNull();
    expect(sf!.name).toBe("My Open Issues");
  });

  it("creates a filter", () => {
    const sf = createSavedFilter("Test Filter", "issues", [{ field: "status", operator: "eq", value: "open" }], "max");
    expect(sf.conditions.length).toBe(1);
  });

  it("updates a filter", () => {
    const sf = createSavedFilter("Update Test", "issues", [], "max");
    const updated = updateSavedFilter(sf.id, { name: "Updated", is_shared: true });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("Updated");
    expect(updated!.is_shared).toBe(true);
  });

  it("deletes a filter", () => {
    const sf = createSavedFilter("Del Test", "issues", [], "max");
    expect(deleteSavedFilter(sf.id)).toBe(true);
    expect(deleteSavedFilter(sf.id)).toBe(false);
  });
});
