import { describe, it, expect } from "vitest";
import { listFlags, getFlag, getFlagByKey, createFlag, updateFlag, deleteFlag, evaluateFlag } from "../lib/feature-flags";

describe("feature-flags", () => {
  it("lists all flags sorted by key", () => {
    const all = listFlags();
    expect(all.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].key.localeCompare(all[i].key)).toBeLessThanOrEqual(0);
    }
  });

  it("filters by environment", () => {
    const prod = listFlags("production");
    expect(prod.every((f) => f.environments.includes("production"))).toBe(true);
  });

  it("gets by id and key", () => {
    const f = getFlag("ff-1");
    expect(f).not.toBeNull();
    const byKey = getFlagByKey("new_dashboard");
    expect(byKey).not.toBeNull();
    expect(byKey!.id).toBe("ff-1");
  });

  it("creates flag", () => {
    const f = createFlag("test_flag", "Test", "desc", "boolean", "max");
    expect(f.enabled).toBe(false);
    expect(f.environments).toContain("development");
  });

  it("updates flag", () => {
    const f = updateFlag("ff-3", { enabled: true });
    expect(f).not.toBeNull();
    expect(f!.enabled).toBe(true);
  });

  it("evaluates boolean flag", () => {
    expect(evaluateFlag("bulk_import", "anyone")).toBe(true);
  });

  it("evaluates user_list flag", () => {
    expect(evaluateFlag("ai_triage", "max")).toBe(true);
    expect(evaluateFlag("ai_triage", "unknown_user")).toBe(false);
  });

  it("deletes flag", () => {
    const f = createFlag("del_flag", "Del", "d", "boolean", "max");
    expect(deleteFlag(f.id)).toBe(true);
    expect(getFlag(f.id)).toBeNull();
  });
});
