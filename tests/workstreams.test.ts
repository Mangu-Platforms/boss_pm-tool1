import { describe, it, expect } from "vitest";
import { listWorkstreams, getWorkstream, createWorkstream, updateWorkstream, addIssueToWorkstream, removeIssueFromWorkstream, deleteWorkstream, workstreamStats } from "../lib/workstreams";

describe("workstreams", () => {
  it("lists all workstreams sorted by name", () => {
    const all = listWorkstreams();
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].name.localeCompare(all[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it("filters by status", () => {
    const active = listWorkstreams("active");
    expect(active.every((w) => w.status === "active")).toBe(true);
  });

  it("gets by id", () => {
    const ws = getWorkstream("ws-1");
    expect(ws).not.toBeNull();
    expect(ws!.name).toBe("Auth Overhaul");
  });

  it("creates workstream", () => {
    const ws = createWorkstream("New Stream", "desc", "high", "max", "boss-pm", "2025-09-01");
    expect(ws.status).toBe("active");
    expect(ws.progress).toBe(0);
  });

  it("updates workstream", () => {
    const ws = updateWorkstream("ws-2", { progress: 80 });
    expect(ws).not.toBeNull();
    expect(ws!.progress).toBe(80);
  });

  it("adds and removes issues", () => {
    const ws = addIssueToWorkstream("ws-3", "test-issue-1");
    expect(ws).not.toBeNull();
    expect(ws!.issue_ids).toContain("test-issue-1");
    const ws2 = removeIssueFromWorkstream("ws-3", "test-issue-1");
    expect(ws2!.issue_ids).not.toContain("test-issue-1");
  });

  it("deletes workstream", () => {
    const ws = createWorkstream("ToDelete", "d", "low", "max", "boss-pm", "2025-09-01");
    expect(deleteWorkstream(ws.id)).toBe(true);
    expect(getWorkstream(ws.id)).toBeNull();
  });

  it("returns stats", () => {
    const stats = workstreamStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.avg_progress).toBe("number");
  });
});
