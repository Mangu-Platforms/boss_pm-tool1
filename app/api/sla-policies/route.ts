import { NextResponse } from "next/server";
import { listPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy, listBreaches, recordBreach, policyForPriority } from "@/lib/sla-policies";
import type { SLAPriority } from "@/lib/sla-policies";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const view = url.searchParams.get("view");
  const priority = url.searchParams.get("priority") as SLAPriority | null;

  if (view === "breaches") {
    return NextResponse.json({ breaches: listBreaches(id || undefined) });
  }

  if (priority) {
    const p = policyForPriority(priority);
    return p ? NextResponse.json({ policy: p }) : NextResponse.json({ error: "No policy" }, { status: 404 });
  }

  if (id) {
    const p = getPolicy(id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ policy: p });
  }

  return NextResponse.json({ policies: listPolicies() });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deletePolicy(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update") {
    const p = updatePolicy(body.id, body.updates || {});
    return p ? NextResponse.json({ policy: p }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "record_breach") {
    const b = recordBreach(body.policy_id, body.issue_id, body.breach_type);
    return NextResponse.json({ breach: b }, { status: 201 });
  }

  if (!body.name?.trim() || !body.priority) {
    return NextResponse.json({ error: "name and priority required" }, { status: 400 });
  }

  const p = createPolicy(body.name, body.priority, body.response_hours || 4, body.resolution_hours || 24, body.business_hours_only ?? true);
  return NextResponse.json({ policy: p }, { status: 201 });
}
