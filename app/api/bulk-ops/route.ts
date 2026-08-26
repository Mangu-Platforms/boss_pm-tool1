import { NextResponse } from "next/server";
import { bulkUpdateStatus, bulkUpdatePriority, bulkAssign, bulkHistory, getBulkOperation } from "@/lib/bulk-ops";
import type { IssueStatus, IssuePriority } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const op = getBulkOperation(id);
    if (!op) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ operation: op });
  }

  return NextResponse.json({ operations: bulkHistory() });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.issue_ids) || body.issue_ids.length === 0) {
    return NextResponse.json({ error: "issue_ids array required" }, { status: 400 });
  }

  if (body.action === "update_status") {
    const validStatuses: IssueStatus[] = ["backlog", "open", "doing", "done", "cancelled"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    return NextResponse.json({ operation: bulkUpdateStatus(body.issue_ids, body.status) });
  }

  if (body.action === "update_priority") {
    const validPriorities: IssuePriority[] = ["critical", "high", "medium", "low"];
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    return NextResponse.json({ operation: bulkUpdatePriority(body.issue_ids, body.priority) });
  }

  if (body.action === "assign") {
    if (!body.assignee_user?.trim()) {
      return NextResponse.json({ error: "assignee_user required" }, { status: 400 });
    }
    return NextResponse.json({ operation: bulkAssign(body.issue_ids, body.assignee_user) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
