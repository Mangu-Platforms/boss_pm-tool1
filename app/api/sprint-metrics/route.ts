import { NextRequest, NextResponse } from "next/server";
import { sprintMetrics, allSprintMetrics, cumulativeFlowData } from "@/lib/sprint-metrics";

export async function GET(req: NextRequest) {
  const sprintId = req.nextUrl.searchParams.get("sprint_id");
  const view = req.nextUrl.searchParams.get("view");
  if (sprintId && view === "flow") return NextResponse.json(cumulativeFlowData(sprintId));
  if (sprintId) {
    const m = sprintMetrics(sprintId);
    return m ? NextResponse.json(m) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(allSprintMetrics());
}
