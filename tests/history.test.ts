import { describe, it, expect } from "vitest";
import { recordChange, issueHistory, allHistory } from "@/lib/history";

describe("history", () => {
  const issueId = "hist-test-" + Math.random().toString(36).slice(2);

  it("records a change", () => {
    const entry = recordChange(issueId, "status", "open", "doing");
    expect(entry.field).toBe("status");
    expect(entry.old_value).toBe("open");
    expect(entry.new_value).toBe("doing");
    expect(entry.issue_id).toBe(issueId);
  });

  it("records multiple changes", () => {
    recordChange(issueId, "priority", "medium", "high");
    recordChange(issueId, "title", "Old title", "New title");
    const hist = issueHistory(issueId);
    expect(hist.length).toBe(3);
  });

  it("returns history newest first", () => {
    const hist = issueHistory(issueId);
    for (let i = 0; i < hist.length - 1; i++) {
      expect(hist[i].changed_at >= hist[i + 1].changed_at).toBe(true);
    }
  });

  it("lists all history", () => {
    recordChange("other-issue", "status", "backlog", "open");
    const all = allHistory();
    expect(all.length).toBeGreaterThanOrEqual(4);
  });
});
