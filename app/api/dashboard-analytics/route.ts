import { NextRequest, NextResponse } from "next/server";
import { dashboardSummary, sprintBurndown, velocityData } from "@/lib/dashboard-analytics";

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get("view");
  if (view === "burndown") {
    const sprintId = req.nextUrl.searchParams.get("sprint_id");
    if (!sprintId) return NextResponse.json({ error: "sprint_id required" }, { status: 400 });
    const data = sprintBurndown(sprintId);
    return data ? NextResponse.json(data) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (view === "velocity") return NextResponse.json(velocityData());
  return NextResponse.json(dashboardSummary());
}
