import { describe, it, expect } from "vitest";
import { listFeedback, getFeedback, createFeedback, updateFeedbackStatus, voteFeedback, deleteFeedback, feedbackStats } from "@/lib/feedback";

describe("feedback", () => {
  it("lists default feedback sorted by votes", () => {
    const items = listFeedback();
    expect(items.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].votes).toBeGreaterThanOrEqual(items[i].votes);
    }
  });

  it("filters by status", () => {
    const planned = listFeedback("planned");
    for (const fb of planned) {
      expect(fb.status).toBe("planned");
    }
  });

  it("gets feedback by id", () => {
    const fb = getFeedback("fb-1");
    expect(fb).toBeTruthy();
    expect(fb!.title).toContain("Dark mode");
  });

  it("creates feedback", () => {
    const fb = createFeedback("suggestion", "Add keyboard shortcuts", "Would speed up workflows", "power@user.io", ["ux"]);
    expect(fb.status).toBe("new");
    expect(fb.votes).toBe(0);
    expect(fb.tags).toContain("ux");
  });

  it("updates feedback status", () => {
    const fb = createFeedback("praise", "Great tool", "");
    const updated = updateFeedbackStatus(fb.id, "reviewed");
    expect(updated!.status).toBe("reviewed");
  });

  it("votes on feedback", () => {
    const fb = createFeedback("complaint", "Too slow", "");
    expect(voteFeedback(fb.id)).toBe(true);
    expect(voteFeedback(fb.id)).toBe(true);
    expect(getFeedback(fb.id)!.votes).toBe(2);
  });

  it("deletes feedback", () => {
    const fb = createFeedback("bug_report", "Delete me", "");
    expect(deleteFeedback(fb.id)).toBe(true);
    expect(getFeedback(fb.id)).toBeNull();
  });

  it("returns feedback stats", () => {
    const stats = feedbackStats();
    expect(stats.length).toBe(5);
    const types = stats.map((s) => s.type);
    expect(types).toContain("feature_request");
    expect(types).toContain("bug_report");
  });
});
