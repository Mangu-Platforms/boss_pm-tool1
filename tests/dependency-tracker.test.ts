import { describe, it, expect } from "vitest";
import { listDependencies, getDependency, createDependency, updateDependency, deleteDependency, depStats } from "../lib/dependency-tracker";

describe("dependency-tracker", () => {
  it("lists sorted by status priority", () => {
    const all = listDependencies();
    expect(all.length).toBeGreaterThanOrEqual(12);
    const statusOrder: Record<string, number> = { vulnerable: 0, deprecated: 1, outdated: 2, current: 3 };
    for (let i = 1; i < all.length; i++) {
      expect((statusOrder[all[i - 1].status] ?? 4) <= (statusOrder[all[i].status] ?? 4)).toBe(true);
    }
  });

  it("filters by service", () => {
    const svc1 = listDependencies("svc-1");
    expect(svc1.every((d) => d.service_id === "svc-1")).toBe(true);
  });

  it("filters by type", () => {
    const npm = listDependencies(undefined, "npm");
    expect(npm.every((d) => d.type === "npm")).toBe(true);
  });

  it("gets by id", () => {
    const d = getDependency("dep-1");
    expect(d).not.toBeNull();
    expect(d!.name).toBe("next");
  });

  it("creates dependency", () => {
    const d = createDependency("svc-test", "jest", "29.0.0", "29.7.0", "npm", "MIT", true);
    expect(d.status).toBe("outdated");
  });

  it("creates current dependency", () => {
    const d = createDependency("svc-test", "vitest", "4.1.0", "4.1.0", "npm", "MIT", true);
    expect(d.status).toBe("current");
  });

  it("updates dependency", () => {
    const d = createDependency("svc-test", "chalk", "4.0.0", "5.0.0", "npm", "MIT", true);
    const updated = updateDependency(d.id, { current_version: "5.0.0", status: "current" });
    expect(updated).not.toBeNull();
    expect(updated!.current_version).toBe("5.0.0");
  });

  it("returns stats", () => {
    const s = depStats();
    expect(s.total).toBeGreaterThan(0);
    expect(typeof s.direct).toBe("number");
    expect(typeof s.by_status).toBe("object");
  });
});
