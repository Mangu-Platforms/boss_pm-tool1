import { listMilestones } from "./milestones";

export type TimelineEvent = {
  id: string;
  title: string;
  date: string;
  type: "milestone_start" | "milestone_due" | "milestone_completed";
  milestone_id: string;
  status: string;
};

export function milestoneTimeline(): TimelineEvent[] {
  const milestones = listMilestones();
  const events: TimelineEvent[] = [];

  milestones.forEach((m) => {
    if (m.due_on) {
      events.push({
        id: `${m.id}-due`,
        title: `${m.name} due`,
        date: m.due_on,
        type: m.status === "completed" ? "milestone_completed" : "milestone_due",
        milestone_id: m.id,
        status: m.status,
      });
    }
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function upcomingMilestones(days: number = 30): TimelineEvent[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + days);
  return milestoneTimeline().filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= cutoff;
  });
}

export function overdueMilestones(): TimelineEvent[] {
  const now = new Date().toISOString().split("T")[0];
  return milestoneTimeline().filter((e) => e.date < now && e.status !== "completed");
}

export function timelineStats(): { total: number; upcoming: number; overdue: number; completed: number } {
  const events = milestoneTimeline();
  const now = new Date().toISOString().split("T")[0];
  return {
    total: events.length,
    upcoming: events.filter((e) => e.date >= now && e.status !== "completed").length,
    overdue: events.filter((e) => e.date < now && e.status !== "completed").length,
    completed: events.filter((e) => e.status === "completed").length,
  };
}
