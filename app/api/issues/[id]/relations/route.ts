import { NextResponse } from "next/server";
import { addRelation, listRelations, removeRelation } from "@/lib/relations";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const relations = listRelations(id);
  return NextResponse.json({ relations });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { to_issue_id, relation_type } = body;
  if (!to_issue_id || !relation_type) {
    return NextResponse.json({ error: "to_issue_id and relation_type required" }, { status: 400 });
  }

  const validTypes = ["blocks", "blocked-by", "relates-to", "duplicates"];
  if (!validTypes.includes(relation_type)) {
    return NextResponse.json({ error: `relation_type must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  try {
    const relation = addRelation(id, to_issue_id, relation_type);
    return NextResponse.json({ relation }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const relationId = searchParams.get("relation_id");
  if (!relationId) {
    return NextResponse.json({ error: "relation_id required" }, { status: 400 });
  }
  const removed = removeRelation(relationId);
  if (!removed) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
