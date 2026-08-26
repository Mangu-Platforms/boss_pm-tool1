export type AvailabilityStatus = "available" | "busy" | "off" | "partial";

export type TeamMemberAvailability = {
  id: string;
  member: string;
  date: string;
  status: AvailabilityStatus;
  hours: number;
  note: string;
};

let nextId = 7;
function genId() { return `avail-${nextId++}`; }

const store: TeamMemberAvailability[] = [
  { id: "avail-1", member: "max", date: "2025-09-01", status: "available", hours: 8, note: "" },
  { id: "avail-2", member: "max", date: "2025-09-02", status: "partial", hours: 4, note: "Doctor appt" },
  { id: "avail-3", member: "alice", date: "2025-09-01", status: "available", hours: 8, note: "" },
  { id: "avail-4", member: "alice", date: "2025-09-02", status: "available", hours: 8, note: "" },
  { id: "avail-5", member: "bob", date: "2025-09-01", status: "off", hours: 0, note: "PTO" },
  { id: "avail-6", member: "bob", date: "2025-09-02", status: "available", hours: 8, note: "" },
];

export function listAvailability(member?: string, date?: string): TeamMemberAvailability[] {
  let result = [...store];
  if (member) result = result.filter((a) => a.member === member);
  if (date) result = result.filter((a) => a.date === date);
  return result;
}

export function setAvailability(member: string, date: string, status: AvailabilityStatus, hours: number, note = ""): TeamMemberAvailability {
  const existing = store.find((a) => a.member === member && a.date === date);
  if (existing) {
    existing.status = status;
    existing.hours = hours;
    existing.note = note;
    return existing;
  }
  const a: TeamMemberAvailability = { id: genId(), member, date, status, hours, note };
  store.push(a);
  return a;
}

export function teamCapacity(date: string): { total_hours: number; available_members: number; off_members: string[] } {
  const entries = store.filter((a) => a.date === date);
  const total_hours = entries.reduce((sum, a) => sum + a.hours, 0);
  const available_members = entries.filter((a) => a.status !== "off").length;
  const off_members = entries.filter((a) => a.status === "off").map((a) => a.member);
  return { total_hours, available_members, off_members };
}

export function weeklyCapacity(member: string, startDate: string): { dates: string[]; total_hours: number; avg_hours: number } {
  const start = new Date(startDate);
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    dates.push(d.toISOString().split("T")[0]);
  }
  const entries = store.filter((a) => a.member === member && dates.includes(a.date));
  const total_hours = entries.reduce((sum, a) => sum + a.hours, 0);
  return { dates, total_hours, avg_hours: dates.length ? Math.round(total_hours / dates.length) : 0 };
}
