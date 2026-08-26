"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentName, CreateIssueInput, Issue, IssuePriority, Product } from "@/lib/types";

type Template = { id: string; name: string; title_prefix: string; body: string; priority: IssuePriority; assignee_kind: "user" | "agent"; agent_name?: string; cost_cap_cents?: number };

type Props = {
  products: Product[];
  defaultProductId?: string;
  onCreated?: (issue: Issue) => void;
  onOptimistic?: (issue: Issue) => void;
};

export function IssueCreate({ products, defaultProductId, onCreated, onOptimistic }: Props) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [productId, setProductId] = useState(defaultProductId || products[0]?.id || "");
  const [kind, setKind] = useState<"user" | "agent">("agent");
  const [user, setUser] = useState("operator");
  const [agent, setAgent] = useState<AgentName>("alice");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [cap, setCap] = useState("2.00");
  const [dueOn, setDueOn] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (!productId && (defaultProductId || products[0]?.id)) {
      setProductId(defaultProductId || products[0].id);
    }
  }, [products, defaultProductId, productId]);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then((d) => setTemplates(d.templates || []));
  }, []);

  function applyTemplate(tmpl: Template) {
    setTitle(tmpl.title_prefix);
    setBody(tmpl.body);
    setPriority(tmpl.priority);
    if (tmpl.assignee_kind === "agent" && tmpl.agent_name) {
      setKind("agent");
      setAgent(tmpl.agent_name as AgentName);
      setCap(((tmpl.cost_cap_cents || 400) / 100).toFixed(2));
    } else {
      setKind("user");
    }
    titleRef.current?.focus();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "c" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        titleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function submit() {
    setErr(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const cents = kind === "agent" ? Math.round(parseFloat(cap || "0") * 100) : null;
    const input: CreateIssueInput = {
      product_id: productId,
      title: trimmedTitle,
      body: body.trim() || undefined,
      priority,
      assignee_kind: kind,
      assignee_user: kind === "user" ? user : null,
      agent_name: kind === "agent" ? agent : null,
      cost_cap_cents: cents,
      due_on: dueOn || null,
    };

    const now = new Date().toISOString();
    const optimisticIssue: Issue = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      product_id: productId,
      title: trimmedTitle,
      body: body.trim(),
      status: "open",
      priority,
      assignee_kind: kind,
      assignee_user: kind === "user" ? user : null,
      agent_name: kind === "agent" ? agent : null,
      cost_cap_cents: cents,
      due_on: dueOn || null,
      created_at: now,
      updated_at: now,
      pending: true,
    };

    onOptimistic?.(optimisticIssue);
    setTitle("");
    setBody("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "create failed");
        setTitle(trimmedTitle);
        return;
      }
      onCreated?.(data.issue);
    } catch {
      setErr("Network error — issue saved optimistically");
      setTitle(trimmedTitle);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="composer-header">
        <span className="kicker">Create issue · press C</span>
        {submitting && <span className="hint syncing">saving…</span>}
      </div>
      {templates.length > 0 && (
        <div className="template-row">
          <span className="hint">Templates:</span>
          {templates.map((t) => (
            <button
              key={t.id}
              className="chip chip-sm"
              type="button"
              onClick={() => applyTemplate(t)}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
      <input
        ref={titleRef}
        placeholder="Issue title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoComplete="off"
      />
      <textarea
        placeholder="Description (optional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
      />
      <div className="row">
        <label>
          <div className="hint">Product</div>
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <div className="hint">Priority</div>
          <select value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)}>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>
          <div className="hint">Assignee</div>
          <select
            value={kind === "user" ? `user:${user}` : `agent:${agent}`}
            onChange={(e) => {
              const v = e.target.value;
              if (v.startsWith("agent:")) {
                setKind("agent");
                setAgent(v.slice(6) as AgentName);
              } else {
                setKind("user");
                setUser(v.slice(5));
              }
            }}
          >
            <option value="agent:alice">Alice (agent)</option>
            <option value="agent:swarm">Swarm (agent)</option>
            <option value="user:operator">operator (user)</option>
          </select>
        </label>
        <label>
          <div className="hint">Cost cap {kind === "agent" ? "(required)" : "(n/a)"}</div>
          <input
            inputMode="decimal"
            value={cap}
            disabled={kind !== "agent"}
            onChange={(e) => setCap(e.target.value)}
            placeholder="2.00"
          />
        </label>
        <label>
          <div className="hint">Due date (optional)</div>
          <input
            type="date"
            value={dueOn}
            onChange={(e) => setDueOn(e.target.value)}
          />
        </label>
        <button className="go" disabled={submitting || !title.trim()} type="submit">
          {submitting ? "…" : "Add"}
        </button>
      </div>
      {err && <div className="err">{err}</div>}
    </form>
  );
}
