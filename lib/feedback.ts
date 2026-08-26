export type FeedbackType = "feature_request" | "bug_report" | "praise" | "complaint" | "suggestion";
export type FeedbackStatus = "new" | "reviewed" | "planned" | "implemented" | "wont_do";

export type Feedback = {
  id: string;
  type: FeedbackType;
  title: string;
  body: string;
  submitter: string;
  status: FeedbackStatus;
  votes: number;
  tags: string[];
  created_at: string;
};

const store: Feedback[] = [
  {
    id: "fb-1",
    type: "feature_request",
    title: "Dark mode support",
    body: "Would love a toggle for light/dark themes",
    submitter: "customer@example.com",
    status: "planned",
    votes: 12,
    tags: ["ui", "accessibility"],
    created_at: "2025-02-01T00:00:00.000Z",
  },
  {
    id: "fb-2",
    type: "bug_report",
    title: "Export CSV broken on Safari",
    body: "The CSV export button does nothing on Safari 17",
    submitter: "user@company.co",
    status: "reviewed",
    votes: 5,
    tags: ["export", "browser"],
    created_at: "2025-02-10T00:00:00.000Z",
  },
  {
    id: "fb-3",
    type: "praise",
    title: "Love the new dashboard",
    body: "The recent dashboard update is fantastic, great job!",
    submitter: "happy@user.io",
    status: "reviewed",
    votes: 3,
    tags: ["dashboard"],
    created_at: "2025-02-15T00:00:00.000Z",
  },
];

export function listFeedback(status?: FeedbackStatus): Feedback[] {
  let items = [...store];
  if (status) items = items.filter((f) => f.status === status);
  return items.sort((a, b) => b.votes - a.votes);
}

export function getFeedback(id: string): Feedback | null {
  return store.find((f) => f.id === id) || null;
}

export function createFeedback(type: FeedbackType, title: string, body: string, submitter = "anonymous", tags: string[] = []): Feedback {
  const fb: Feedback = {
    id: `fb-${crypto.randomUUID().slice(0, 8)}`,
    type,
    title: title.trim(),
    body,
    submitter,
    status: "new",
    votes: 0,
    tags,
    created_at: new Date().toISOString(),
  };
  store.push(fb);
  return fb;
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus): Feedback | null {
  const fb = store.find((f) => f.id === id);
  if (!fb) return null;
  fb.status = status;
  return fb;
}

export function voteFeedback(id: string): boolean {
  const fb = store.find((f) => f.id === id);
  if (!fb) return false;
  fb.votes++;
  return true;
}

export function deleteFeedback(id: string): boolean {
  const idx = store.findIndex((f) => f.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function feedbackStats(): { type: FeedbackType; count: number }[] {
  const counts: Record<FeedbackType, number> = { feature_request: 0, bug_report: 0, praise: 0, complaint: 0, suggestion: 0 };
  for (const f of store) counts[f.type]++;
  return Object.entries(counts).map(([type, count]) => ({ type: type as FeedbackType, count }));
}
