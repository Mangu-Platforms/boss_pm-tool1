import { NextResponse } from "next/server";
import { listMilestones, createMilestone, getMilestone, updateMilestone, deleteMilestone, addIssueToMilestone, removeIssueFromMilestone, issuesForMilestone } from "@/lib/milestones";
import { dbListIssues } from "@/lib/db";

export async function GET() {
  const milestones = listMilestones();
  const allIssues = await dbListIssues();

  const enriched = milestones.map((ms) => {
    const issueIds = issuesForMilestone(ms.id);
    const issues = allIssues.filter((i) => issueIds.includes(i.id));
    const done = issues.filter((i) => i.status === "done" || i.status === "cancelled").length;
    return {
      ...ms,
      issue_count: issues.length,
      done_count: done,
      progress: issues.length > 0 ? Math.round((done / issues.length) * 100) : 0,
    };
  });

  return NextResponse.json({ milestones: enriched });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.action === "add_issue") {
    if (!body.milestone_id || !body.issue_id) {
      return NextResponse.json({ error: "milestone_id and issue_id required" }, { status: 400 });
    }
    const ok = addIssueToMilestone(body.milestone_id, body.issue_id);
    if (!ok) return NextResponse.json({ error: "milestone not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "remove_issue") {
    if (!body.milestone_id || !body.issue_id) {
      return NextResponse.json({ error: "milestone_id and issue_id required" }, { status: 400 });
    }
    removeIssueFromMilestone(body.milestone_id, body.issue_id);
    return NextResponse.json({ ok: true });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const ms = createMilestone(body.name.trim(), body.description || "", body.due_on || null);
  return NextResponse.json({ milestone: ms }, { status: 201 });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ms = updateMilestone(body.id, body);
  if (!ms) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ milestone: ms });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteMilestone(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
