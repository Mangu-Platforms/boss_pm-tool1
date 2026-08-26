import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbListProducts } from "@/lib/db";
import { listSettings, getSetting, updateSetting, settingsByCategory } from "@/lib/settings";
import type { SettingCategory } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key) {
    const s = getSetting(key);
    return s ? NextResponse.json(s) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const grouped = req.nextUrl.searchParams.get("grouped");
  if (grouped === "true") return NextResponse.json(settingsByCategory());
  const category = (req.nextUrl.searchParams.get("category") as SettingCategory) || undefined;
  if (category) return NextResponse.json(listSettings(category));

  const sb = supabaseAdmin();
  const products = await dbListProducts();
  return NextResponse.json({
    supabase_connected: sb !== null,
    github_connected: !!process.env.GITHUB_TOKEN,
    github_owner: process.env.GITHUB_OWNER || null,
    product_count: products.length,
    settings: listSettings(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "update" && body.key) {
    const s = updateSetting(body.key, body.value);
    return s ? NextResponse.json(s) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
