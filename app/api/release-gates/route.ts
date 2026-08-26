import { NextRequest, NextResponse } from "next/server";
import { listGates, getGate, createGate, evaluateGate, deleteGate, releaseReadiness } from "@/lib/release-gates";
import type { GateType, GateStatus } from "@/lib/release-gates";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const g = getGate(id);
    return g ? NextResponse.json(g) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const readiness = req.nextUrl.searchParams.get("readiness");
  if (readiness) return NextResponse.json(releaseReadiness(readiness));
  const release_id = req.nextUrl.searchParams.get("release_id") || undefined;
  const status = req.nextUrl.searchParams.get("status") as GateStatus | undefined;
  const type = req.nextUrl.searchParams.get("type") as GateType | undefined;
  return NextResponse.json(listGates(release_id, status || undefined, type || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteGate(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "evaluate") {
    const g = evaluateGate(body.id, body.status, body.approver, body.details);
    return g ? NextResponse.json(g) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const g = createGate(body.release_id, body.name, body.type, body.required !== false, body.details);
  return NextResponse.json(g, { status: 201 });
}
