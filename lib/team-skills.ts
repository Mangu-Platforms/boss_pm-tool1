export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type TeamSkill = {
  id: string;
  member: string;
  skill: string;
  level: SkillLevel;
  endorsed_by: string[];
  updated_at: string;
};

let nextId = 9;
function genId() { return `skill-${nextId++}`; }

const store: TeamSkill[] = [
  { id: "skill-1", member: "max", skill: "TypeScript", level: "expert", endorsed_by: ["alice", "bob"], updated_at: "2025-03-01T10:00:00Z" },
  { id: "skill-2", member: "max", skill: "React", level: "advanced", endorsed_by: ["alice"], updated_at: "2025-03-01T10:00:00Z" },
  { id: "skill-3", member: "alice", skill: "Python", level: "expert", endorsed_by: ["max", "bob"], updated_at: "2025-03-02T10:00:00Z" },
  { id: "skill-4", member: "alice", skill: "TypeScript", level: "advanced", endorsed_by: ["max"], updated_at: "2025-03-02T10:00:00Z" },
  { id: "skill-5", member: "bob", skill: "Go", level: "expert", endorsed_by: ["max"], updated_at: "2025-03-03T10:00:00Z" },
  { id: "skill-6", member: "bob", skill: "Kubernetes", level: "advanced", endorsed_by: ["alice"], updated_at: "2025-03-03T10:00:00Z" },
  { id: "skill-7", member: "max", skill: "DevOps", level: "intermediate", endorsed_by: [], updated_at: "2025-03-04T10:00:00Z" },
  { id: "skill-8", member: "alice", skill: "UX Design", level: "intermediate", endorsed_by: ["bob"], updated_at: "2025-03-05T10:00:00Z" },
];

export function listSkills(member?: string): TeamSkill[] {
  if (member) return store.filter((s) => s.member === member);
  return [...store];
}

export function getSkill(id: string): TeamSkill | null {
  return store.find((s) => s.id === id) || null;
}

export function addSkill(member: string, skill: string, level: SkillLevel): TeamSkill {
  const existing = store.find((s) => s.member === member && s.skill === skill);
  if (existing) {
    existing.level = level;
    existing.updated_at = new Date().toISOString();
    return existing;
  }
  const entry: TeamSkill = { id: genId(), member, skill, level, endorsed_by: [], updated_at: new Date().toISOString() };
  store.push(entry);
  return entry;
}

export function endorseSkill(id: string, endorser: string): boolean {
  const s = store.find((sk) => sk.id === id);
  if (!s || s.endorsed_by.includes(endorser) || s.member === endorser) return false;
  s.endorsed_by.push(endorser);
  return true;
}

export function skillMatrix(): { members: string[]; skills: string[]; matrix: Record<string, Record<string, SkillLevel | null>> } {
  const members = [...new Set(store.map((s) => s.member))].sort();
  const skills = [...new Set(store.map((s) => s.skill))].sort();
  const matrix: Record<string, Record<string, SkillLevel | null>> = {};
  members.forEach((m) => {
    matrix[m] = {};
    skills.forEach((sk) => {
      const entry = store.find((s) => s.member === m && s.skill === sk);
      matrix[m][sk] = entry ? entry.level : null;
    });
  });
  return { members, skills, matrix };
}

export function removeSkill(id: string): boolean {
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
