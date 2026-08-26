import { NextRequest, NextResponse } from "next/server";
import { listFilters, getFilter, createFilter, updateFilter, deleteFilter, sharedFilters } from "@/lib/board-filters";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const f = getFilter(id);
    return f ? NextResponse.json(f) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("shared") !== null) {
    return NextResponse.json(sharedFilters());
  }
  const owner = req.nextUrl.searchParams.get("owner");
  return NextResponse.json(listFilters(owner || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteFilter(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const f = updateFilter(body.id, body.updates);
    return f ? NextResponse.json(f) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const f = createFilter(body.name, body.owner || "max", body.conditions || [], body.is_shared || false);
  return NextResponse.json(f, { status: 201 });
}
