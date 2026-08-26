export type WidgetType = "counter" | "chart" | "list" | "progress" | "table";

export type DashboardWidget = {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
};

export type Dashboard = {
  id: string;
  name: string;
  owner: string;
  is_default: boolean;
  widgets: DashboardWidget[];
  created_at: string;
};

let nextDashId = 3;
let nextWidgetId = 6;
function dashId() { return `dash-${nextDashId++}`; }
function widgetId() { return `dw-${nextWidgetId++}`; }

const store: Dashboard[] = [
  {
    id: "dash-1", name: "Overview", owner: "max", is_default: true,
    created_at: "2025-01-01T00:00:00Z",
    widgets: [
      { id: "dw-1", type: "counter", title: "Open Issues", config: { status: "open" }, position: { x: 0, y: 0, w: 3, h: 2 } },
      { id: "dw-2", type: "counter", title: "In Progress", config: { status: "doing" }, position: { x: 3, y: 0, w: 3, h: 2 } },
      { id: "dw-3", type: "chart", title: "Issues by Priority", config: { chart_type: "pie", field: "priority" }, position: { x: 0, y: 2, w: 6, h: 4 } },
    ],
  },
  {
    id: "dash-2", name: "Team View", owner: "max", is_default: false,
    created_at: "2025-02-01T00:00:00Z",
    widgets: [
      { id: "dw-4", type: "list", title: "Recent Activity", config: { limit: 10 }, position: { x: 0, y: 0, w: 6, h: 4 } },
      { id: "dw-5", type: "progress", title: "Sprint Progress", config: { sprint_id: "sprint-1" }, position: { x: 0, y: 4, w: 6, h: 2 } },
    ],
  },
];

export function listDashboards(owner?: string): Dashboard[] {
  if (owner) return store.filter((d) => d.owner === owner);
  return [...store];
}

export function getDashboard(id: string): Dashboard | null {
  return store.find((d) => d.id === id) || null;
}

export function createDashboard(name: string, owner: string): Dashboard {
  const d: Dashboard = { id: dashId(), name, owner, is_default: false, widgets: [], created_at: new Date().toISOString() };
  store.push(d);
  return d;
}

export function addWidget(dashboardId: string, type: WidgetType, title: string, config: Record<string, unknown>, position: DashboardWidget["position"]): Dashboard | null {
  const d = store.find((dash) => dash.id === dashboardId);
  if (!d) return null;
  d.widgets.push({ id: widgetId(), type, title, config, position });
  return d;
}

export function removeWidget(dashboardId: string, wId: string): Dashboard | null {
  const d = store.find((dash) => dash.id === dashboardId);
  if (!d) return null;
  const idx = d.widgets.findIndex((w) => w.id === wId);
  if (idx === -1) return null;
  d.widgets.splice(idx, 1);
  return d;
}

export function deleteDashboard(id: string): boolean {
  const idx = store.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function getDefaultDashboard(owner: string): Dashboard | null {
  return store.find((d) => d.owner === owner && d.is_default) || null;
}
