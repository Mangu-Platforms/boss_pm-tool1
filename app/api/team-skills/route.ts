import { NextRequest, NextResponse } from "next/server";
import { listSkills, getSkill, addSkill, endorseSkill, skillMatrix, removeSkill } from "@/lib/team-skills";
import type { SkillLevel } from "@/lib/team-skills";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const s = getSkill(id);
    return s ? NextResponse.json(s) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("matrix") !== null) {
    return NextResponse.json(skillMatrix());
  }
  const member = req.nextUrl.searchParams.get("member");
  return NextResponse.json(listSkills(member || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return removeSkill(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "endorse") {
    return endorseSkill(body.id, body.endorser) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "cannot endorse" }, { status: 400 });
  }
  const s = addSkill(body.member, body.skill, (body.level || "intermediate") as SkillLevel);
  return NextResponse.json(s, { status: 201 });
}
