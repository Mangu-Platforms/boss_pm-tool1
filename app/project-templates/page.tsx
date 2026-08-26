"use client";

import { useEffect, useState } from "react";

type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  issues: { title: string; priority: string }[];
  default_milestones: { name: string; offset_days: number }[];
  default_labels: string[];
};

export default function ProjectTemplatesPage() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);

  useEffect(() => {
    fetch("/api/project-templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []));
  }, []);

  return (
    <main>
      <div className="kicker">Setup</div>
      <h1>Project Templates</h1>
      <p className="lede">Pre-configured project templates with milestones, labels, and issues.</p>

      <div className="ptpl-list">
        {templates.map((t) => (
          <div key={t.id} className="ptpl-card">
            <div className="ptpl-header">
              <h3>{t.name}</h3>
              <span className="priority mute">{t.category}</span>
            </div>
            <p className="hint">{t.description}</p>
            <div className="ptpl-details">
              <span className="hint">{t.issues.length} issues</span>
              <span className="hint">{t.default_milestones.length} milestones</span>
              <span className="hint">{t.default_labels.length} labels</span>
            </div>
            {t.default_labels.length > 0 && (
              <div className="ptpl-labels">
                {t.default_labels.map((l) => <span key={l} className="ptpl-label">{l}</span>)}
              </div>
            )}
            <div className="ptpl-issues">
              {t.issues.slice(0, 3).map((iss, i) => (
                <div key={i} className="ptpl-issue">
                  <span className={`priority ${iss.priority === "critical" ? "red" : iss.priority === "high" ? "gold" : "mute"}`}>{iss.priority}</span>
                  <span>{iss.title}</span>
                </div>
              ))}
              {t.issues.length > 3 && <span className="hint">+{t.issues.length - 3} more</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
