import { NextResponse } from "next/server";
import { listCustomFields, createCustomField, deleteCustomField } from "@/lib/custom-fields";

export async function GET() {
  return NextResponse.json({ fields: listCustomFields() });
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
  const validTypes = ["text", "number", "select", "url", "date"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: `type must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }
  const field = createCustomField(body.name.trim(), body.type, body.options, body.required);
  return NextResponse.json({ field }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteCustomField(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
