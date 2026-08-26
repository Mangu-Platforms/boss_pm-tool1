import { describe, it, expect } from "vitest";
import { addComment, listComments, deleteComment } from "../lib/comments";

describe("comments", () => {
  const issueId = "test-issue-" + Date.now();

  it("adds a comment", () => {
    const comment = addComment(issueId, "This is a note");
    expect(comment.id).toBeDefined();
    expect(comment.body).toBe("This is a note");
    expect(comment.author).toBe("operator");
    expect(comment.issue_id).toBe(issueId);
  });

  it("lists comments for an issue", () => {
    const comments = listComments(issueId);
    expect(comments.length).toBeGreaterThanOrEqual(1);
    expect(comments[0].issue_id).toBe(issueId);
  });

  it("adds with custom author", () => {
    const comment = addComment(issueId, "Agent note", "alice");
    expect(comment.author).toBe("alice");
  });

  it("rejects empty body", () => {
    expect(() => addComment(issueId, "")).toThrow("body required");
    expect(() => addComment(issueId, "   ")).toThrow("body required");
  });

  it("deletes a comment", () => {
    const comment = addComment(issueId, "to delete");
    expect(deleteComment(comment.id)).toBe(true);
    expect(deleteComment(comment.id)).toBe(false);
  });

  it("orders chronologically", () => {
    const id = "order-test-" + Date.now();
    addComment(id, "first");
    addComment(id, "second");
    const comments = listComments(id);
    expect(comments[0].body).toBe("first");
    expect(comments[1].body).toBe("second");
  });
});
