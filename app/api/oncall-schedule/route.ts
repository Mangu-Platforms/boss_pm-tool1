import { NextRequest, NextResponse } from "next/server";
import { listShifts, getShift, createShift, requestSwap, currentOncall, listOverrides, createOverride, deleteShift } from "@/lib/oncall-schedule";
import type { OncallRotation } from "@/lib/oncall-schedule";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const shift = getShift(id);
    return shift ? NextResponse.json(shift) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const team = req.nextUrl.searchParams.get("current");
  if (team) return NextResponse.json(currentOncall(team));
  if (req.nextUrl.searchParams.get("overrides") !== null) {
    const date = req.nextUrl.searchParams.get("date") || undefined;
    return NextResponse.json(listOverrides(date));
  }
  const filterTeam = req.nextUrl.searchParams.get("team") || undefined;
  const filterDate = req.nextUrl.searchParams.get("date") || undefined;
  return NextResponse.json(listShifts(filterTeam, filterDate));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteShift(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "swap") {
    const shift = requestSwap(body.id);
    return shift ? NextResponse.json(shift) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "override") {
    const ov = createOverride(body.original_member, body.override_member, body.date, body.reason || "");
    return NextResponse.json(ov, { status: 201 });
  }
  const shift = createShift(body.member, body.rotation as OncallRotation, body.start_date, body.end_date, body.team || "platform");
  return NextResponse.json(shift, { status: 201 });
}
