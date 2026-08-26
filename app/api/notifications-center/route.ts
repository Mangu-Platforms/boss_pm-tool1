import { NextRequest, NextResponse } from "next/server";
import { listNotifications, getNotification, createNotification, markRead, markAllRead, unreadCount, deleteNotification } from "@/lib/notifications-center";
import type { NotificationType } from "@/lib/notifications-center";

const USER_ID = "max";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const n = getNotification(id);
    return n ? NextResponse.json(n) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("count") !== null) {
    return NextResponse.json({ unread: unreadCount(req.nextUrl.searchParams.get("user_id") || USER_ID) });
  }
  const userId = req.nextUrl.searchParams.get("user_id") || USER_ID;
  const unreadOnly = req.nextUrl.searchParams.get("unread") !== null;
  return NextResponse.json(listNotifications(userId, unreadOnly));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteNotification(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "mark_read") {
    return markRead(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "mark_all_read") {
    const count = markAllRead(body.user_id || USER_ID);
    return NextResponse.json({ marked: count });
  }
  const n = createNotification(body.user_id || USER_ID, body.type as NotificationType, body.title, body.message, body.source_id);
  return NextResponse.json(n, { status: 201 });
}
