import { NextResponse } from "next/server";
import { listTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/team";

export async function GET() {
  return NextResponse.json({ members: listTeamMembers() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  }
  const member = createTeamMember(body.name.trim(), body.email.trim(), body.role || "member", body.capacity_hours ?? 40);
  return NextResponse.json({ member }, { status: 201 });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const member = updateTeamMember(body.id, body);
  if (!member) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ member });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteTeamMember(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
