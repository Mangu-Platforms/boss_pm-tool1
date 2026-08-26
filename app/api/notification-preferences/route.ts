import { NextRequest, NextResponse } from "next/server";
import { listPreferences, getPreference, setPreference, togglePreference, deletePreference, shouldNotify } from "@/lib/notification-preferences";
import type { NotificationChannel, NotificationEventType } from "@/lib/notification-preferences";

const USER_ID = "max";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const p = getPreference(id);
    return p ? NextResponse.json(p) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const check = req.nextUrl.searchParams.get("check");
  if (check) {
    const channel = req.nextUrl.searchParams.get("channel") as NotificationChannel;
    return NextResponse.json({ should_notify: shouldNotify(USER_ID, check as NotificationEventType, channel) });
  }
  const userId = req.nextUrl.searchParams.get("user_id") || USER_ID;
  return NextResponse.json(listPreferences(userId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deletePreference(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "toggle") {
    const p = togglePreference(body.id);
    return p ? NextResponse.json(p) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const userId = body.user_id || USER_ID;
  const p = setPreference(userId, body.event_type, body.channels, body.enabled ?? true);
  return NextResponse.json(p);
}
