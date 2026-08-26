import { NextRequest, NextResponse } from "next/server";
import { cloneIssue, bulkClone } from "@/lib/issue-cloning";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "bulk") {
    const results = bulkClone(body.issue_ids || [], body.options || {});
    return NextResponse.json(results, { status: 201 });
  }
  const result = cloneIssue(body.issue_id, body.options || {});
  return result ? NextResponse.json(result, { status: 201 }) : NextResponse.json({ error: "issue not found" }, { status: 404 });
}
