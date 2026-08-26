import { describe, it, expect } from "vitest";
import { mentionsForIssue, mentionsByUser, addMention, mentionCount, recentMentions, mentionsByContext } from "../lib/issue-mentions";

describe("issue-mentions", () => {
  it("lists mentions for an issue", () => {
    const mentions = mentionsForIssue("BOSS-1");
    expect(mentions.length).toBeGreaterThanOrEqual(3);
  });

  it("returns mentions sorted newest first", () => {
    const mentions = mentionsForIssue("BOSS-1");
    for (let i = 1; i < mentions.length; i++) {
      expect(mentions[i - 1].created_at >= mentions[i].created_at).toBe(true);
    }
  });

  it("lists mentions by user", () => {
    const mentions = mentionsByUser("max");
    expect(mentions.length).toBeGreaterThanOrEqual(2);
    expect(mentions.every((m) => m.mentioned_by === "max")).toBe(true);
  });

  it("adds a mention", () => {
    const m = addMention("BOSS-10", "alice", "wiki", "wiki-5", "See BOSS-10");
    expect(m.issue_id).toBe("BOSS-10");
    expect(m.context).toBe("wiki");
  });

  it("counts mentions", () => {
    const count = mentionCount("BOSS-1");
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it("gets recent mentions", () => {
    const recent = recentMentions(3);
    expect(recent.length).toBeLessThanOrEqual(3);
  });

  it("filters by context", () => {
    const comments = mentionsByContext("comment");
    expect(comments.every((m) => m.context === "comment")).toBe(true);
  });
});
