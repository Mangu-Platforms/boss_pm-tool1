import { describe, it, expect } from "vitest";
import { bulkUpdateStatus, bulkUpdatePriority, bulkAssign, bulkHistory, getBulkOperation } from "@/lib/bulk-ops";
import { listIssues } from "@/lib/store";

describe("bulk-ops", () => {
  it("bulk updates status", () => {
    const issues = listIssues().slice(0, 2);
    const ids = issues.map((i) => i.id);
    const op = bulkUpdateStatus(ids, "done");
    expect(op.results.length).toBe(2);
    expect(op.results.every((r) => r.success)).toBe(true);
  });

  it("handles missing issues", () => {
    const op = bulkUpdateStatus(["nonexistent-id"], "open");
    expect(op.results[0].success).toBe(false);
    expect(op.results[0].error).toBe("Not found");
  });

  it("bulk updates priority", () => {
    const issues = listIssues().slice(0, 2);
    const ids = issues.map((i) => i.id);
    const op = bulkUpdatePriority(ids, "high");
    expect(op.results.every((r) => r.success)).toBe(true);
  });

  it("bulk assigns", () => {
    const issues = listIssues().slice(0, 2);
    const ids = issues.map((i) => i.id);
    const op = bulkAssign(ids, "bob");
    expect(op.results.every((r) => r.success)).toBe(true);
  });

  it("tracks history", () => {
    const hist = bulkHistory();
    expect(hist.length).toBeGreaterThanOrEqual(1);
  });

  it("gets operation by id", () => {
    const hist = bulkHistory();
    const op = getBulkOperation(hist[0].id);
    expect(op).not.toBeNull();
  });
});
