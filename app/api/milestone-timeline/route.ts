import { NextRequest, NextResponse } from "next/server";
import { milestoneTimeline, upcomingMilestones, overdueMilestones, timelineStats } from "@/lib/milestone-timeline";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("stats") !== null) {
    return NextResponse.json(timelineStats());
  }
  if (req.nextUrl.searchParams.get("upcoming") !== null) {
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30", 10);
    return NextResponse.json(upcomingMilestones(days));
  }
  if (req.nextUrl.searchParams.get("overdue") !== null) {
    return NextResponse.json(overdueMilestones());
  }
  return NextResponse.json(milestoneTimeline());
}
