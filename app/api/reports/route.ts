import { NextResponse } from "next/server";
import { generateReport, listReportTypes } from "@/lib/reports";
import type { ReportType } from "@/lib/reports";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") as ReportType | null;

  if (!type) {
    return NextResponse.json({ report_types: listReportTypes() });
  }

  try {
    const report = generateReport(type);
    return NextResponse.json({ report });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
