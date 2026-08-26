import { NextResponse } from "next/server";
import { listNotifications, markRead, markAllRead, unreadCount } from "@/lib/notifications";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const notifications = listNotifications({ unread_only: unreadOnly });
  return NextResponse.json({ notifications, unread_count: unreadCount() });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.action === "mark_read" && body.id) {
    const ok = markRead(body.id);
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, unread_count: unreadCount() });
  }

  if (body.action === "mark_all_read") {
    const count = markAllRead();
    return NextResponse.json({ ok: true, marked: count, unread_count: 0 });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
