import { NextResponse } from "next/server";
import { listAttachments, addAttachment, removeAttachment } from "@/lib/attachments";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ attachments: listAttachments(id) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.filename || !body.content_type || !body.size_bytes || !body.url) {
    return NextResponse.json({ error: "filename, content_type, size_bytes, url required" }, { status: 400 });
  }
  const attachment = addAttachment(id, body.filename, body.content_type, body.size_bytes, body.url, body.uploaded_by || "system");
  return NextResponse.json({ attachment }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const attachmentId = searchParams.get("attachment_id");
  if (!attachmentId) return NextResponse.json({ error: "attachment_id required" }, { status: 400 });
  const removed = removeAttachment(attachmentId);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
