import type { IssuePriority } from "@/lib/types";

const LABELS: Record<IssuePriority, { text: string; cls: string }> = {
  critical: { text: "CRIT", cls: "priority-badge priority-badge-critical" },
  high: { text: "HIGH", cls: "priority-badge priority-badge-high" },
  medium: { text: "MED", cls: "priority-badge priority-badge-medium" },
  low: { text: "LOW", cls: "priority-badge priority-badge-low" },
};

export function PriorityBadge({ priority }: { priority?: IssuePriority }) {
  if (!priority) return null;
  const { text, cls } = LABELS[priority] ?? LABELS.medium;
  return <span className={cls}>{text}</span>;
}
