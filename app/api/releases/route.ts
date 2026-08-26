import { NextResponse } from "next/server";
import { listReleases, createRelease, updateRelease, publishRelease, deleteRelease, addIssueToRelease, removeIssueFromRelease } from "@/lib/releases";

export async function GET() {
  return NextResponse.json({ releases: listReleases() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.action === "publish") {
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const release = publishRelease(body.id);
    if (!release) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ release });
  }

  if (body.action === "add_issue") {
    if (!body.release_id || !body.issue_id) return NextResponse.json({ error: "release_id and issue_id required" }, { status: 400 });
    const ok = addIssueToRelease(body.release_id, body.issue_id);
    if (!ok) return NextResponse.json({ error: "release not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "remove_issue") {
    if (!body.release_id || !body.issue_id) return NextResponse.json({ error: "release_id and issue_id required" }, { status: 400 });
    removeIssueFromRelease(body.release_id, body.issue_id);
    return NextResponse.json({ ok: true });
  }

  if (!body.version?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: "version and title required" }, { status: 400 });
  }
  const release = createRelease(body.version.trim(), body.title.trim(), body.notes || "", body.issue_ids || []);
  return NextResponse.json({ release }, { status: 201 });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const release = updateRelease(body.id, body);
  if (!release) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ release });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteRelease(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
