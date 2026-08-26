export type WebhookEvent =
  | "issue.created"
  | "issue.updated"
  | "issue.deleted"
  | "status.changed"
  | "comment.added"
  | "sprint.started"
  | "sprint.completed";

export type WebhookConfig = {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string | null;
  enabled: boolean;
  created_at: string;
  last_triggered_at: string | null;
};

const store: WebhookConfig[] = [
  {
    id: "wh-1",
    name: "Slack notifications",
    url: "https://hooks.slack.example.com/services/T00/B00/xxx",
    events: ["issue.created", "status.changed"],
    secret: null,
    enabled: true,
    created_at: "2025-01-01T00:00:00Z",
    last_triggered_at: null,
  },
];

export function listWebhookConfigs(): WebhookConfig[] {
  return [...store];
}

export function getWebhookConfig(id: string): WebhookConfig | null {
  return store.find((w) => w.id === id) || null;
}

export function createWebhookConfig(name: string, url: string, events: WebhookEvent[], secret?: string): WebhookConfig {
  const wh: WebhookConfig = {
    id: crypto.randomUUID(),
    name,
    url,
    events,
    secret: secret || null,
    enabled: true,
    created_at: new Date().toISOString(),
    last_triggered_at: null,
  };
  store.push(wh);
  return wh;
}

export function updateWebhookConfig(id: string, updates: Partial<Pick<WebhookConfig, "name" | "url" | "events" | "secret" | "enabled">>): WebhookConfig | null {
  const wh = store.find((w) => w.id === id);
  if (!wh) return null;
  if (updates.name !== undefined) wh.name = updates.name;
  if (updates.url !== undefined) wh.url = updates.url;
  if (updates.events !== undefined) wh.events = updates.events;
  if (updates.secret !== undefined) wh.secret = updates.secret;
  if (updates.enabled !== undefined) wh.enabled = updates.enabled;
  return wh;
}

export function deleteWebhookConfig(id: string): boolean {
  const idx = store.findIndex((w) => w.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function markWebhookTriggered(id: string): void {
  const wh = store.find((w) => w.id === id);
  if (wh) wh.last_triggered_at = new Date().toISOString();
}
