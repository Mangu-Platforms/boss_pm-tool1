import { NextResponse } from "next/server";
import { dbListProducts } from "@/lib/db";

export async function GET() {
  const products = await dbListProducts();
  return NextResponse.json({ products });
}
