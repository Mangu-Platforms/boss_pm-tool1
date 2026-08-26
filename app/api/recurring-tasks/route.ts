import { NextRequest, NextResponse } from "next/server";
import { listRecurringTasks, getRecurringTask, createRecurringTask, updateRecurringTask, triggerRecurringTask, deleteRecurringTask, dueRecurringTasks } from "@/lib/recurring-tasks";
import type { RecurrencePattern } from "@/lib/recurring-tasks";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const t = getRecurringTask(id);
    return t ? NextResponse.json(t) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const due = req.nextUrl.searchParams.get("due");
  if (due === "true") return NextResponse.json(dueRecurringTasks());
  const active = req.nextUrl.searchParams.get("active");
  return NextResponse.json(listRecurringTasks(active !== null ? active === "true" : undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteRecurringTask(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const t = updateRecurringTask(body.id, body.updates);
    return t ? NextResponse.json(t) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "trigger") {
    const result = triggerRecurringTask(body.id);
    return result ? NextResponse.json(result) : NextResponse.json({ error: "not found or inactive" }, { status: 404 });
  }
  const t = createRecurringTask(body.title, body.body || "", body.priority || "medium", body.assignee || "", body.pattern as RecurrencePattern, body.next_due);
  return NextResponse.json(t, { status: 201 });
}
