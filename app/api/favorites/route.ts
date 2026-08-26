import { NextResponse } from "next/server";
import { listFavorites, addFavorite, removeFavorite, isFavorite, favoritesCount } from "@/lib/favorites";

const USER_ID = "user-max";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id") || USER_ID;
  const checkItem = url.searchParams.get("check_item");
  if (checkItem) {
    return NextResponse.json({ is_favorite: isFavorite(userId, checkItem) });
  }
  return NextResponse.json({ favorites: listFavorites(userId), count: favoritesCount(userId) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.item_type || !body.item_id || !body.item_title) {
    return NextResponse.json({ error: "item_type, item_id, item_title required" }, { status: 400 });
  }
  const fav = addFavorite(USER_ID, body.item_type, body.item_id, body.item_title);
  return NextResponse.json({ favorite: fav }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("item_id");
  if (!itemId) return NextResponse.json({ error: "item_id required" }, { status: 400 });
  removeFavorite(USER_ID, itemId);
  return NextResponse.json({ ok: true });
}
