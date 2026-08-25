"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentName, CreateIssueInput, Issue, Product } from "@/lib/types";

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
  const [cap, setCap] = useState("2.00");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId && (defaultProductId || products[0]?.id)) {
      setProductId(defaultProductId || products[0].id);
    }
  }, [products, defaultProductId, productId]);

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
      assignee_kind: kind,
      assignee_user: kind === "user" ? user : null,
      agent_name: kind === "agent" ? agent : null,
      cost_cap_cents: cents,
    };

    const now = new Date().toISOString();
    const optimisticIssue: Issue = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      product_id: productId,
      title: trimmedTitle,
      body: body.trim(),
      status: "open",
      assignee_kind: kind,
      assignee_user: kind === "user" ? user : null,
      agent_name: kind === "agent" ? agent : null,
      cost_cap_cents: cents,
      due_on: null,
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
        <button className="go" disabled={submitting || !title.trim()} type="submit">
          {submitting ? "…" : "Add"}
        </button>
      </div>
      {err && <div className="err">{err}</div>}
    </form>
  );
}
