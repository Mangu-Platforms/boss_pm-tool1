import { NextRequest, NextResponse } from "next/server";
import { memberWorkloads, priorityBreakdown, agingIssues } from "@/lib/workload-analytics";

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get("view");
  if (view === "priority") return NextResponse.json(priorityBreakdown());
  if (view === "aging") {
    const minDays = Number(req.nextUrl.searchParams.get("min_days") || 7);
    return NextResponse.json(agingIssues(minDays));
  }
  return NextResponse.json(memberWorkloads());
}
