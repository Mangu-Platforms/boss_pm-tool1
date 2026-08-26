import { NextResponse } from "next/server";
import { getSprint } from "@/lib/sprints";
import { calculateBurndown } from "@/lib/burndown";
import { dbListIssues } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sprint = getSprint(id);
  if (!sprint) return NextResponse.json({ error: "not found" }, { status: 404 });

  const allIssues = await dbListIssues();
  const doneIds = allIssues
    .filter((i) => i.status === "done" || i.status === "cancelled")
    .map((i) => i.id);

  const today = new Date().toISOString().split("T")[0];
  const points = calculateBurndown(sprint.id, sprint.start_date, sprint.end_date, doneIds, today);

  return NextResponse.json({ sprint_id: id, points });
}
