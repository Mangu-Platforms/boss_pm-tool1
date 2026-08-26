"use client";

import { useEffect, useState } from "react";

type StandupEntry = {
  id: string;
  member: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  created_at: string;
};

export default function StandupsPage() {
  const [standups, setStandups] = useState<StandupEntry[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [member, setMember] = useState("");
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");

  useEffect(() => {
    fetch("/api/standups?view=dates")
      .then((r) => r.json())
      .then((data) => setDates(data.dates || []));
    fetch("/api/standups")
      .then((r) => r.json())
      .then((data) => setStandups(data.standups || []));
  }, []);

  async function loadDate(date: string) {
    setSelectedDate(date);
    const url = date ? `/api/standups?date=${date}` : "/api/standups";
    const data = await fetch(url).then((r) => r.json());
    setStandups(data.standups || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!member.trim()) return;
    await fetch("/api/standups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member: member.trim(), yesterday, today, blockers }),
    });
    setMember("");
    setYesterday("");
    setToday("");
    setBlockers("");
    const data = await fetch(selectedDate ? `/api/standups?date=${selectedDate}` : "/api/standups").then((r) => r.json());
    setStandups(data.standups || []);
    const datesData = await fetch("/api/standups?view=dates").then((r) => r.json());
    setDates(datesData.dates || []);
  }

  return (
    <main>
      <div className="kicker">Daily</div>
      <h1>Standup Notes</h1>
      <p className="lede">Async daily standups: what you did, what you&apos;re doing, and any blockers.</p>

      <div className="standup-dates">
        <button className={`filter-chip ${!selectedDate ? "filter-chip-active" : ""}`} onClick={() => loadDate("")}>All</button>
        {dates.map((d) => (
          <button key={d} className={`filter-chip ${selectedDate === d ? "filter-chip-active" : ""}`} onClick={() => loadDate(d)}>
            {d}
          </button>
        ))}
      </div>

      <div className="standup-list">
        {standups.map((s) => (
          <div key={s.id} className="standup-card">
            <div className="standup-header">
              <span className="standup-member">{s.member}</span>
              <span className="hint">{s.date}</span>
            </div>
            <div className="standup-sections">
              <div className="standup-section">
                <span className="standup-label">Yesterday</span>
                <p>{s.yesterday || "Nothing reported"}</p>
              </div>
              <div className="standup-section">
                <span className="standup-label">Today</span>
                <p>{s.today || "Nothing planned"}</p>
              </div>
              {s.blockers && s.blockers.toLowerCase() !== "none" && (
                <div className="standup-section standup-blocker">
                  <span className="standup-label">Blockers</span>
                  <p>{s.blockers}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Post Standup Update</h2>
      <form className="standup-form" onSubmit={handleSubmit}>
        <input placeholder="Your name" value={member} onChange={(e) => setMember(e.target.value)} required />
        <textarea placeholder="What did you do yesterday?" value={yesterday} onChange={(e) => setYesterday(e.target.value)} rows={2} />
        <textarea placeholder="What are you working on today?" value={today} onChange={(e) => setToday(e.target.value)} rows={2} />
        <textarea placeholder="Any blockers?" value={blockers} onChange={(e) => setBlockers(e.target.value)} rows={1} />
        <button className="go" type="submit" disabled={!member.trim()}>Submit</button>
      </form>
    </main>
  );
}
