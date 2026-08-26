import { NextResponse } from "next/server";
import { dbGetIssue, dbUpdateIssue, dbDeleteIssue } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { IssuePriority, IssueStatus } from "@/lib/types";

export async function POST(req: Request) {
  let body: { action: string; ids: string[]; status?: IssueStatus; priority?: IssuePriority };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.ids?.length) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  if (body.ids.length > 50) {
    return NextResponse.json({ error: "max 50 items per batch" }, { status: 400 });
  }

  const results: { id: string; ok: boolean; error?: string }[] = [];

  switch (body.action) {
    case "update_status": {
      if (!body.status) {
        return NextResponse.json({ error: "status required" }, { status: 400 });
      }
      for (const id of body.ids) {
        const issue = await dbUpdateIssue(id, { status: body.status });
        if (issue) {
          logActivity(issue, "status_changed", `→ ${body.status}`);
          results.push({ id, ok: true });
        } else {
          results.push({ id, ok: false, error: "not found" });
        }
      }
      break;
    }
    case "update_priority": {
      if (!body.priority) {
        return NextResponse.json({ error: "priority required" }, { status: 400 });
      }
      for (const id of body.ids) {
        const issue = await dbUpdateIssue(id, { priority: body.priority });
        if (issue) {
          logActivity(issue, "priority_changed", `→ ${body.priority}`);
          results.push({ id, ok: true });
        } else {
          results.push({ id, ok: false, error: "not found" });
        }
      }
      break;
    }
    case "delete": {
      for (const id of body.ids) {
        const issue = await dbGetIssue(id);
        const deleted = await dbDeleteIssue(id);
        if (deleted && issue) {
          logActivity(issue, "deleted", `"${issue.title}" removed`);
          results.push({ id, ok: true });
        } else {
          results.push({ id, ok: false, error: "not found" });
        }
      }
      break;
    }
    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  return NextResponse.json({ results });
}
