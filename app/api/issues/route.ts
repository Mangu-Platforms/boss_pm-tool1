import { NextResponse } from "next/server";
import { dbCreateIssue, dbListIssues, dbListProducts } from "@/lib/db";
import { validateCreate } from "@/lib/store";
import type { CreateIssueInput } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const product = url.searchParams.get("product") || undefined;
  const [issues, products] = await Promise.all([
    dbListIssues(product),
    dbListProducts(),
  ]);
  return NextResponse.json({ issues, products });
}

export async function POST(req: Request) {
  let body: CreateIssueInput;
  try {
    body = (await req.json()) as CreateIssueInput;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const err = validateCreate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  try {
    const issue = await dbCreateIssue(body);
    return NextResponse.json({ issue }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "create failed" },
      { status: 400 }
    );
  }
}
