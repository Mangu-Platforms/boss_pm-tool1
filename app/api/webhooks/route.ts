import { NextResponse } from "next/server";
import { listWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook } from "@/lib/webhooks";
import type { WebhookEvent } from "@/lib/webhooks";

const VALID_EVENTS: WebhookEvent[] = ["issue.created", "issue.updated", "issue.deleted", "sprint.started", "sprint.completed", "release.published", "comment.created"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const wh = getWebhook(id);
    return wh ? NextResponse.json({ webhook: wh }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ webhooks: listWebhooks() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteWebhook(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update") {
    const wh = updateWebhook(body.id, {
      name: body.name,
      url: body.url,
      events: body.events,
      active: body.active,
    });
    return wh ? NextResponse.json({ webhook: wh }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim() || !body.url?.trim()) {
    return NextResponse.json({ error: "name and url required" }, { status: 400 });
  }

  const events = (body.events || []).filter((e: string) => VALID_EVENTS.includes(e as WebhookEvent)) as WebhookEvent[];
  if (events.length === 0) {
    return NextResponse.json({ error: "At least one valid event required" }, { status: 400 });
  }

  const wh = createWebhook(body.name.trim(), body.url.trim(), events);
  return NextResponse.json({ webhook: wh }, { status: 201 });
}
