import { NextResponse } from "next/server";
import { listChangelog, createChangelogEntry, publishChangelogEntry, deleteChangelogEntry } from "@/lib/changelog";

export async function GET() {
  return NextResponse.json({ entries: listChangelog() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "publish") {
    const entry = publishChangelogEntry(body.id);
    return entry
      ? NextResponse.json({ entry })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteChangelogEntry(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.version?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: "version and title required" }, { status: 400 });
  }

  const entry = createChangelogEntry(body.version, body.title, body.body || "", body.category);
  return NextResponse.json({ entry }, { status: 201 });
}
