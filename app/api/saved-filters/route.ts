import { NextResponse } from "next/server";
import { listSavedFilters, getSavedFilter, createSavedFilter, updateSavedFilter, deleteSavedFilter } from "@/lib/saved-filters";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const owner = url.searchParams.get("owner");

  if (id) {
    const sf = getSavedFilter(id);
    if (!sf) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ filter: sf });
  }

  return NextResponse.json({ filters: listSavedFilters(owner || undefined) });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteSavedFilter(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update") {
    const sf = updateSavedFilter(body.id, body.updates || {});
    return sf ? NextResponse.json({ filter: sf }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim() || !body.entity) {
    return NextResponse.json({ error: "name and entity required" }, { status: 400 });
  }

  const sf = createSavedFilter(body.name, body.entity, body.conditions || [], body.owner || "max", body.is_shared || false);
  return NextResponse.json({ filter: sf }, { status: 201 });
}
