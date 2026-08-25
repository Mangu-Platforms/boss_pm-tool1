"use client";

import type { IssueStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: IssueStatus | string }) {
  return <span className={`status ${status}`}>{status}</span>;
}
