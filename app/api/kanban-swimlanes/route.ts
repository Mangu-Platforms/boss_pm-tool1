import { NextRequest, NextResponse } from "next/server";
import { swimlanedBoard, boardStats } from "@/lib/kanban-swimlanes";
import type { SwimlaneCriteria } from "@/lib/kanban-swimlanes";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("stats") !== null) {
    return NextResponse.json(boardStats());
  }
  const criteria = (req.nextUrl.searchParams.get("criteria") || "none") as SwimlaneCriteria;
  return NextResponse.json(swimlanedBoard(criteria));
}
