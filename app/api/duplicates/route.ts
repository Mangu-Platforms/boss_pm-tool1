import { NextResponse } from "next/server";
import { dbListIssues } from "@/lib/db";

function similarity(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  if (aLower === bLower) return 1;

  const aWords = new Set(aLower.split(/\s+/));
  const bWords = new Set(bLower.split(/\s+/));
  const intersection = [...aWords].filter((w) => bWords.has(w));
  const union = new Set([...aWords, ...bWords]);
  return intersection.length / union.size;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "";
  const excludeId = searchParams.get("exclude") || "";
  const threshold = parseFloat(searchParams.get("threshold") || "0.5");

  if (!title.trim()) return NextResponse.json({ duplicates: [] });

  const issues = await dbListIssues();
  const candidates = issues
    .filter((i) => i.id !== excludeId)
    .map((i) => ({ issue: i, score: similarity(title, i.title) }))
    .filter((c) => c.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((c) => ({
      id: c.issue.id,
      title: c.issue.title,
      status: c.issue.status,
      score: Math.round(c.score * 100),
    }));

  return NextResponse.json({ duplicates: candidates });
}
