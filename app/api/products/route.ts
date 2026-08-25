import { NextResponse } from "next/server";
import { listProducts } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ products: listProducts() });
}
