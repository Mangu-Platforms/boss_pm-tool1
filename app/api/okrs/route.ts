import { NextResponse } from "next/server";
import { listOKRs, getOKR, createOKR, updateKeyResult, updateOKRStatus, deleteOKR, okrProgress } from "@/lib/okrs";
import type { OKR } from "@/lib/okrs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const quarter = url.searchParams.get("quarter");

  if (id) {
    const okr = getOKR(id);
    if (!okr) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ okr, progress: okrProgress(id) });
  }

  return NextResponse.json({ okrs: listOKRs(quarter || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteOKR(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update_status") {
    const validStatuses: OKR["status"][] = ["on_track", "at_risk", "off_track", "achieved"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const okr = updateOKRStatus(body.id, body.status);
    return okr ? NextResponse.json({ okr }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update_kr") {
    const okr = updateKeyResult(body.okr_id, body.kr_id, Number(body.current));
    return okr ? NextResponse.json({ okr }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.objective?.trim() || !body.owner?.trim() || !body.quarter?.trim()) {
    return NextResponse.json({ error: "objective, owner, and quarter required" }, { status: 400 });
  }

  const okr = createOKR(body.objective, body.owner, body.quarter, body.key_results || []);
  return NextResponse.json({ okr }, { status: 201 });
}
