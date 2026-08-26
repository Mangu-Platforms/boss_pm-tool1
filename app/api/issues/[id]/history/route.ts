import { NextResponse } from "next/server";
import { issueHistory } from "@/lib/history";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const history = issueHistory(id);
  return NextResponse.json({ history });
}
