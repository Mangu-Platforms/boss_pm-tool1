import { NextRequest, NextResponse } from "next/server";
import { listRelations, getRelation, addRelation, removeRelation, childIssues, parentIssue, duplicates } from "@/lib/issue-relations";
import type { RelationType } from "@/lib/issue-relations";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const r = getRelation(id);
    return r ? NextResponse.json(r) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const issueId = req.nextUrl.searchParams.get("issue_id") || undefined;
  const children = req.nextUrl.searchParams.get("children");
  if (children) return NextResponse.json(childIssues(children));
  const parent = req.nextUrl.searchParams.get("parent_of");
  if (parent) {
    const p = parentIssue(parent);
    return NextResponse.json({ parent: p });
  }
  const dupes = req.nextUrl.searchParams.get("duplicates");
  if (dupes) return NextResponse.json(duplicates(dupes));
  return NextResponse.json(listRelations(issueId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return removeRelation(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const rel = addRelation(body.source_issue_id, body.target_issue_id, body.type as RelationType);
  return rel ? NextResponse.json(rel, { status: 201 }) : NextResponse.json({ error: "invalid" }, { status: 400 });
}
