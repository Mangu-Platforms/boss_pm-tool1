import { NextResponse } from "next/server";
import { getFieldValues, setFieldValue, clearFieldValue } from "@/lib/custom-fields";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const values = getFieldValues(id);
  return NextResponse.json({ values });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.field_id) {
    return NextResponse.json({ error: "field_id required" }, { status: 400 });
  }
  if (body.value === null || body.value === undefined || body.value === "") {
    clearFieldValue(id, body.field_id);
  } else {
    setFieldValue(id, body.field_id, String(body.value));
  }
  return NextResponse.json({ values: getFieldValues(id) });
}
