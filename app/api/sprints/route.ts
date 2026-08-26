import { NextResponse } from "next/server";
import { listSprints, createSprint, updateSprint, deleteSprint, addIssueToSprint, removeIssueFromSprint, issuesForSprint, sprintVelocity } from "@/lib/sprints";
import { dbListIssues } from "@/lib/db";

export async function GET() {
  const sprints = listSprints();
  const allIssues = await dbListIssues();
  const doneIds = allIssues.filter((i) => i.status === "done" || i.status === "cancelled").map((i) => i.id);

  const enriched = sprints.map((sp) => {
    const issueIds = issuesForSprint(sp.id);
    const issues = allIssues.filter((i) => issueIds.includes(i.id));
    const velocity = sprintVelocity(sp.id, doneIds);
    return {
      ...sp,
      issue_count: issues.length,
      ...velocity,
    };
  });

  return NextResponse.json({ sprints: enriched });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.action === "add_issue") {
    if (!body.sprint_id || !body.issue_id) {
      return NextResponse.json({ error: "sprint_id and issue_id required" }, { status: 400 });
    }
    const ok = addIssueToSprint(body.sprint_id, body.issue_id);
    if (!ok) return NextResponse.json({ error: "sprint not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "remove_issue") {
    if (!body.sprint_id || !body.issue_id) {
      return NextResponse.json({ error: "sprint_id and issue_id required" }, { status: 400 });
    }
    removeIssueFromSprint(body.sprint_id, body.issue_id);
    return NextResponse.json({ ok: true });
  }

  if (!body.name?.trim() || !body.start_date || !body.end_date) {
    return NextResponse.json({ error: "name, start_date, end_date required" }, { status: 400 });
  }
  const sprint = createSprint(body.name.trim(), body.goal || "", body.start_date, body.end_date);
  return NextResponse.json({ sprint }, { status: 201 });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const sprint = updateSprint(body.id, body);
  if (!sprint) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ sprint });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteSprint(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
