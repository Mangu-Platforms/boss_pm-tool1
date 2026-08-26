import { NextResponse } from "next/server";
import { calculateBurndown, sprintVelocity } from "@/lib/burndown";
import { issuesForSprint } from "@/lib/sprints";
import { listIssues } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sprintId = url.searchParams.get("sprint_id");
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");
  const view = url.searchParams.get("view");

  if (!sprintId) {
    return NextResponse.json({ error: "sprint_id required" }, { status: 400 });
  }

  const sprintIssueIds = new Set(issuesForSprint(sprintId));
  const doneIssues = listIssues()
    .filter((i) => sprintIssueIds.has(i.id) && i.status === "done")
    .map((i) => i.id);

  if (view === "velocity") {
    return NextResponse.json(sprintVelocity(sprintId, doneIssues));
  }

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "start and end dates required" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const points = calculateBurndown(sprintId, startDate, endDate, doneIssues, today);
  return NextResponse.json({ burndown: points });
}
