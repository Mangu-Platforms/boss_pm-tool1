import { describe, it, expect } from "vitest";
import { listPostMortems, getPostMortem, createPostMortem, updatePostMortem, addActionItem, updateActionItem, deletePostMortem, postMortemStats } from "../lib/post-mortems";

describe("post-mortems", () => {
  it("lists post-mortems newest first", () => {
    const all = listPostMortems();
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].created_at >= all[i].created_at).toBe(true);
    }
  });

  it("filters by status", () => {
    const published = listPostMortems("published");
    expect(published.every((p) => p.status === "published")).toBe(true);
  });

  it("filters by severity", () => {
    const critical = listPostMortems(undefined, "critical");
    expect(critical.every((p) => p.severity === "critical")).toBe(true);
  });

  it("gets by id", () => {
    const pm = getPostMortem("pm-1");
    expect(pm).not.toBeNull();
    expect(pm!.title).toBe("Auth service outage");
  });

  it("creates post-mortem", () => {
    const pm = createPostMortem("Test outage", "Summary", "major", "Bad deploy", "10:00-11:00", "max");
    expect(pm.status).toBe("draft");
    expect(pm.action_items).toHaveLength(0);
  });

  it("updates with publish timestamp", () => {
    const pm = createPostMortem("Publish test", "Summary", "minor", "Root cause", "Timeline", "sami");
    const updated = updatePostMortem(pm.id, { status: "published" });
    expect(updated).not.toBeNull();
    expect(updated!.published_at).not.toBeNull();
  });

  it("adds and updates action items", () => {
    const pm = createPostMortem("Action test", "Summary", "minor", "RC", "TL", "max");
    const item = addActionItem(pm.id, "Fix the thing", "alex", "2025-03-01");
    expect(item).not.toBeNull();
    expect(item!.status).toBe("open");
    const updated = updateActionItem(pm.id, item!.id, { status: "done" });
    expect(updated!.status).toBe("done");
  });

  it("deletes post-mortem", () => {
    const pm = createPostMortem("To delete", "Summary", "minor", "RC", "TL", "max");
    expect(deletePostMortem(pm.id)).toBe(true);
    expect(getPostMortem(pm.id)).toBeNull();
  });

  it("returns stats", () => {
    const stats = postMortemStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.open_actions).toBe("number");
    expect(typeof stats.published).toBe("number");
  });
});
