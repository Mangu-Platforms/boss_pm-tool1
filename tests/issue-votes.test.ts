import { describe, it, expect } from "vitest";
import { votesForIssue, addVote, removeVote, reactionSummary, topVotedIssues, userVotes } from "../lib/issue-votes";

describe("issue-votes", () => {
  it("lists votes for an issue", () => {
    const votes = votesForIssue("BOSS-1");
    expect(votes.length).toBeGreaterThanOrEqual(3);
  });

  it("adds a vote", () => {
    const v = addVote("BOSS-10", "max", "rocket");
    expect(v.issue_id).toBe("BOSS-10");
    expect(v.reaction).toBe("rocket");
  });

  it("prevents duplicate votes", () => {
    const v1 = addVote("BOSS-10", "max", "rocket");
    const v2 = addVote("BOSS-10", "max", "rocket");
    expect(v1.id).toBe(v2.id);
  });

  it("removes a vote", () => {
    addVote("BOSS-11", "bob", "heart");
    expect(removeVote("BOSS-11", "bob", "heart")).toBe(true);
    expect(removeVote("BOSS-11", "bob", "heart")).toBe(false);
  });

  it("gets reaction summary", () => {
    const summary = reactionSummary("BOSS-1");
    expect(summary.thumbsup).toBeGreaterThanOrEqual(2);
    expect(summary.heart).toBeGreaterThanOrEqual(1);
  });

  it("gets top voted issues", () => {
    const top = topVotedIssues(5);
    expect(top.length).toBeGreaterThan(0);
    expect(top[0].total).toBeGreaterThanOrEqual(top[top.length - 1].total);
  });

  it("lists user votes", () => {
    const votes = userVotes("max");
    expect(votes.length).toBeGreaterThanOrEqual(2);
    expect(votes.every((v) => v.user_id === "max")).toBe(true);
  });
});
