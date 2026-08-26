import { NextResponse } from "next/server";
import { listAttachments, listAllAttachments, addAttachment, removeAttachment, getAttachment } from "@/lib/attachments";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const issueId = url.searchParams.get("issue_id");
  const id = url.searchParams.get("id");

  if (id) {
    const att = getAttachment(id);
    return att ? NextResponse.json({ attachment: att }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (issueId) {
    return NextResponse.json({ attachments: listAttachments(issueId) });
  }

  return NextResponse.json({ attachments: listAllAttachments() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return removeAttachment(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.issue_id || !body.filename || !body.url) {
    return NextResponse.json({ error: "issue_id, filename, and url required" }, { status: 400 });
  }

  const att = addAttachment(
    body.issue_id,
    body.filename,
    body.content_type || "application/octet-stream",
    body.size_bytes || 0,
    body.url,
    body.uploaded_by || "operator"
  );
  return NextResponse.json({ attachment: att }, { status: 201 });
}
