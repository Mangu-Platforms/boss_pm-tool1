import { NextResponse } from "next/server";
import { dbListProducts, dbCreateProduct } from "@/lib/db";

export async function GET() {
  const products = await dbListProducts();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  if (!body.slug?.trim()) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  if (!["cash-engine", "lab"].includes(body.engine_tag)) {
    return NextResponse.json({ error: "engine_tag must be cash-engine or lab" }, { status: 400 });
  }

  try {
    const product = await dbCreateProduct(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "create failed" },
      { status: 400 }
    );
  }
}
