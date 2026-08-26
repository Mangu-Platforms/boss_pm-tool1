import { NextRequest, NextResponse } from "next/server";
import { listFlags, getFlag, getFlagByKey, createFlag, updateFlag, deleteFlag, evaluateFlag } from "@/lib/feature-flags";
import type { FlagEnvironment, FlagStrategy } from "@/lib/feature-flags";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const flag = getFlag(id);
    return flag ? NextResponse.json(flag) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const key = req.nextUrl.searchParams.get("key");
  if (key) {
    const flag = getFlagByKey(key);
    return flag ? NextResponse.json(flag) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const evalKey = req.nextUrl.searchParams.get("evaluate");
  const userId = req.nextUrl.searchParams.get("user_id");
  if (evalKey && userId) {
    return NextResponse.json({ key: evalKey, enabled: evaluateFlag(evalKey, userId) });
  }
  const env = req.nextUrl.searchParams.get("env") as FlagEnvironment | undefined;
  return NextResponse.json(listFlags(env || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteFlag(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const flag = updateFlag(body.id, body.updates);
    return flag ? NextResponse.json(flag) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const flag = createFlag(body.key, body.name, body.description || "", body.strategy as FlagStrategy, body.owner || "max");
  return NextResponse.json(flag, { status: 201 });
}
