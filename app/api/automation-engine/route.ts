import { NextRequest, NextResponse } from "next/server";
import { listAutomations, getAutomation, createAutomation, updateAutomation, executeAutomation, deleteAutomation, matchingAutomations } from "@/lib/automation-engine";
import type { AutomationTrigger } from "@/lib/automation-engine";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const r = getAutomation(id);
    return r ? NextResponse.json(r) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const trigger = req.nextUrl.searchParams.get("trigger");
  if (trigger) return NextResponse.json(matchingAutomations(trigger as AutomationTrigger));
  const enabled = req.nextUrl.searchParams.get("enabled");
  return NextResponse.json(listAutomations(enabled !== null ? enabled === "true" : undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteAutomation(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const r = updateAutomation(body.id, body.updates);
    return r ? NextResponse.json(r) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "execute") {
    const result = executeAutomation(body.id);
    return result ? NextResponse.json(result) : NextResponse.json({ error: "not found or disabled" }, { status: 404 });
  }
  const r = createAutomation(body.name, body.trigger, body.conditions || [], body.actions || []);
  return NextResponse.json(r, { status: 201 });
}
