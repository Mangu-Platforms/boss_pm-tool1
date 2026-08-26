import { describe, it, expect } from "vitest";
import { listTeamMembers, getTeamMember, createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/team";

describe("team", () => {
  it("lists default members sorted by name", () => {
    const members = listTeamMembers();
    expect(members.length).toBeGreaterThanOrEqual(3);
    expect(members[0].name.localeCompare(members[1].name)).toBeLessThanOrEqual(0);
  });

  it("gets member by id", () => {
    const m = getTeamMember("user-max");
    expect(m).toBeTruthy();
    expect(m!.email).toContain("max");
  });

  it("returns null for unknown id", () => {
    expect(getTeamMember("nope")).toBeNull();
  });

  it("creates a member", () => {
    const m = createTeamMember("Charlie", "charlie@test.com", "viewer", 20);
    expect(m.name).toBe("Charlie");
    expect(m.role).toBe("viewer");
    expect(m.capacity_hours).toBe(20);
  });

  it("updates a member", () => {
    const m = createTeamMember("Dana", "dana@test.com");
    const updated = updateTeamMember(m.id, { role: "admin", capacity_hours: 30 });
    expect(updated!.role).toBe("admin");
    expect(updated!.capacity_hours).toBe(30);
  });

  it("deletes a member", () => {
    const m = createTeamMember("Ephemeral", "eph@test.com");
    expect(deleteTeamMember(m.id)).toBe(true);
    expect(getTeamMember(m.id)).toBeNull();
  });

  it("returns false for unknown delete", () => {
    expect(deleteTeamMember("nope")).toBe(false);
  });
});
