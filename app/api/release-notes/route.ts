import { NextResponse } from "next/server";
import { listReleaseNotes, getReleaseNote, createReleaseNote, updateReleaseNote, publishReleaseNote, deleteReleaseNote } from "@/lib/release-notes";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const version = url.searchParams.get("version");

  if (id) {
    const rn = getReleaseNote(id);
    if (!rn) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ release_note: rn });
  }

  return NextResponse.json({ release_notes: listReleaseNotes(version || undefined) });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteReleaseNote(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "publish") {
    const rn = publishReleaseNote(body.id);
    return rn ? NextResponse.json({ release_note: rn }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update") {
    const rn = updateReleaseNote(body.id, body.updates || {});
    return rn ? NextResponse.json({ release_note: rn }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.version?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: "version and title required" }, { status: 400 });
  }

  const rn = createReleaseNote(body.version, body.title, body.body || "", body.category || "feature", body.release_id);
  return NextResponse.json({ release_note: rn }, { status: 201 });
}
