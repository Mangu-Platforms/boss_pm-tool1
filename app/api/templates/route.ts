import { NextResponse } from "next/server";
import { TEMPLATES } from "@/lib/templates";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const tpl = TEMPLATES.find((t) => t.id === id);
    return tpl ? NextResponse.json({ template: tpl }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ templates: TEMPLATES });
}
