import { NextResponse } from "next/server";
import { listStandups, getStandup, createStandup, deleteStandup, getStandupDates } from "@/lib/standups";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const date = url.searchParams.get("date");
  const view = url.searchParams.get("view");

  if (view === "dates") {
    return NextResponse.json({ dates: getStandupDates() });
  }

  if (id) {
    const s = getStandup(id);
    return s
      ? NextResponse.json({ standup: s })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ standups: listStandups(date || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteStandup(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.member?.trim()) {
    return NextResponse.json({ error: "member required" }, { status: 400 });
  }

  const entry = createStandup(body.member, body.yesterday || "", body.today || "", body.blockers || "", body.date);
  return NextResponse.json({ standup: entry }, { status: 201 });
}
