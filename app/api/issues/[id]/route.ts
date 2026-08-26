import { NextResponse } from "next/server";
import { dbGetIssue, dbUpdateIssue, dbDeleteIssue } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { recordChange } from "@/lib/history";
import { createNotification } from "@/lib/notifications";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await dbGetIssue(id);
  if (!issue) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ issue });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const before = await dbGetIssue(id);
  const issue = await dbUpdateIssue(id, body);
  if (!issue) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (before) {
    for (const key of Object.keys(body)) {
      const oldVal = String((before as Record<string, unknown>)[key] ?? "");
      const newVal = String((issue as Record<string, unknown>)[key] ?? "");
      if (oldVal !== newVal) {
        recordChange(id, key, oldVal, newVal);
      }
    }
  }
  if (body.status) {
    logActivity(issue, "status_changed", `→ ${body.status}`);
    createNotification("status_change", issue.id, issue.title, `Status changed to ${body.status}`);
  } else if (body.assignee_kind) {
    logActivity(issue, "assigned", `${body.assignee_kind}: ${body.agent_name || body.assignee_user || "unset"}`);
    createNotification("assigned", issue.id, issue.title, `Reassigned to ${body.agent_name || body.assignee_user || "unset"}`);
  } else {
    logActivity(issue, "updated", Object.keys(body).join(", "));
  }
  return NextResponse.json({ issue });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await dbGetIssue(id);
  const deleted = await dbDeleteIssue(id);
  if (!deleted) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (issue) logActivity(issue, "deleted", `"${issue.title}" removed`);
  return NextResponse.json({ ok: true });
}
