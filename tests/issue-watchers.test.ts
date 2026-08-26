import { describe, it, expect } from "vitest";
import { listWatchers, watchersForUser, isWatching, watchIssue, unwatchIssue, watcherCount } from "../lib/issue-watchers";

describe("issue-watchers", () => {
  it("lists watchers for an issue", () => {
    const watchers = listWatchers("BOSS-1");
    expect(watchers.length).toBeGreaterThanOrEqual(2);
  });

  it("lists watched issues for a user", () => {
    const watching = watchersForUser("max");
    expect(watching.length).toBeGreaterThanOrEqual(2);
  });

  it("checks if user is watching", () => {
    expect(isWatching("BOSS-1", "max")).toBe(true);
    expect(isWatching("BOSS-1", "nobody")).toBe(false);
  });

  it("watches an issue", () => {
    const w = watchIssue("BOSS-5", "max", "manual");
    expect(w.issue_id).toBe("BOSS-5");
    expect(w.user_id).toBe("max");
  });

  it("prevents duplicate watches", () => {
    const w1 = watchIssue("BOSS-1", "max");
    const w2 = watchIssue("BOSS-1", "max");
    expect(w1.id).toBe(w2.id);
  });

  it("unwatches an issue", () => {
    watchIssue("BOSS-9", "bob", "manual");
    expect(unwatchIssue("BOSS-9", "bob")).toBe(true);
    expect(isWatching("BOSS-9", "bob")).toBe(false);
  });

  it("counts watchers", () => {
    const count = watcherCount("BOSS-1");
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
