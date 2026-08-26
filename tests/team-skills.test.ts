import { describe, it, expect } from "vitest";
import { listSkills, getSkill, addSkill, endorseSkill, skillMatrix, removeSkill } from "../lib/team-skills";

describe("team-skills", () => {
  it("lists all skills", () => {
    const skills = listSkills();
    expect(skills.length).toBeGreaterThanOrEqual(8);
  });

  it("filters by member", () => {
    const skills = listSkills("max");
    expect(skills.every((s) => s.member === "max")).toBe(true);
  });

  it("adds a skill", () => {
    const s = addSkill("charlie", "Rust", "beginner");
    expect(s.skill).toBe("Rust");
    expect(s.level).toBe("beginner");
  });

  it("updates existing skill level", () => {
    addSkill("charlie", "Rust", "beginner");
    const updated = addSkill("charlie", "Rust", "intermediate");
    expect(updated.level).toBe("intermediate");
  });

  it("endorses a skill", () => {
    const s = addSkill("dave", "SQL", "advanced");
    expect(endorseSkill(s.id, "max")).toBe(true);
    expect(endorseSkill(s.id, "max")).toBe(false);
  });

  it("prevents self-endorsement", () => {
    const s = addSkill("eve", "CSS", "expert");
    expect(endorseSkill(s.id, "eve")).toBe(false);
  });

  it("generates skill matrix", () => {
    const m = skillMatrix();
    expect(m.members.length).toBeGreaterThan(0);
    expect(m.skills.length).toBeGreaterThan(0);
    expect(typeof m.matrix).toBe("object");
  });

  it("removes a skill", () => {
    const s = addSkill("frank", "Java", "beginner");
    expect(removeSkill(s.id)).toBe(true);
    expect(getSkill(s.id)).toBeNull();
  });
});
