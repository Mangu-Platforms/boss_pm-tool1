import { NextRequest, NextResponse } from "next/server";
import { sprintPlan, backlogIssues, planningStats } from "@/lib/sprint-planning";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("stats") !== null) {
    return NextResponse.json(planningStats());
  }
  if (req.nextUrl.searchParams.get("backlog") !== null) {
    return NextResponse.json(backlogIssues());
  }
  const sprintId = req.nextUrl.searchParams.get("sprint_id");
  if (sprintId) {
    const capacity = parseInt(req.nextUrl.searchParams.get("capacity") || "40", 10);
    const plan = sprintPlan(sprintId, capacity);
    return plan ? NextResponse.json(plan) : NextResponse.json({ error: "sprint not found" }, { status: 404 });
  }
  return NextResponse.json({ error: "sprint_id required" }, { status: 400 });
}
