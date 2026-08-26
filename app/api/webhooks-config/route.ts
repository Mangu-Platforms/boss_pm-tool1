import { NextResponse } from "next/server";
import { listWebhookConfigs, createWebhookConfig, updateWebhookConfig, deleteWebhookConfig } from "@/lib/webhooks-config";

export async function GET() {
  return NextResponse.json({ webhooks: listWebhookConfigs() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.name?.trim() || !body.url?.trim() || !body.events?.length) {
    return NextResponse.json({ error: "name, url, and events required" }, { status: 400 });
  }
  const wh = createWebhookConfig(body.name.trim(), body.url.trim(), body.events, body.secret);
  return NextResponse.json({ webhook: wh }, { status: 201 });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const wh = updateWebhookConfig(body.id, body);
  if (!wh) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ webhook: wh });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteWebhookConfig(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
