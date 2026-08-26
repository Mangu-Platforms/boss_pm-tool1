import { describe, it, expect } from "vitest";
import { listLeaveRequests, getLeaveRequest, createLeaveRequest, approveLeave, rejectLeave, deleteLeaveRequest, getUpcomingLeave } from "@/lib/leave";

describe("leave", () => {
  it("lists default leave requests", () => {
    const requests = listLeaveRequests();
    expect(requests.length).toBeGreaterThanOrEqual(2);
  });

  it("filters by member", () => {
    const requests = listLeaveRequests("Alice");
    for (const r of requests) {
      expect(r.member).toBe("Alice");
    }
  });

  it("creates a leave request", () => {
    const req = createLeaveRequest("Eve", "sick", "2025-04-10", "2025-04-11", "Feeling unwell");
    expect(req.status).toBe("pending");
    expect(req.approver).toBeNull();
  });

  it("approves leave", () => {
    const req = createLeaveRequest("Test", "vacation", "2025-05-01", "2025-05-05");
    const approved = approveLeave(req.id, "Max");
    expect(approved!.status).toBe("approved");
    expect(approved!.approver).toBe("Max");
  });

  it("rejects leave", () => {
    const req = createLeaveRequest("Test2", "personal", "2025-06-01", "2025-06-02");
    const rejected = rejectLeave(req.id, "Max");
    expect(rejected!.status).toBe("rejected");
  });

  it("deletes a leave request", () => {
    const req = createLeaveRequest("Del", "other", "2025-07-01", "2025-07-01");
    expect(deleteLeaveRequest(req.id)).toBe(true);
    expect(getLeaveRequest(req.id)).toBeNull();
  });

  it("gets upcoming leave", () => {
    createLeaveRequest("Future", "conference", "2030-01-01", "2030-01-05");
    approveLeave(listLeaveRequests("Future")[0].id, "Max");
    const upcoming = getUpcomingLeave();
    expect(upcoming.some((l) => l.member === "Future")).toBe(true);
  });
});
