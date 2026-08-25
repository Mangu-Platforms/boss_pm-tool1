import { NextResponse } from "next/server";
import { dbListIssues, dbListProducts } from "@/lib/db";

const START_TIME = Date.now();

export async function GET() {
  const [issues, products] = await Promise.all([dbListIssues(), dbListProducts()]);
  const memUsage = process.memoryUsage();

  return NextResponse.json({
    status: "ok",
    ts: new Date().toISOString(),
    uptime_seconds: Math.round((Date.now() - START_TIME) / 1000),
    memory_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
    issues_count: issues.length,
    products_count: products.length,
  });
}
