import { describe, it, expect } from "vitest";
import { subscriptionsForIssue, subscriptionsForUser, getSubscription, subscribe, unsubscribe, subscriberCount } from "../lib/issue-subscriptions";

describe("issue-subscriptions", () => {
  it("lists subscriptions for an issue", () => {
    const subs = subscriptionsForIssue("BOSS-1");
    expect(subs.length).toBeGreaterThanOrEqual(2);
  });

  it("lists subscriptions for a user", () => {
    const subs = subscriptionsForUser("max");
    expect(subs.length).toBeGreaterThanOrEqual(2);
    expect(subs.every((s) => s.user_id === "max")).toBe(true);
  });

  it("gets specific subscription", () => {
    const sub = getSubscription("max", "BOSS-1");
    expect(sub).not.toBeNull();
    expect(sub!.level).toBe("all");
  });

  it("subscribes to an issue", () => {
    const sub = subscribe("charlie", "BOSS-5", "mentions");
    expect(sub.level).toBe("mentions");
  });

  it("updates existing subscription level", () => {
    subscribe("dave", "BOSS-1", "all");
    const updated = subscribe("dave", "BOSS-1", "status_changes");
    expect(updated.level).toBe("status_changes");
  });

  it("unsubscribes", () => {
    subscribe("eve", "BOSS-2");
    expect(unsubscribe("eve", "BOSS-2")).toBe(true);
    expect(getSubscription("eve", "BOSS-2")).toBeNull();
  });

  it("counts subscribers", () => {
    const count = subscriberCount("BOSS-1");
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
