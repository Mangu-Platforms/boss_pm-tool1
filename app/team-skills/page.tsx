"use client";

import { useEffect, useState } from "react";

type MatrixData = { members: string[]; skills: string[]; matrix: Record<string, Record<string, string | null>> };

const levelColors: Record<string, string> = {
  beginner: "var(--mute)",
  intermediate: "var(--lab)",
  advanced: "var(--gold)",
  expert: "var(--engine)",
};

export default function TeamSkillsPage() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [member, setMember] = useState("");
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("intermediate");

  function load() {
    fetch("/api/team-skills?matrix").then((r) => r.json()).then(setData);
  }
  useEffect(load, []);

  async function addSkill() {
    if (!member.trim() || !skill.trim()) return;
    await fetch("/api/team-skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member, skill, level }),
    });
    setMember("");
    setSkill("");
    load();
  }

  if (!data) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Team Skills Matrix</h1>

      <div className="ts-form">
        <input placeholder="Member" value={member} onChange={(e) => setMember(e.target.value)} />
        <input placeholder="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        <button className="btn btn-gold" onClick={addSkill}>Add</button>
      </div>

      <div className="ts-matrix-wrap">
        <table className="table ts-matrix">
          <thead>
            <tr>
              <th>Member</th>
              {data.skills.map((s) => <th key={s}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.members.map((m) => (
              <tr key={m}>
                <td className="ts-member">{m}</td>
                {data.skills.map((s) => (
                  <td key={s}>
                    {data.matrix[m][s] ? (
                      <span className="ts-level" style={{ color: levelColors[data.matrix[m][s]!] }}>{data.matrix[m][s]}</span>
                    ) : (
                      <span className="ts-empty">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
