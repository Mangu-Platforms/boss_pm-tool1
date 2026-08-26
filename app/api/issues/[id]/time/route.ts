import { NextResponse } from "next/server";
import { logTime, listTimeEntries, totalMinutes, removeTimeEntry } from "@/lib/timelog";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entries = listTimeEntries(id);
  const total = totalMinutes(id);
  return NextResponse.json({ entries, total_minutes: total });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const minutes = Number(body.minutes);
  if (!minutes || minutes <= 0) {
    return NextResponse.json({ error: "minutes must be a positive number" }, { status: 400 });
  }

  const entry = logTime(id, minutes, body.note || "", body.author);
  return NextResponse.json({ entry }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get("entry_id");
  if (!entryId) {
    return NextResponse.json({ error: "entry_id required" }, { status: 400 });
  }
  const removed = removeTimeEntry(entryId);
  if (!removed) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
