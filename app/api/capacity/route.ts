import { NextResponse } from "next/server";
import { listAllocations, getAllocationsForMember, createAllocation, updateAllocation, deleteAllocation, getCapacitySummary } from "@/lib/capacity";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const member = url.searchParams.get("member");
  const view = url.searchParams.get("view");

  if (view === "summary") {
    return NextResponse.json({ summary: getCapacitySummary() });
  }

  if (member) {
    return NextResponse.json({ allocations: getAllocationsForMember(member) });
  }

  return NextResponse.json({ allocations: listAllocations(), summary: getCapacitySummary() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "update") {
    const updated = updateAllocation(body.id, { percentage: body.percentage, end_date: body.end_date });
    return updated
      ? NextResponse.json({ allocation: updated })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteAllocation(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.member?.trim() || !body.project?.trim()) {
    return NextResponse.json({ error: "member and project required" }, { status: 400 });
  }

  const alloc = createAllocation(body.member, body.project, body.percentage || 100, body.start_date || new Date().toISOString().slice(0, 10), body.end_date);
  return NextResponse.json({ allocation: alloc }, { status: 201 });
}
