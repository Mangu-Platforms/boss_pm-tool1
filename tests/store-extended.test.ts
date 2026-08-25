import { describe, it, expect, beforeEach } from "vitest";
import { createIssue, getIssue, updateIssue, deleteIssue, listIssues } from "@/lib/store";

beforeEach(() => {
  const g = globalThis as typeof globalThis & { __boss?: unknown };
  delete g.__boss;
});

describe("getIssue", () => {
  it("returns a seeded issue by id", () => {
    const issue = getIssue("i-1");
    expect(issue).toBeDefined();
    expect(issue!.title).toBe("Ship synopsis-to-manuscript path for title 04");
  });

  it("returns undefined for missing id", () => {
    expect(getIssue("nonexistent")).toBeUndefined();
  });
});

describe("updateIssue", () => {
  it("updates status", () => {
    const issue = createIssue({
      product_id: "p-pub",
      title: "To be updated",
      assignee_kind: "user",
      assignee_user: "operator",
    });
    const updated = updateIssue(issue.id, { status: "doing" });
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("doing");
  });

  it("updates title", () => {
    const issue = createIssue({
      product_id: "p-pub",
      title: "Original title",
      assignee_kind: "user",
      assignee_user: "operator",
    });
    const updated = updateIssue(issue.id, { title: "New title" });
    expect(updated!.title).toBe("New title");
  });

  it("returns null for missing issue", () => {
    expect(updateIssue("nonexistent", { status: "done" })).toBeNull();
  });

  it("updates updated_at timestamp", () => {
    const issue = createIssue({
      product_id: "p-pub",
      title: "Timestamp test",
      assignee_kind: "user",
      assignee_user: "dev",
    });
    const before = issue.updated_at;
    const updated = updateIssue(issue.id, { status: "done" });
    expect(updated!.updated_at >= before).toBe(true);
  });
});

describe("deleteIssue", () => {
  it("deletes an existing issue", () => {
    const issue = createIssue({
      product_id: "p-pub",
      title: "To be deleted",
      assignee_kind: "user",
      assignee_user: "operator",
    });
    expect(deleteIssue(issue.id)).toBe(true);
    expect(getIssue(issue.id)).toBeUndefined();
  });

  it("returns false for missing issue", () => {
    expect(deleteIssue("nonexistent")).toBe(false);
  });

  it("removes from listIssues", () => {
    const before = listIssues().length;
    const issue = createIssue({
      product_id: "p-pub",
      title: "Delete from list",
      assignee_kind: "user",
      assignee_user: "dev",
    });
    expect(listIssues().length).toBe(before + 1);
    deleteIssue(issue.id);
    expect(listIssues().length).toBe(before);
  });
});

describe("edge cases", () => {
  it("handles concurrent creates", () => {
    const issues = Array.from({ length: 10 }, (_, i) =>
      createIssue({
        product_id: "p-pub",
        title: `Concurrent issue ${i}`,
        assignee_kind: "user",
        assignee_user: "operator",
      })
    );
    const ids = new Set(issues.map((i) => i.id));
    expect(ids.size).toBe(10);
  });

  it("trims whitespace from title", () => {
    const issue = createIssue({
      product_id: "p-pub",
      title: "  spaced title  ",
      assignee_kind: "user",
      assignee_user: "operator",
    });
    expect(issue.title).toBe("spaced title");
  });

  it("agent issue stores cap correctly", () => {
    const issue = createIssue({
      product_id: "p-alice",
      title: "Cap test",
      assignee_kind: "agent",
      agent_name: "alice",
      cost_cap_cents: 1299,
    });
    expect(issue.cost_cap_cents).toBe(1299);
    expect(issue.agent_name).toBe("alice");
    expect(issue.assignee_user).toBeNull();
  });

  it("user issue has no agent fields", () => {
    const issue = createIssue({
      product_id: "p-pub",
      title: "User only",
      assignee_kind: "user",
      assignee_user: "max",
    });
    expect(issue.agent_name).toBeNull();
    expect(issue.cost_cap_cents).toBeNull();
    expect(issue.assignee_user).toBe("max");
  });
});
