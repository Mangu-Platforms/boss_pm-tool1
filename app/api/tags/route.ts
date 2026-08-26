import { NextResponse } from "next/server";
import { listTags, createTag, updateTag, deleteTag, addTagToIssue, removeTagFromIssue, tagsForIssue, issuesForTag } from "@/lib/tags";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const issueId = url.searchParams.get("issue_id");
  const tagId = url.searchParams.get("tag_id");

  if (issueId) {
    return NextResponse.json({ tags: tagsForIssue(issueId) });
  }
  if (tagId) {
    return NextResponse.json({ issue_ids: issuesForTag(tagId) });
  }
  return NextResponse.json({ tags: listTags() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "add_to_issue") {
    const ok = addTagToIssue(body.issue_id, body.tag_id);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  if (body.action === "remove_from_issue") {
    removeTagFromIssue(body.issue_id, body.tag_id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "update") {
    const updated = updateTag(body.id, { name: body.name, color: body.color, description: body.description });
    return updated
      ? NextResponse.json({ tag: updated })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteTag(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  try {
    const tag = createTag(body.name, body.color || "#8a8376", body.description);
    return NextResponse.json({ tag }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
