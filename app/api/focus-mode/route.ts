import { NextRequest, NextResponse } from "next/server";
import { listSessions, getSession, startFocus, completeFocus, endSession, focusStats, activeSession } from "@/lib/focus-mode";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const s = getSession(id);
    return s ? NextResponse.json(s) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const userId = req.nextUrl.searchParams.get("user_id");
  if (req.nextUrl.searchParams.get("stats") !== null && userId) {
    return NextResponse.json(focusStats(userId));
  }
  if (req.nextUrl.searchParams.get("active") !== null && userId) {
    const s = activeSession(userId);
    return s ? NextResponse.json(s) : NextResponse.json({ error: "no active session" }, { status: 404 });
  }
  return NextResponse.json(listSessions(userId || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "complete") {
    const s = completeFocus(body.id);
    return s ? NextResponse.json(s) : NextResponse.json({ error: "not found or not focusing" }, { status: 404 });
  }
  if (body.action === "end") {
    const s = endSession(body.id);
    return s ? NextResponse.json(s) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const s = startFocus(body.user_id, body.issue_id || null, body.duration_minutes, body.break_minutes);
  return NextResponse.json(s, { status: 201 });
}
