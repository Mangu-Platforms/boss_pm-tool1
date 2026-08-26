import { NextRequest, NextResponse } from "next/server";
import { listRunbooks, getRunbook, createRunbook, executeRunbook, deleteRunbook, totalEstimatedTime } from "@/lib/runbooks";
import type { RunbookSeverity } from "@/lib/runbooks";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const rb = getRunbook(id);
    return rb ? NextResponse.json(rb) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const timeId = req.nextUrl.searchParams.get("time");
  if (timeId) return NextResponse.json({ minutes: totalEstimatedTime(timeId) });
  const serviceId = req.nextUrl.searchParams.get("service_id") || undefined;
  return NextResponse.json(listRunbooks(serviceId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteRunbook(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "execute") {
    const rb = executeRunbook(body.id);
    return rb ? NextResponse.json(rb) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const rb = createRunbook(body.title, body.description, body.service_id, body.severity as RunbookSeverity, body.owner || "max", body.steps || []);
  return NextResponse.json(rb, { status: 201 });
}
