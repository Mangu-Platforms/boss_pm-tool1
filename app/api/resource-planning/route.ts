import { NextRequest, NextResponse } from "next/server";
import { listAllocations, getAllocation, createAllocation, updateAllocation, deleteAllocation, memberUtilization, overAllocatedMembers } from "@/lib/resource-planning";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const a = getAllocation(id);
    return a ? NextResponse.json(a) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const member = req.nextUrl.searchParams.get("member") || undefined;
  const projectId = req.nextUrl.searchParams.get("project_id") || undefined;
  const util = req.nextUrl.searchParams.get("utilization");
  if (util) return NextResponse.json({ member: util, utilization: memberUtilization(util) });
  const over = req.nextUrl.searchParams.get("over_allocated");
  if (over === "true") return NextResponse.json(overAllocatedMembers());
  return NextResponse.json(listAllocations(member, projectId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteAllocation(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const a = updateAllocation(body.id, body.updates);
    return a ? NextResponse.json(a) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const a = createAllocation(body.member, body.project_id, body.allocation_pct, body.start_date, body.end_date, body.notes);
  return NextResponse.json(a, { status: 201 });
}
