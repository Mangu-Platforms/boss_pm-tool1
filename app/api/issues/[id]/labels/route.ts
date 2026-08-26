import { NextResponse } from "next/server";
import { labelsForIssue, addLabelToIssue, removeLabelFromIssue } from "@/lib/labels";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const labels = labelsForIssue(id);
  return NextResponse.json({ labels });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.label_id) {
    return NextResponse.json({ error: "label_id required" }, { status: 400 });
  }
  const ok = addLabelToIssue(id, body.label_id);
  if (!ok) return NextResponse.json({ error: "label not found" }, { status: 404 });
  return NextResponse.json({ ok: true, labels: labelsForIssue(id) });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const labelId = searchParams.get("label_id");
  if (!labelId) return NextResponse.json({ error: "label_id required" }, { status: 400 });
  removeLabelFromIssue(id, labelId);
  return NextResponse.json({ ok: true, labels: labelsForIssue(id) });
}
