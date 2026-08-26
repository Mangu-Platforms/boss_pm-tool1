import { describe, it, expect } from "vitest";
import { listEpics, getEpic, createEpic, updateEpic, deleteEpic, addIssueToEpic, removeIssueFromEpic, issuesForEpic, epicForIssue } from "@/lib/epics";

describe("epics", () => {
  it("lists default epics", () => {
    const epics = listEpics();
    expect(epics.length).toBeGreaterThanOrEqual(2);
    expect(epics.find((e) => e.name === "User Onboarding")).toBeTruthy();
  });

  it("gets epic by id", () => {
    const epic = getEpic("epic-onboarding");
    expect(epic).toBeTruthy();
    expect(epic!.name).toBe("User Onboarding");
  });

  it("returns null for unknown epic", () => {
    expect(getEpic("nope")).toBeNull();
  });

  it("creates an epic", () => {
    const epic = createEpic("New Feature Epic", "A big initiative", "#ff0000");
    expect(epic.name).toBe("New Feature Epic");
    expect(epic.status).toBe("active");
  });

  it("updates an epic", () => {
    const epic = createEpic("To Update", "desc");
    const updated = updateEpic(epic.id, { name: "Updated Epic", status: "completed" });
    expect(updated!.name).toBe("Updated Epic");
    expect(updated!.status).toBe("completed");
  });

  it("deletes an epic", () => {
    const epic = createEpic("To Delete");
    expect(deleteEpic(epic.id)).toBe(true);
    expect(getEpic(epic.id)).toBeNull();
  });

  it("manages issue associations", () => {
    const epic = createEpic("With Issues");
    addIssueToEpic(epic.id, "iss-1");
    addIssueToEpic(epic.id, "iss-2");
    addIssueToEpic(epic.id, "iss-1"); // duplicate

    expect(issuesForEpic(epic.id).length).toBe(2);
    expect(epicForIssue("iss-1")!.id).toBe(epic.id);

    removeIssueFromEpic(epic.id, "iss-1");
    expect(issuesForEpic(epic.id).length).toBe(1);
    expect(epicForIssue("iss-1")).toBeNull();
  });
});
