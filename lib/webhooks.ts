export type WebhookEvent = "issue.created" | "issue.updated" | "issue.deleted" | "sprint.started" | "sprint.completed" | "release.published" | "comment.created";

export type Webhook = {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  created_at: string;
  last_triggered_at: string | null;
};

const webhooks: Webhook[] = [
  {
    id: "wh-1",
    name: "Slack Notifications",
    url: "https://hooks.slack.example.com/services/BOSS/PM",
    events: ["issue.created", "issue.updated"],
    secret: "whsec_example123",
    active: true,
    created_at: "2025-01-15T00:00:00.000Z",
    last_triggered_at: "2025-03-10T08:00:00.000Z",
  },
  {
    id: "wh-2",
    name: "CI Trigger",
    url: "https://ci.example.com/webhooks/boss",
    events: ["release.published"],
    secret: "whsec_ci456",
    active: true,
    created_at: "2025-02-01T00:00:00.000Z",
    last_triggered_at: "2025-03-09T12:00:00.000Z",
  },
];

export function listWebhooks(): Webhook[] {
  return webhooks.map((w) => ({ ...w, secret: "***" }));
}

export function getWebhook(id: string): Webhook | null {
  const wh = webhooks.find((w) => w.id === id);
  return wh ? { ...wh } : null;
}

export function createWebhook(name: string, url: string, events: WebhookEvent[]): Webhook {
  const wh: Webhook = {
    id: `wh-${crypto.randomUUID().slice(0, 8)}`,
    name,
    url,
    events,
    secret: `whsec_${crypto.randomUUID().slice(0, 16)}`,
    active: true,
    created_at: new Date().toISOString(),
    last_triggered_at: null,
  };
  webhooks.push(wh);
  return wh;
}

export function updateWebhook(id: string, updates: Partial<Pick<Webhook, "name" | "url" | "events" | "active">>): Webhook | null {
  const wh = webhooks.find((w) => w.id === id);
  if (!wh) return null;
  if (updates.name !== undefined) wh.name = updates.name;
  if (updates.url !== undefined) wh.url = updates.url;
  if (updates.events !== undefined) wh.events = updates.events;
  if (updates.active !== undefined) wh.active = updates.active;
  return { ...wh };
}

export function deleteWebhook(id: string): boolean {
  const idx = webhooks.findIndex((w) => w.id === id);
  if (idx === -1) return false;
  webhooks.splice(idx, 1);
  return true;
}

export function triggerWebhook(id: string): Webhook | null {
  const wh = webhooks.find((w) => w.id === id);
  if (!wh) return null;
  wh.last_triggered_at = new Date().toISOString();
  return { ...wh };
}
