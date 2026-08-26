import { listSprints, issuesForSprint } from "./sprints";

export type BurndownPoint = {
  date: string;
  remaining: number;
  ideal: number;
};

export function calculateBurndown(
  sprintId: string,
  startDate: string,
  endDate: string,
  doneIssueIds: string[],
  today: string
): BurndownPoint[] {
  const issueIds = issuesForSprint(sprintId);
  const total = issueIds.length;
  if (total === 0) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date(today);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const points: BurndownPoint[] = [];
  const doneSet = new Set(doneIssueIds);
  const doneInSprint = issueIds.filter((id) => doneSet.has(id)).length;

  const daysElapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const activeDays = Math.min(daysElapsed, totalDays);

  for (let day = 0; day <= totalDays; day++) {
    const d = new Date(start);
    d.setDate(d.getDate() + day);
    const dateStr = d.toISOString().split("T")[0];
    const ideal = total - (total * day) / totalDays;

    let remaining: number;
    if (day <= activeDays) {
      // Approximate linear progress for done items up to today
      const progressAtDay = day <= 0 ? 0 : Math.round((doneInSprint * day) / activeDays);
      remaining = total - progressAtDay;
    } else {
      remaining = total - doneInSprint;
    }

    points.push({
      date: dateStr,
      remaining: Math.max(0, Math.round(remaining)),
      ideal: Math.max(0, Math.round(ideal * 10) / 10),
    });
  }

  return points;
}

export function sprintVelocity(sprintId: string, doneIssueIds: string[]): { total: number; completed: number; velocity: number } {
  const issueIds = issuesForSprint(sprintId);
  const doneSet = new Set(doneIssueIds);
  const completed = issueIds.filter((id) => doneSet.has(id)).length;
  return { total: issueIds.length, completed, velocity: completed };
}

export function burndownSummary(): { sprint_id: string; sprint_name: string; total_issues: number; done: number; pct: number }[] {
  return listSprints().map((s) => {
    const ids = issuesForSprint(s.id);
    return { sprint_id: s.id, sprint_name: s.name, total_issues: ids.length, done: 0, pct: 0 };
  });
}
