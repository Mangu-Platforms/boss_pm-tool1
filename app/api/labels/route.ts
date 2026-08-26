import { NextResponse } from "next/server";
import { listLabels, getLabel, createLabel, updateLabel, deleteLabel, addLabelToIssue, removeLabelFromIssue, labelsForIssue } from "@/lib/labels";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const issueId = url.searchParams.get("issue_id");

  if (issueId) return NextResponse.json({ labels: labelsForIssue(issueId) });
  if (id) {
    const label = getLabel(id);
    return label ? NextResponse.json({ label }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ labels: listLabels() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.action === "update") {
    const label = updateLabel(body.id, { name: body.name, color: body.color });
    return label ? NextResponse.json({ label }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "add_to_issue") {
    return addLabelToIssue(body.issue_id, body.label_id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Label not found" }, { status: 404 });
  }

  if (body.action === "remove_from_issue") {
    return removeLabelFromIssue(body.issue_id, body.label_id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteLabel(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const label = createLabel(body.name.trim(), body.color || "#8a8376");
  return NextResponse.json({ label }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteLabel(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
