import { listIssues } from "./store";
import { listMilestones } from "./milestones";

export type GanttItem = {
  id: string;
  title: string;
  type: "issue" | "milestone";
  start_date: string | null;
  end_date: string | null;
  status: string;
  priority?: string;
  progress: number;
};

export function ganttItems(): GanttItem[] {
  const items: GanttItem[] = [];

  const issues = listIssues();
  for (const iss of issues) {
    const progress = iss.status === "done" ? 100 : iss.status === "doing" ? 50 : iss.status === "open" ? 10 : 0;
    items.push({
      id: iss.id,
      title: iss.title,
      type: "issue",
      start_date: iss.created_at,
      end_date: iss.due_on,
      status: iss.status,
      priority: iss.priority,
      progress,
    });
  }

  const milestones = listMilestones();
  for (const ms of milestones) {
    items.push({
      id: ms.id,
      title: ms.name,
      type: "milestone",
      start_date: ms.created_at,
      end_date: ms.due_on,
      status: ms.status,
      progress: ms.status === "completed" ? 100 : 50,
    });
  }

  items.sort((a, b) => {
    const aDate = a.start_date || "9999";
    const bDate = b.start_date || "9999";
    return aDate.localeCompare(bDate);
  });

  return items;
}

export function ganttDateRange(): { min: string; max: string } {
  const items = ganttItems();
  let min = "9999-12-31";
  let max = "0000-01-01";
  for (const item of items) {
    if (item.start_date && item.start_date < min) min = item.start_date;
    if (item.end_date && item.end_date > max) max = item.end_date;
    if (item.start_date && item.start_date > max) max = item.start_date;
  }
  return { min, max };
}
