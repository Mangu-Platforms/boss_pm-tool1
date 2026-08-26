import { NextRequest, NextResponse } from "next/server";
import { listAvailability, setAvailability, teamCapacity, weeklyCapacity } from "@/lib/team-availability";
import type { AvailabilityStatus } from "@/lib/team-availability";

export async function GET(req: NextRequest) {
  const member = req.nextUrl.searchParams.get("member") || undefined;
  const date = req.nextUrl.searchParams.get("date") || undefined;
  const capacity = req.nextUrl.searchParams.get("capacity");
  if (capacity) return NextResponse.json(teamCapacity(capacity));
  const weekly = req.nextUrl.searchParams.get("weekly");
  const startDate = req.nextUrl.searchParams.get("start_date");
  if (weekly && startDate) return NextResponse.json(weeklyCapacity(weekly, startDate));
  return NextResponse.json(listAvailability(member, date));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const a = setAvailability(body.member, body.date, body.status as AvailabilityStatus, body.hours ?? 8, body.note || "");
  return NextResponse.json(a);
}
