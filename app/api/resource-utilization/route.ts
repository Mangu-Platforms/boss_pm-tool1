import { NextRequest, NextResponse } from "next/server";
import { listUtilization, getUtilization, recordUtilization, utilizationSummary, memberWorkload } from "@/lib/resource-utilization";
import type { UtilizationPeriod } from "@/lib/resource-utilization";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const entry = getUtilization(id);
    return entry ? NextResponse.json(entry) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("summary") !== null) {
    const periodStart = req.nextUrl.searchParams.get("period_start") || undefined;
    return NextResponse.json(utilizationSummary(periodStart));
  }
  if (req.nextUrl.searchParams.get("workload") !== null) {
    const member = req.nextUrl.searchParams.get("member");
    if (!member) return NextResponse.json({ error: "member required" }, { status: 400 });
    return NextResponse.json(memberWorkload(member));
  }
  const member = req.nextUrl.searchParams.get("member") || undefined;
  const period = (req.nextUrl.searchParams.get("period") as UtilizationPeriod) || undefined;
  return NextResponse.json(listUtilization(member, period));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry = recordUtilization(body.member, body.period, body.period_start, body.available_hours, body.assigned_hours, body.logged_hours);
  return NextResponse.json(entry, { status: 201 });
}
