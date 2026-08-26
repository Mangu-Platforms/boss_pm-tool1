"use client";

import { useEffect, useState } from "react";

type LeaveRequest = {
  id: string;
  member: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  approver: string | null;
  created_at: string;
};

const typeLabels: Record<string, string> = {
  vacation: "Vacation",
  sick: "Sick Leave",
  personal: "Personal",
  conference: "Conference",
  other: "Other",
};

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [newMember, setNewMember] = useState("");
  const [newType, setNewType] = useState("vacation");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    fetch("/api/leave")
      .then((r) => r.json())
      .then((data) => setRequests(data.leave || []));
  }, []);

  async function refresh() {
    const data = await fetch("/api/leave").then((r) => r.json());
    setRequests(data.leave || []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newMember.trim() || !newStart || !newEnd) return;
    await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member: newMember.trim(), type: newType, start_date: newStart, end_date: newEnd, reason: newReason }),
    });
    setNewMember("");
    setNewReason("");
    setNewStart("");
    setNewEnd("");
    await refresh();
  }

  async function handleAction(id: string, action: string) {
    await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    await refresh();
  }

  const statusColors: Record<string, string> = { pending: "gold", approved: "green", rejected: "red" };

  return (
    <main>
      <div className="kicker">People</div>
      <h1>Leave Tracker</h1>
      <p className="lede">Request, approve, and track team time off.</p>

      <div className="leave-list">
        {requests.map((req) => (
          <div key={req.id} className={`leave-card leave-${req.status}`}>
            <div className="leave-header">
              <span className="leave-member">{req.member}</span>
              <span className="leave-type">{typeLabels[req.type] || req.type}</span>
              <span className={`priority ${statusColors[req.status] || ""}`}>{req.status}</span>
            </div>
            <div className="leave-dates">
              <span className="mono">{req.start_date}</span>
              <span className="hint">to</span>
              <span className="mono">{req.end_date}</span>
            </div>
            {req.reason && <p className="leave-reason">{req.reason}</p>}
            <div className="leave-actions">
              {req.approver && <span className="hint">By {req.approver}</span>}
              {req.status === "pending" && (
                <>
                  <button className="go" onClick={() => handleAction(req.id, "approve")}>Approve</button>
                  <button className="subtle-btn" onClick={() => handleAction(req.id, "reject")}>Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Request Leave</h2>
      <form className="leave-form" onSubmit={handleCreate}>
        <input placeholder="Your name" value={newMember} onChange={(e) => setNewMember(e.target.value)} required />
        <select value={newType} onChange={(e) => setNewType(e.target.value)}>
          <option value="vacation">Vacation</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal</option>
          <option value="conference">Conference</option>
          <option value="other">Other</option>
        </select>
        <div className="leave-date-row">
          <label>Start <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} required /></label>
          <label>End <input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} required /></label>
        </div>
        <textarea placeholder="Reason (optional)" value={newReason} onChange={(e) => setNewReason(e.target.value)} rows={1} />
        <button className="go" type="submit" disabled={!newMember.trim() || !newStart || !newEnd}>Submit</button>
      </form>
    </main>
  );
}
