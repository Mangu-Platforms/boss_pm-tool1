import { describe, it, expect } from "vitest";
import { createProduct, listProducts, getProduct } from "../lib/store";

describe("product creation", () => {
  it("creates a product with valid input", () => {
    const product = createProduct({
      name: "Test Product",
      slug: "test-product-" + Date.now(),
      engine_tag: "lab",
      github_repo: "test-repo",
    });
    expect(product.id).toBeDefined();
    expect(product.name).toBe("Test Product");
    expect(product.engine_tag).toBe("lab");
    expect(product.github_owner).toBe("Mangu-Platforms");
  });

  it("throws on missing name", () => {
    expect(() =>
      createProduct({ name: "", slug: "empty-name", engine_tag: "lab" })
    ).toThrow("name required");
  });

  it("throws on missing slug", () => {
    expect(() =>
      createProduct({ name: "Good Name", slug: "", engine_tag: "cash-engine" })
    ).toThrow("slug required");
  });

  it("throws on duplicate slug", () => {
    const slug = "dup-slug-" + Date.now();
    createProduct({ name: "First", slug, engine_tag: "lab" });
    expect(() =>
      createProduct({ name: "Second", slug, engine_tag: "lab" })
    ).toThrow("slug already exists");
  });

  it("product is findable after creation", () => {
    const slug = "findable-" + Date.now();
    const product = createProduct({ name: "Findable", slug, engine_tag: "cash-engine" });
    expect(getProduct(slug)).toBeDefined();
    expect(getProduct(product.id)).toBeDefined();
    expect(listProducts().some((p) => p.id === product.id)).toBe(true);
  });
});
