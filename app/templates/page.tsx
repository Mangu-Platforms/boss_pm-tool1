"use client";

import { useEffect, useState } from "react";

type Template = {
  id: string;
  name: string;
  title_prefix: string;
  body: string;
  priority: string;
  assignee_kind: string;
  agent_name?: string;
  cost_cap_cents?: number;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []));
  }, []);

  return (
    <main>
      <div className="kicker">Configuration</div>
      <h1>Issue Templates</h1>
      <p className="lede">Pre-configured templates for creating new issues quickly.</p>

      <div className="tpl-grid">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className={`tpl-card ${selected?.id === tpl.id ? "tpl-selected" : ""}`}
            onClick={() => setSelected(selected?.id === tpl.id ? null : tpl)}
          >
            <h3 className="tpl-name">{tpl.name}</h3>
            <span className="tpl-prefix mono">{tpl.title_prefix}</span>
            <div className="tpl-meta">
              <span className={`priority ${tpl.priority === "high" ? "red" : tpl.priority === "low" ? "mute" : "gold"}`}>
                {tpl.priority}
              </span>
              <span className="hint">{tpl.assignee_kind}</span>
              {tpl.agent_name && <span className="hint">Agent: {tpl.agent_name}</span>}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="tpl-preview">
          <h2 className="section-title">{selected.name} Preview</h2>
          <pre className="tpl-body">{selected.body}</pre>
          {selected.cost_cap_cents && (
            <p className="hint">Cost cap: ${(selected.cost_cap_cents / 100).toFixed(2)}</p>
          )}
        </div>
      )}
    </main>
  );
}
