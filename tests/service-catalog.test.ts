import { describe, it, expect } from "vitest";
import { listServices, getService, createService, updateService, addDependency, deleteService, dependencyGraph } from "../lib/service-catalog";

describe("service-catalog", () => {
  it("lists all services sorted by name", () => {
    const all = listServices();
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].name.localeCompare(all[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it("filters by tier", () => {
    const t0 = listServices("tier-0");
    expect(t0.every((s) => s.tier === "tier-0")).toBe(true);
    expect(t0.length).toBeGreaterThanOrEqual(2);
  });

  it("gets by id", () => {
    const svc = getService("svc-1");
    expect(svc).not.toBeNull();
    expect(svc!.name).toBe("API Gateway");
  });

  it("creates service", () => {
    const svc = createService("Test SVC", "desc", "tier-2", "max", "eng", 99.5);
    expect(svc.health).toBe("healthy");
    expect(svc.dependencies).toHaveLength(0);
  });

  it("updates service health", () => {
    const svc = updateService("svc-3", { health: "healthy" });
    expect(svc).not.toBeNull();
    expect(svc!.health).toBe("healthy");
  });

  it("adds dependency", () => {
    const svc = addDependency("svc-4", "svc-2");
    expect(svc).not.toBeNull();
    expect(svc!.dependencies).toContain("svc-2");
  });

  it("returns dependency graph", () => {
    const graph = dependencyGraph();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(Array.isArray(graph.edges)).toBe(true);
  });

  it("deletes service", () => {
    const svc = createService("ToDel", "d", "tier-3", "max", "eng", 99.0);
    expect(deleteService(svc.id)).toBe(true);
    expect(getService(svc.id)).toBeNull();
  });
});
