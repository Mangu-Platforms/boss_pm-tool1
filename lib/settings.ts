export type SettingCategory = "general" | "notifications" | "integrations" | "display" | "security";

export type Setting = {
  key: string;
  category: SettingCategory;
  label: string;
  value: string;
  type: "text" | "boolean" | "select" | "number";
  options?: string[];
};

const store: Setting[] = [
  { key: "project.name", category: "general", label: "Project Name", value: "Boss PM", type: "text" },
  { key: "project.timezone", category: "general", label: "Timezone", value: "UTC", type: "select", options: ["UTC", "US/Eastern", "US/Pacific", "Europe/London", "Asia/Tokyo"] },
  { key: "project.language", category: "general", label: "Language", value: "en", type: "select", options: ["en", "es", "fr", "de", "ja"] },
  { key: "notifications.email", category: "notifications", label: "Email Notifications", value: "true", type: "boolean" },
  { key: "notifications.slack", category: "notifications", label: "Slack Notifications", value: "false", type: "boolean" },
  { key: "notifications.digest", category: "notifications", label: "Daily Digest", value: "true", type: "boolean" },
  { key: "display.theme", category: "display", label: "Theme", value: "dark", type: "select", options: ["dark", "light", "auto"] },
  { key: "display.density", category: "display", label: "Density", value: "comfortable", type: "select", options: ["compact", "comfortable", "spacious"] },
  { key: "display.items_per_page", category: "display", label: "Items per Page", value: "25", type: "number" },
  { key: "security.2fa", category: "security", label: "Two-Factor Auth", value: "false", type: "boolean" },
  { key: "security.session_timeout", category: "security", label: "Session Timeout (min)", value: "60", type: "number" },
  { key: "integrations.github", category: "integrations", label: "GitHub Integration", value: "true", type: "boolean" },
  { key: "integrations.webhook_url", category: "integrations", label: "Webhook URL", value: "", type: "text" },
];

export function listSettings(category?: SettingCategory): Setting[] {
  if (category) return store.filter((s) => s.category === category);
  return [...store];
}

export function getSetting(key: string): Setting | null {
  return store.find((s) => s.key === key) || null;
}

export function updateSetting(key: string, value: string): Setting | null {
  const s = store.find((st) => st.key === key);
  if (!s) return null;
  s.value = value;
  return s;
}

export function settingsByCategory(): Record<SettingCategory, Setting[]> {
  const result: Record<string, Setting[]> = {};
  for (const s of store) {
    if (!result[s.category]) result[s.category] = [];
    result[s.category].push(s);
  }
  return result as Record<SettingCategory, Setting[]>;
}
