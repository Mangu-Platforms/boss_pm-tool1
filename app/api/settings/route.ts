import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbListProducts } from "@/lib/db";

export async function GET() {
  const sb = supabaseAdmin();
  const products = await dbListProducts();

  return NextResponse.json({
    supabase_connected: sb !== null,
    github_connected: !!process.env.GITHUB_TOKEN,
    github_owner: process.env.GITHUB_OWNER || null,
    product_count: products.length,
  });
}
