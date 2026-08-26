export type ForecastPeriod = "weekly" | "monthly" | "quarterly";
export type ForecastStatus = "on_track" | "at_risk" | "over_capacity" | "under_utilized";

export type CapacityForecast = {
  id: string;
  team: string;
  period: ForecastPeriod;
  period_label: string;
  available_hours: number;
  planned_hours: number;
  actual_hours: number;
  utilization_pct: number;
  status: ForecastStatus;
  notes: string;
  created_at: string;
};

let nextId = 9;

function calcStatus(utilization: number): ForecastStatus {
  if (utilization > 110) return "over_capacity";
  if (utilization > 90) return "at_risk";
  if (utilization < 50) return "under_utilized";
  return "on_track";
}

const forecasts: CapacityForecast[] = [
  { id: "cf-1", team: "platform", period: "monthly", period_label: "Jan 2025", available_hours: 640, planned_hours: 580, actual_hours: 560, utilization_pct: 87.5, status: "on_track", notes: "Good velocity", created_at: "2025-01-01T00:00:00Z" },
  { id: "cf-2", team: "platform", period: "monthly", period_label: "Feb 2025", available_hours: 640, planned_hours: 720, actual_hours: 0, utilization_pct: 112.5, status: "over_capacity", notes: "Need to defer some work", created_at: "2025-01-15T00:00:00Z" },
  { id: "cf-3", team: "frontend", period: "monthly", period_label: "Jan 2025", available_hours: 480, planned_hours: 400, actual_hours: 410, utilization_pct: 85.4, status: "on_track", notes: "Slightly ahead", created_at: "2025-01-01T00:00:00Z" },
  { id: "cf-4", team: "frontend", period: "monthly", period_label: "Feb 2025", available_hours: 480, planned_hours: 460, actual_hours: 0, utilization_pct: 95.8, status: "at_risk", notes: "Tight capacity", created_at: "2025-01-15T00:00:00Z" },
  { id: "cf-5", team: "data", period: "monthly", period_label: "Jan 2025", available_hours: 320, planned_hours: 140, actual_hours: 135, utilization_pct: 43.8, status: "under_utilized", notes: "Team ramping up", created_at: "2025-01-01T00:00:00Z" },
  { id: "cf-6", team: "data", period: "quarterly", period_label: "Q1 2025", available_hours: 960, planned_hours: 800, actual_hours: 135, utilization_pct: 83.3, status: "on_track", notes: "Quarterly outlook", created_at: "2025-01-01T00:00:00Z" },
  { id: "cf-7", team: "infra", period: "monthly", period_label: "Jan 2025", available_hours: 320, planned_hours: 310, actual_hours: 305, utilization_pct: 96.9, status: "at_risk", notes: "Near capacity", created_at: "2025-01-01T00:00:00Z" },
  { id: "cf-8", team: "infra", period: "monthly", period_label: "Feb 2025", available_hours: 320, planned_hours: 280, actual_hours: 0, utilization_pct: 87.5, status: "on_track", notes: "Slightly lighter month", created_at: "2025-01-15T00:00:00Z" },
];

export function listForecasts(team?: string, period?: ForecastPeriod, status?: ForecastStatus): CapacityForecast[] {
  let result = [...forecasts];
  if (team) result = result.filter((f) => f.team === team);
  if (period) result = result.filter((f) => f.period === period);
  if (status) result = result.filter((f) => f.status === status);
  return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getForecast(id: string): CapacityForecast | null {
  return forecasts.find((f) => f.id === id) || null;
}

export function createForecast(team: string, period: ForecastPeriod, period_label: string, available_hours: number, planned_hours: number, notes?: string): CapacityForecast {
  const utilization_pct = Math.round((planned_hours / available_hours) * 1000) / 10;
  const f: CapacityForecast = {
    id: `cf-${nextId++}`,
    team,
    period,
    period_label,
    available_hours,
    planned_hours,
    actual_hours: 0,
    utilization_pct,
    status: calcStatus(utilization_pct),
    notes: notes || "",
    created_at: new Date().toISOString(),
  };
  forecasts.push(f);
  return f;
}

export function updateForecast(id: string, updates: Partial<Pick<CapacityForecast, "planned_hours" | "actual_hours" | "notes">>): CapacityForecast | null {
  const f = forecasts.find((fc) => fc.id === id);
  if (!f) return null;
  if (updates.planned_hours !== undefined) f.planned_hours = updates.planned_hours;
  if (updates.actual_hours !== undefined) f.actual_hours = updates.actual_hours;
  if (updates.notes !== undefined) f.notes = updates.notes;
  f.utilization_pct = Math.round((f.planned_hours / f.available_hours) * 1000) / 10;
  f.status = calcStatus(f.utilization_pct);
  return f;
}

export function deleteForecast(id: string): boolean {
  const idx = forecasts.findIndex((f) => f.id === id);
  if (idx === -1) return false;
  forecasts.splice(idx, 1);
  return true;
}

export function teamSummary(team: string) {
  const teamForecasts = forecasts.filter((f) => f.team === team);
  const avg_utilization = teamForecasts.length ? Math.round(teamForecasts.reduce((s, f) => s + f.utilization_pct, 0) / teamForecasts.length * 10) / 10 : 0;
  const total_planned = teamForecasts.reduce((s, f) => s + f.planned_hours, 0);
  const total_available = teamForecasts.reduce((s, f) => s + f.available_hours, 0);
  return { team, periods: teamForecasts.length, avg_utilization, total_planned, total_available };
}
