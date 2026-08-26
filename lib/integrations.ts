export type IntegrationStatus = "connected" | "disconnected" | "error";

export type Integration = {
  id: string;
  name: string;
  provider: string;
  description: string;
  status: IntegrationStatus;
  config: Record<string, string>;
  connected_at: string | null;
};

const store: Integration[] = [
  {
    id: "int-github",
    name: "GitHub",
    provider: "github",
    description: "Sync issues and PRs with GitHub repositories",
    status: "connected",
    config: { org: "Mangu-Platforms" },
    connected_at: "2025-01-15T00:00:00Z",
  },
  {
    id: "int-slack",
    name: "Slack",
    provider: "slack",
    description: "Send notifications to Slack channels",
    status: "connected",
    config: { workspace: "mangu-team" },
    connected_at: "2025-02-01T00:00:00Z",
  },
  {
    id: "int-linear",
    name: "Linear",
    provider: "linear",
    description: "Import issues from Linear",
    status: "disconnected",
    config: {},
    connected_at: null,
  },
  {
    id: "int-jira",
    name: "Jira",
    provider: "jira",
    description: "Sync with Jira projects",
    status: "disconnected",
    config: {},
    connected_at: null,
  },
  {
    id: "int-figma",
    name: "Figma",
    provider: "figma",
    description: "Embed Figma designs in issues",
    status: "disconnected",
    config: {},
    connected_at: null,
  },
];

export function listIntegrations(): Integration[] {
  return [...store];
}

export function getIntegration(id: string): Integration | null {
  return store.find((i) => i.id === id) || null;
}

export function updateIntegrationStatus(id: string, status: IntegrationStatus, config?: Record<string, string>): Integration | null {
  const integration = store.find((i) => i.id === id);
  if (!integration) return null;
  integration.status = status;
  if (status === "connected") {
    integration.connected_at = new Date().toISOString();
  }
  if (config) {
    integration.config = { ...integration.config, ...config };
  }
  return integration;
}
