export type WidgetType = "chart" | "table" | "metric" | "list" | "progress";
export type ChartKind = "bar" | "line" | "pie" | "donut";

export type DashboardWidget = {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, string>;
  position: { x: number; y: number; w: number; h: number };
};

export type CustomDashboard = {
  id: string;
  name: string;
  description: string;
  owner: string;
  widgets: DashboardWidget[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

let nextId = 4;
let nextWidgetId = 10;
function genId() { return `dash-${nextId++}`; }
function genWidgetId() { return `w-${nextWidgetId++}`; }

const store: CustomDashboard[] = [
  {
    id: "dash-1", name: "Sprint Overview", description: "Key sprint metrics at a glance", owner: "max",
    widgets: [
      { id: "w-1", type: "metric", title: "Open Issues", config: { source: "issues", filter: "open" }, position: { x: 0, y: 0, w: 4, h: 2 } },
      { id: "w-2", type: "chart", title: "Status Distribution", config: { source: "issues", chart: "pie" }, position: { x: 4, y: 0, w: 4, h: 4 } },
      { id: "w-3", type: "progress", title: "Sprint Progress", config: { source: "sprint" }, position: { x: 0, y: 2, w: 4, h: 2 } },
    ],
    is_default: true, created_at: "2025-02-01T10:00:00Z", updated_at: "2025-03-15T10:00:00Z",
  },
  {
    id: "dash-2", name: "Team Performance", description: "Track team velocity and workload", owner: "max",
    widgets: [
      { id: "w-4", type: "chart", title: "Velocity Trend", config: { source: "velocity", chart: "line" }, position: { x: 0, y: 0, w: 8, h: 4 } },
      { id: "w-5", type: "table", title: "Member Workload", config: { source: "workload" }, position: { x: 0, y: 4, w: 8, h: 4 } },
    ],
    is_default: false, created_at: "2025-02-10T10:00:00Z", updated_at: "2025-03-10T10:00:00Z",
  },
  {
    id: "dash-3", name: "Project Health", description: "Overall project health indicators", owner: "alice",
    widgets: [
      { id: "w-6", type: "metric", title: "Health Score", config: { source: "health" }, position: { x: 0, y: 0, w: 3, h: 2 } },
    ],
    is_default: false, created_at: "2025-03-01T10:00:00Z", updated_at: "2025-03-01T10:00:00Z",
  },
];

export function listDashboards(owner?: string): CustomDashboard[] {
  if (owner) return store.filter((d) => d.owner === owner);
  return [...store];
}

export function getDashboard(id: string): CustomDashboard | null {
  return store.find((d) => d.id === id) || null;
}

export function getDefaultDashboard(): CustomDashboard | null {
  return store.find((d) => d.is_default) || null;
}

export function createDashboard(name: string, description: string, owner: string): CustomDashboard {
  const dash: CustomDashboard = {
    id: genId(), name, description, owner, widgets: [],
    is_default: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  store.push(dash);
  return dash;
}

export function updateDashboard(id: string, updates: Partial<Pick<CustomDashboard, "name" | "description" | "is_default">>): CustomDashboard | null {
  const d = store.find((ds) => ds.id === id);
  if (!d) return null;
  if (updates.name !== undefined) d.name = updates.name;
  if (updates.description !== undefined) d.description = updates.description;
  if (updates.is_default === true) {
    store.forEach((ds) => { ds.is_default = false; });
    d.is_default = true;
  }
  d.updated_at = new Date().toISOString();
  return d;
}

export function addWidget(dashboardId: string, type: WidgetType, title: string, config: Record<string, string>): DashboardWidget | null {
  const d = store.find((ds) => ds.id === dashboardId);
  if (!d) return null;
  const widget: DashboardWidget = {
    id: genWidgetId(), type, title, config,
    position: { x: 0, y: d.widgets.length * 4, w: 4, h: 4 },
  };
  d.widgets.push(widget);
  d.updated_at = new Date().toISOString();
  return widget;
}

export function removeWidget(dashboardId: string, widgetId: string): boolean {
  const d = store.find((ds) => ds.id === dashboardId);
  if (!d) return false;
  const idx = d.widgets.findIndex((w) => w.id === widgetId);
  if (idx === -1) return false;
  d.widgets.splice(idx, 1);
  d.updated_at = new Date().toISOString();
  return true;
}

export function deleteDashboard(id: string): boolean {
  const idx = store.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
