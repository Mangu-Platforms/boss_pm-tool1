export type LeaveType = "vacation" | "sick" | "personal" | "conference" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveRequest = {
  id: string;
  member: string;
  type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approver: string | null;
  created_at: string;
};

const store: LeaveRequest[] = [
  {
    id: "leave-1",
    member: "Alice",
    type: "vacation",
    start_date: "2025-03-17",
    end_date: "2025-03-21",
    reason: "Spring break trip",
    status: "approved",
    approver: "Max",
    created_at: "2025-03-01T00:00:00.000Z",
  },
  {
    id: "leave-2",
    member: "Bob",
    type: "conference",
    start_date: "2025-04-01",
    end_date: "2025-04-03",
    reason: "React Summit",
    status: "pending",
    approver: null,
    created_at: "2025-03-10T00:00:00.000Z",
  },
];

export function listLeaveRequests(member?: string): LeaveRequest[] {
  let items = [...store];
  if (member) items = items.filter((l) => l.member.toLowerCase() === member.toLowerCase());
  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getLeaveRequest(id: string): LeaveRequest | null {
  return store.find((l) => l.id === id) || null;
}

export function createLeaveRequest(member: string, type: LeaveType, startDate: string, endDate: string, reason = ""): LeaveRequest {
  const req: LeaveRequest = {
    id: `leave-${crypto.randomUUID().slice(0, 8)}`,
    member,
    type,
    start_date: startDate,
    end_date: endDate,
    reason,
    status: "pending",
    approver: null,
    created_at: new Date().toISOString(),
  };
  store.push(req);
  return req;
}

export function approveLeave(id: string, approver: string): LeaveRequest | null {
  const req = store.find((l) => l.id === id);
  if (!req) return null;
  req.status = "approved";
  req.approver = approver;
  return req;
}

export function rejectLeave(id: string, approver: string): LeaveRequest | null {
  const req = store.find((l) => l.id === id);
  if (!req) return null;
  req.status = "rejected";
  req.approver = approver;
  return req;
}

export function deleteLeaveRequest(id: string): boolean {
  const idx = store.findIndex((l) => l.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function getUpcomingLeave(): LeaveRequest[] {
  const today = new Date().toISOString().slice(0, 10);
  return store
    .filter((l) => l.status === "approved" && l.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
}
