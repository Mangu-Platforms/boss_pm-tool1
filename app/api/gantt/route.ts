import { NextRequest, NextResponse } from "next/server";
import { ganttItems, ganttDateRange } from "@/lib/gantt";

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range");
  if (range === "true") return NextResponse.json(ganttDateRange());
  return NextResponse.json(ganttItems());
}
