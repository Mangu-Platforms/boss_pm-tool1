import { describe, it, expect } from "vitest";
import {
  listSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
  addIssueToSprint,
  removeIssueFromSprint,
  issuesForSprint,
  sprintForIssue,
  sprintVelocity,
} from "@/lib/sprints";

describe("sprints", () => {
  it("lists defaults sorted active first", () => {
    const sprints = listSprints();
    expect(sprints.length).toBeGreaterThanOrEqual(2);
    expect(sprints[0].status).toBe("active");
  });

  it("gets sprint by id", () => {
    const sp = getSprint("sprint-1");
    expect(sp).toBeTruthy();
    expect(sp!.name).toBe("Sprint 1");
  });

  it("returns null for unknown", () => {
    expect(getSprint("nope")).toBeNull();
  });

  it("creates a sprint", () => {
    const sp = createSprint("Sprint 3", "Testing", "2025-09-15", "2025-09-29");
    expect(sp.status).toBe("planning");
    expect(sp.start_date).toBe("2025-09-15");
  });

  it("updates a sprint", () => {
    const sp = createSprint("To Update", "", "2025-10-01", "2025-10-15");
    const updated = updateSprint(sp.id, { status: "active", goal: "New goal" });
    expect(updated!.status).toBe("active");
    expect(updated!.goal).toBe("New goal");
  });

  it("deletes a sprint", () => {
    const sp = createSprint("To Delete", "", "2025-10-01", "2025-10-15");
    expect(deleteSprint(sp.id)).toBe(true);
    expect(getSprint(sp.id)).toBeNull();
  });

  it("assigns issue to sprint (moves from prior)", () => {
    const sp1 = createSprint("S-A", "", "2025-11-01", "2025-11-15");
    const sp2 = createSprint("S-B", "", "2025-11-15", "2025-11-29");
    addIssueToSprint(sp1.id, "issue-sp1");
    addIssueToSprint(sp2.id, "issue-sp1");
    expect(issuesForSprint(sp1.id)).not.toContain("issue-sp1");
    expect(issuesForSprint(sp2.id)).toContain("issue-sp1");
  });

  it("removes issue from sprint", () => {
    const sp = createSprint("S-Rem", "", "2025-12-01", "2025-12-15");
    addIssueToSprint(sp.id, "issue-rem");
    expect(removeIssueFromSprint(sp.id, "issue-rem")).toBe(true);
    expect(issuesForSprint(sp.id)).not.toContain("issue-rem");
  });

  it("finds sprint for issue", () => {
    const sp = createSprint("S-Find", "", "2026-01-01", "2026-01-15");
    addIssueToSprint(sp.id, "issue-find-sp");
    expect(sprintForIssue("issue-find-sp")).toBe(sp.id);
  });

  it("calculates velocity", () => {
    const sp = createSprint("S-Vel", "", "2026-02-01", "2026-02-15");
    addIssueToSprint(sp.id, "v-1");
    addIssueToSprint(sp.id, "v-2");
    addIssueToSprint(sp.id, "v-3");
    const vel = sprintVelocity(sp.id, ["v-1", "v-3"]);
    expect(vel.total).toBe(3);
    expect(vel.done).toBe(2);
    expect(vel.percent).toBe(67);
  });
});
