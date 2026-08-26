"use client";

import { useState, useEffect } from "react";

type ResourceAllocation = {
  id: string;
  member: string;
  project_id: string;
  allocation_pct: number;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
};

type OverAlloc = { member: string; total_pct: number };

export default function ResourcePlanningPage() {
  const [allocs, setAllocs] = useState<ResourceAllocation[]>([]);
  const [overAlloc, setOverAlloc] = useState<OverAlloc[]>([]);
  const [member, setMember] = useState("");
  const [projectId, setProjectId] = useState("");
  const [pct, setPct] = useState(50);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  async function load() {
    const [r1, r2] = await Promise.all([
      fetch("/api/resource-planning"),
      fetch("/api/resource-planning?over_allocated=true"),
    ]);
    setAllocs(await r1.json());
    setOverAlloc(await r2.json());
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!member || !projectId || !startDate || !endDate) return;
    await fetch("/api/resource-planning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member, project_id: projectId, allocation_pct: pct, start_date: startDate, end_date: endDate, notes }),
    });
    setMember(""); setProjectId(""); setPct(50); setStartDate(""); setEndDate(""); setNotes("");
    load();
  }

  async function remove(id: string) {
    await fetch("/api/resource-planning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  }

  return (
    <main className="main">
      <h1>Resource Planning</h1>

      {overAlloc.length > 0 && (
        <div className="rp-warn">
          <strong>Over-allocated:</strong>{" "}
          {overAlloc.map((o) => `${o.member} (${o.total_pct}%)`).join(", ")}
        </div>
      )}

      <div className="rp-form">
        <input placeholder="Member" value={member} onChange={(e) => setMember(e.target.value)} />
        <input placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        <input type="number" min={0} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button onClick={create}>Add Allocation</button>
      </div>

      <table className="rp-table">
        <thead>
          <tr>
            <th>Member</th><th>Project</th><th>Allocation</th><th>Start</th><th>End</th><th>Notes</th><th></th>
          </tr>
        </thead>
        <tbody>
          {allocs.map((a) => (
            <tr key={a.id}>
              <td>{a.member}</td>
              <td>{a.project_id}</td>
              <td>
                <div className="rp-bar-wrap">
                  <div className="rp-bar" style={{ width: `${Math.min(a.allocation_pct, 100)}%` }} />
                  <span>{a.allocation_pct}%</span>
                </div>
              </td>
              <td>{a.start_date}</td>
              <td>{a.end_date}</td>
              <td>{a.notes}</td>
              <td><button className="btn-sm btn-danger" onClick={() => remove(a.id)}>Del</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
