import { NextRequest, NextResponse } from "next/server";
import { listReleases, getRelease, createRelease, updateRelease, upcomingReleases, deleteRelease } from "@/lib/release-calendar";
import type { ReleaseType, ReleaseCalendarStatus } from "@/lib/release-calendar";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const r = getRelease(id);
    return r ? NextResponse.json(r) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("upcoming") !== null) {
    const days = parseInt(req.nextUrl.searchParams.get("days") || "60", 10);
    return NextResponse.json(upcomingReleases(days));
  }
  const status = req.nextUrl.searchParams.get("status");
  return NextResponse.json(listReleases(status as ReleaseCalendarStatus | undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteRelease(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const r = updateRelease(body.id, body.updates);
    return r ? NextResponse.json(r) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const r = createRelease(body.version, body.name, body.type as ReleaseType, body.planned_date, body.owner || "max");
  return NextResponse.json(r, { status: 201 });
}
