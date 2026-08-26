import { NextResponse } from "next/server";
import { listAutomations, createAutomation, updateAutomation, deleteAutomation } from "@/lib/automations";

export async function GET() {
  return NextResponse.json({ automations: listAutomations() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.name?.trim() || !body.trigger || !body.actions?.length) {
    return NextResponse.json({ error: "name, trigger, and actions required" }, { status: 400 });
  }
  const auto = createAutomation(body.name.trim(), body.trigger, body.conditions || [], body.actions);
  return NextResponse.json({ automation: auto }, { status: 201 });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const auto = updateAutomation(body.id, body);
  if (!auto) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ automation: auto });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteAutomation(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
