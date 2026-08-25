import { NextResponse } from "next/server";
import { createIssue, listIssues, listProducts, validateCreate } from "@/lib/store";
import type { CreateIssueInput } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const product = url.searchParams.get("product") || undefined;
  return NextResponse.json({ issues: listIssues(product), products: listProducts() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreateIssueInput;
  const err = validateCreate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  const issue = createIssue(body);
  return NextResponse.json({ issue }, { status: 201 });
}
