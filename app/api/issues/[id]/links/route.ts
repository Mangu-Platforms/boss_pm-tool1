import { NextResponse } from "next/server";
import { dbListLinks } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allLinks = await dbListLinks();
  const issueLinks = allLinks.filter((l) => l.issue_id === id);
  return NextResponse.json({ links: issueLinks });
}
