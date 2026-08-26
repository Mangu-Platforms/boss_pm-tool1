import { NextResponse } from "next/server";
import { listApiKeys, getApiKey, createApiKey, revokeApiKey, deleteApiKey } from "@/lib/api-keys";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const key = getApiKey(id);
    if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ api_key: key });
  }

  return NextResponse.json({ api_keys: listApiKeys() });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteApiKey(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "revoke") {
    return revokeApiKey(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const key = createApiKey(body.name, body.scopes || [], body.expires_at);
  return NextResponse.json({ api_key: key }, { status: 201 });
}
