import { NextRequest, NextResponse } from "next/server";
import { listPulses, addPulse, averageRating, pulseTrend, userPulses } from "@/lib/team-pulse";
import type { PulseRating } from "@/lib/team-pulse";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  const sprintId = req.nextUrl.searchParams.get("sprint_id");
  if (req.nextUrl.searchParams.get("trend") !== null) {
    return NextResponse.json(pulseTrend());
  }
  if (req.nextUrl.searchParams.get("average") !== null) {
    return NextResponse.json({ avg: averageRating(sprintId || undefined) });
  }
  if (userId) return NextResponse.json(userPulses(userId));
  return NextResponse.json(listPulses(sprintId || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const p = addPulse(body.user_id, body.rating as PulseRating, body.comment || "", body.sprint_id || null);
  return NextResponse.json(p, { status: 201 });
}
