import { describe, it, expect } from "vitest";
import { addDependency, removeDependency, getDependencies, getBlockers, getBlocking, isBlocked, getDependencyGraph, detectCycle } from "@/lib/dependencies";

describe("dependencies", () => {
  it("adds a dependency", () => {
    const dep = addDependency("iss-a", "iss-b", "blocks");
    expect(dep.source_id).toBe("iss-a");
    expect(dep.target_id).toBe("iss-b");
  });

  it("prevents duplicate dependencies", () => {
    const dep1 = addDependency("iss-dup1", "iss-dup2", "blocks");
    const dep2 = addDependency("iss-dup1", "iss-dup2", "blocks");
    expect(dep1.id).toBe(dep2.id);
  });

  it("gets dependencies for an issue", () => {
    addDependency("iss-c", "iss-d", "relates_to");
    const deps = getDependencies("iss-c");
    expect(deps.length).toBeGreaterThan(0);
  });

  it("tracks blockers", () => {
    addDependency("blocker-1", "blocked-1", "blocks");
    expect(getBlockers("blocked-1")).toContain("blocker-1");
    expect(isBlocked("blocked-1")).toBe(true);
  });

  it("tracks what an issue blocks", () => {
    addDependency("src-1", "tgt-1", "blocks");
    expect(getBlocking("src-1")).toContain("tgt-1");
  });

  it("removes a dependency", () => {
    const dep = addDependency("rem-1", "rem-2", "relates_to");
    expect(removeDependency(dep.id)).toBe(true);
    expect(getDependencies("rem-1").length).toBe(0);
  });

  it("detects cycles", () => {
    addDependency("cyc-a", "cyc-b", "blocks");
    addDependency("cyc-b", "cyc-c", "blocks");
    expect(detectCycle("cyc-c", "cyc-a")).toBe(true);
    expect(detectCycle("cyc-a", "cyc-c")).toBe(false);
  });

  it("builds dependency graph", () => {
    const graph = getDependencyGraph();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });
});
