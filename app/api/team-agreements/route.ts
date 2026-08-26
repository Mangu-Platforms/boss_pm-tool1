import { NextRequest, NextResponse } from "next/server";
import { listAgreements, getAgreement, createAgreement, updateAgreement, approveAgreement, deleteAgreement, agreementStats } from "@/lib/team-agreements";
import type { AgreementType, AgreementStatus } from "@/lib/team-agreements";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const ag = getAgreement(id);
    return ag ? NextResponse.json(ag) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) {
    const team = req.nextUrl.searchParams.get("team") || undefined;
    return NextResponse.json(agreementStats(team));
  }
  const team = req.nextUrl.searchParams.get("team") || undefined;
  const type = req.nextUrl.searchParams.get("type") as AgreementType | undefined;
  const status = req.nextUrl.searchParams.get("status") as AgreementStatus | undefined;
  return NextResponse.json(listAgreements(team, type || undefined, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteAgreement(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const ag = updateAgreement(body.id, body.updates);
    return ag ? NextResponse.json(ag) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "approve") {
    const ag = approveAgreement(body.id, body.approver);
    return ag ? NextResponse.json(ag) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const ag = createAgreement(body.team, body.type, body.title, body.content, body.author || "max");
  return NextResponse.json(ag, { status: 201 });
}
