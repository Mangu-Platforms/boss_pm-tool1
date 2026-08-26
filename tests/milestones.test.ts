import { describe, it, expect } from "vitest";
import {
  listMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  addIssueToMilestone,
  removeIssueFromMilestone,
  issuesForMilestone,
  milestoneForIssue,
} from "@/lib/milestones";

describe("milestones", () => {
  it("lists default milestones sorted active first", () => {
    const ms = listMilestones();
    expect(ms.length).toBeGreaterThanOrEqual(2);
    expect(ms[0].status).toBe("active");
  });

  it("gets a milestone by id", () => {
    const ms = getMilestone("ms-v1");
    expect(ms).toBeTruthy();
    expect(ms!.name).toBe("v1.0 Launch");
  });

  it("returns null for unknown id", () => {
    expect(getMilestone("ms-nope")).toBeNull();
  });

  it("creates a milestone", () => {
    const ms = createMilestone("Sprint 1", "first sprint", "2025-08-01");
    expect(ms.name).toBe("Sprint 1");
    expect(ms.status).toBe("active");
    expect(ms.due_on).toBe("2025-08-01");
  });

  it("updates a milestone", () => {
    const created = createMilestone("To Update", "", null);
    const updated = updateMilestone(created.id, { name: "Updated Name", status: "completed" });
    expect(updated).toBeTruthy();
    expect(updated!.name).toBe("Updated Name");
    expect(updated!.status).toBe("completed");
  });

  it("deletes a milestone", () => {
    const ms = createMilestone("To Delete", "", null);
    expect(deleteMilestone(ms.id)).toBe(true);
    expect(getMilestone(ms.id)).toBeNull();
  });

  it("returns false when deleting unknown", () => {
    expect(deleteMilestone("ms-nope")).toBe(false);
  });

  it("links and lists issues for milestone", () => {
    const ms = createMilestone("Linked", "", null);
    addIssueToMilestone(ms.id, "issue-a");
    addIssueToMilestone(ms.id, "issue-b");
    const ids = issuesForMilestone(ms.id);
    expect(ids).toContain("issue-a");
    expect(ids).toContain("issue-b");
  });

  it("prevents duplicate issue link", () => {
    const ms = createMilestone("Dup Check", "", null);
    addIssueToMilestone(ms.id, "issue-x");
    addIssueToMilestone(ms.id, "issue-x");
    expect(issuesForMilestone(ms.id).length).toBe(1);
  });

  it("removes issue from milestone", () => {
    const ms = createMilestone("Remove Check", "", null);
    addIssueToMilestone(ms.id, "issue-r");
    expect(removeIssueFromMilestone(ms.id, "issue-r")).toBe(true);
    expect(issuesForMilestone(ms.id)).not.toContain("issue-r");
  });

  it("finds milestone for issue", () => {
    const ms = createMilestone("Find Check", "", null);
    addIssueToMilestone(ms.id, "issue-find");
    expect(milestoneForIssue("issue-find")).toBe(ms.id);
  });

  it("cascades delete to linked issues", () => {
    const ms = createMilestone("Cascade", "", null);
    addIssueToMilestone(ms.id, "issue-cas");
    deleteMilestone(ms.id);
    expect(milestoneForIssue("issue-cas")).toBeNull();
  });
});
