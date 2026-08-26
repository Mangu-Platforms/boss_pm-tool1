import { NextResponse } from "next/server";
import { listBookmarks, createBookmark, deleteBookmark } from "@/lib/bookmarks";
import type { Bookmark } from "@/lib/bookmarks";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const user = url.searchParams.get("user");
  return NextResponse.json({ bookmarks: listBookmarks(user || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteBookmark(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.user?.trim() || !body.entity_id?.trim()) {
    return NextResponse.json({ error: "user and entity_id required" }, { status: 400 });
  }

  const validTypes: Bookmark["entity_type"][] = ["issue", "product", "wiki", "risk", "goal", "epic"];
  if (!validTypes.includes(body.entity_type)) {
    return NextResponse.json({ error: "Invalid entity_type" }, { status: 400 });
  }

  const bm = createBookmark(body.user, body.entity_type, body.entity_id, body.label || body.entity_id);
  return NextResponse.json({ bookmark: bm }, { status: 201 });
}
