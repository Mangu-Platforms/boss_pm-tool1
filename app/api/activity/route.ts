import { NextResponse } from "next/server";
import { getActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const issue_id = url.searchParams.get("issue_id") || undefined;
  const product_id = url.searchParams.get("product_id") || undefined;
  const limit = Number(url.searchParams.get("limit")) || 50;

  const events = getActivity({ issue_id, product_id, limit });
  return NextResponse.json({ events });
}
