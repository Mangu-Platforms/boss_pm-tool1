import { NextResponse } from "next/server";
import { projectHealth } from "@/lib/project-health";

export async function GET() {
  return NextResponse.json(projectHealth());
}
