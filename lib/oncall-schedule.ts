export type OncallRotation = "primary" | "secondary" | "escalation";

export type OncallShift = {
  id: string;
  member: string;
  rotation: OncallRotation;
  start_date: string;
  end_date: string;
  team: string;
  swap_requested: boolean;
};

export type OncallOverride = {
  id: string;
  original_member: string;
  override_member: string;
  date: string;
  reason: string;
};

const shifts: OncallShift[] = [
  { id: "oc-1", member: "max", rotation: "primary", start_date: "2025-08-25", end_date: "2025-08-31", team: "platform", swap_requested: false },
  { id: "oc-2", member: "sami", rotation: "secondary", start_date: "2025-08-25", end_date: "2025-08-31", team: "platform", swap_requested: false },
  { id: "oc-3", member: "priya", rotation: "primary", start_date: "2025-09-01", end_date: "2025-09-07", team: "platform", swap_requested: false },
  { id: "oc-4", member: "carlos", rotation: "primary", start_date: "2025-08-25", end_date: "2025-08-31", team: "data", swap_requested: true },
  { id: "oc-5", member: "max", rotation: "escalation", start_date: "2025-08-25", end_date: "2025-09-07", team: "platform", swap_requested: false },
];

const overrides: OncallOverride[] = [
  { id: "oco-1", original_member: "carlos", override_member: "sami", date: "2025-08-27", reason: "PTO" },
];

let nextShiftId = 6;
let nextOverrideId = 2;

export function listShifts(team?: string, date?: string): OncallShift[] {
  let result = [...shifts];
  if (team) result = result.filter((s) => s.team === team);
  if (date) result = result.filter((s) => s.start_date <= date && s.end_date >= date);
  return result.sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export function getShift(id: string): OncallShift | null {
  return shifts.find((s) => s.id === id) || null;
}

export function createShift(member: string, rotation: OncallRotation, startDate: string, endDate: string, team: string): OncallShift {
  const shift: OncallShift = { id: `oc-${nextShiftId++}`, member, rotation, start_date: startDate, end_date: endDate, team, swap_requested: false };
  shifts.push(shift);
  return shift;
}

export function requestSwap(id: string): OncallShift | null {
  const shift = shifts.find((s) => s.id === id);
  if (!shift) return null;
  shift.swap_requested = true;
  return shift;
}

export function currentOncall(team: string): { primary: string | null; secondary: string | null; escalation: string | null } {
  const today = new Date().toISOString().slice(0, 10);
  const active = shifts.filter((s) => s.team === team && s.start_date <= today && s.end_date >= today);
  return {
    primary: active.find((s) => s.rotation === "primary")?.member || null,
    secondary: active.find((s) => s.rotation === "secondary")?.member || null,
    escalation: active.find((s) => s.rotation === "escalation")?.member || null,
  };
}

export function listOverrides(date?: string): OncallOverride[] {
  let result = [...overrides];
  if (date) result = result.filter((o) => o.date === date);
  return result;
}

export function createOverride(originalMember: string, overrideMember: string, date: string, reason: string): OncallOverride {
  const ov: OncallOverride = { id: `oco-${nextOverrideId++}`, original_member: originalMember, override_member: overrideMember, date, reason };
  overrides.push(ov);
  return ov;
}

export function deleteShift(id: string): boolean {
  const idx = shifts.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  shifts.splice(idx, 1);
  return true;
}
