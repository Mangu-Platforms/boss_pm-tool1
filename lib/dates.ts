export function dueLabel(dueOn: string | null): { text: string; urgency: "overdue" | "soon" | "normal" | "none" } {
  if (!dueOn) return { text: "—", urgency: "none" };

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const dueStr = dueOn.slice(0, 10);

  if (dueStr === todayStr) return { text: "due today", urgency: "soon" };

  const todayMs = new Date(todayStr + "T00:00:00Z").getTime();
  const dueMs = new Date(dueStr + "T00:00:00Z").getTime();
  const days = Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24));

  if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgency: "overdue" };
  if (days <= 3) return { text: `${days}d left`, urgency: "soon" };
  return { text: dueOn, urgency: "normal" };
}
