import { NextResponse } from "next/server";
import {
  listRetros,
  getRetro,
  createRetro,
  addRetroItem,
  voteRetroItem,
  resolveRetroItem,
  updateRetroStatus,
  deleteRetro,
} from "@/lib/retros";
import type { RetroItem } from "@/lib/retros";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const retro = getRetro(id);
    return retro
      ? NextResponse.json({ retro })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ retros: listRetros() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "add_item") {
    const validTypes: RetroItem["type"][] = ["went_well", "to_improve", "action_item"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!body.text?.trim()) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }
    const item = addRetroItem(body.retro_id, body.type, body.text, body.author);
    return item
      ? NextResponse.json({ item }, { status: 201 })
      : NextResponse.json({ error: "Retro not found" }, { status: 404 });
  }

  if (body.action === "vote") {
    return voteRetroItem(body.retro_id, body.item_id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "resolve") {
    return resolveRetroItem(body.retro_id, body.item_id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update_status") {
    const validStatuses = ["open", "in_progress", "completed"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const retro = updateRetroStatus(body.retro_id, body.status);
    return retro
      ? NextResponse.json({ retro })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteRetro(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const retro = createRetro(body.title, body.sprint_id || null);
  return NextResponse.json({ retro }, { status: 201 });
}
