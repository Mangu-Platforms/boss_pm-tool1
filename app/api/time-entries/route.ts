import { NextResponse } from "next/server";
import { listTimeEntries, getTimeEntry, createTimeEntry, deleteTimeEntry, totalHours, hoursByMember } from "@/lib/time-entries";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const view = url.searchParams.get("view");
  const issueId = url.searchParams.get("issue_id");
  const member = url.searchParams.get("member");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (id) {
    const entry = getTimeEntry(id);
    return entry ? NextResponse.json({ entry }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (view === "summary") {
    return NextResponse.json({ total_hours: totalHours(issueId || undefined), by_member: hoursByMember() });
  }

  const entries = listTimeEntries({
    issue_id: issueId || undefined,
    member: member || undefined,
    from: from || undefined,
    to: to || undefined,
  });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteTimeEntry(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.issue_id || !body.member || !body.hours || !body.date) {
    return NextResponse.json({ error: "issue_id, member, hours, and date required" }, { status: 400 });
  }

  const entry = createTimeEntry(body.issue_id, body.member, Number(body.hours), body.description || "", body.date);
  return NextResponse.json({ entry }, { status: 201 });
}
