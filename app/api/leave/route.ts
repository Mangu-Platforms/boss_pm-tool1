import { NextResponse } from "next/server";
import { listLeaveRequests, getLeaveRequest, createLeaveRequest, approveLeave, rejectLeave, deleteLeaveRequest, getUpcomingLeave } from "@/lib/leave";
import type { LeaveType } from "@/lib/leave";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const member = url.searchParams.get("member");
  const view = url.searchParams.get("view");

  if (view === "upcoming") {
    return NextResponse.json({ leave: getUpcomingLeave() });
  }

  return NextResponse.json({ leave: listLeaveRequests(member || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "approve") {
    const req2 = approveLeave(body.id, body.approver || "operator");
    return req2
      ? NextResponse.json({ leave: req2 })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "reject") {
    const req2 = rejectLeave(body.id, body.approver || "operator");
    return req2
      ? NextResponse.json({ leave: req2 })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteLeaveRequest(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.member?.trim() || !body.start_date || !body.end_date) {
    return NextResponse.json({ error: "member, start_date, end_date required" }, { status: 400 });
  }

  const validTypes: LeaveType[] = ["vacation", "sick", "personal", "conference", "other"];
  const type = validTypes.includes(body.type) ? body.type : "other";

  const leave = createLeaveRequest(body.member, type, body.start_date, body.end_date, body.reason || "");
  return NextResponse.json({ leave }, { status: 201 });
}
