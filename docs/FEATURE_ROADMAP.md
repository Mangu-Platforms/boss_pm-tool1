# Boss PM — Feature Roadmap & Developer Play-by-Play

> **Purpose.** A single, actionable backlog a developer can pick up and work through, ticket by ticket. It captures the current state of the product, every gap worth closing, and every feature worth building — sequenced so the work happens in the right order.
>
> **Scope.** 65 epics · 188 stories across 4 phases. Every story has a user story, implementation notes, checkbox acceptance criteria, likely files, and dependencies.
>
> **Method.** Produced from a full read of the codebase plus a nine-agent deep-dive (eight specialist analysts — App/UX, API/Data, Feature-completeness, Quality/Ops, Agent-native, Portfolio/GitHub, PM-parity, Publishing-domain — and a synthesis pass), with every critical finding re-verified against the source. Prepared 2026-08-27. See [Appendix C](#appendix-c--methodology).

---

## How to use this document

- **Start with [Quick Wins](#quick-wins-day-1).** Twelve high-impact, low-effort fixes. Several are one-liners that make a headline feature actually work.
- **Then work the phases in order.** [Phase 0](#phase-0--make-it-real-now) is non-negotiable groundwork; everything after it assumes the data survives, the schema is authoritative, and auth exists.
- **Tickets are addressable.** Epics are `P0-E03`; stories are `P0-E03.1`. Reference them in commits and PRs (e.g. `git commit -m "P0-E03.1: durable persistence for comments"`).
- **The [Epic Index](#epic-index) is the map.** Jump straight to any epic; each links to its detailed stories.
- **Effort legend.** Epics: `S` < 1 day · `M` 1–3 days · `L` ~1 week · `XL` multi-week. Priorities `P0`–`P3` mirror the phase.

---

## TL;DR — state of the product

Boss PM is a **polished, coherent, genuinely fast tracker that is currently a demo dressed as a product.** The craft is real: the Chambers design system is applied consistently across ~14 screens, optimistic issue-create works exactly as advertised (the row paints before the network round-trip), and the agent cost-cap is correctly enforced on create. But three structural truths block it from being shippable:

1. **Only three things persist.** `products`, `issues`, and `issue_links` survive. The other **eleven feature modules** — labels, comments, sub-tasks, relations, time, notifications, history, activity, custom-fields, SLA, saved-views — are bare in-memory arrays with no persistence and no database tables. In dev they look complete; on Vercel serverless they silently drop every write between requests. **Roughly two-thirds of the visible product is non-durable.**

2. **Both headline moat claims are dead code.**
   - *Portfolio truth (GitHub mirror):* every synced link is written with `issue_id = null`, and the mirror function joins on `issue_id`, so it **always matches nothing and returns 0.** Claim 3 does not function.
   - *Agent cost-cap ("stop at cap"):* there is **no spend column anywhere.** The agents dashboard sums *caps* and labels them "budget." A cap you never measure spend against is exactly the "comment, not a column" failure the product's own docs warn about.

3. **It is unsecured and unguarded.** No authentication on any of 28 routes; RLS ships open or disabled; the GitHub webhook has **no signature verification** (an unauthenticated trigger for outbound calls) despite the settings screen telling operators to configure a secret; `db.ts` **silently swallows** Supabase errors and serves ephemeral seed data on failure; there is **no CI** at all.

**The strategic order is therefore fixed:** first make it real (persistence, one authoritative schema, event bus, integrity, security, auth, CI, and the two dead-moat repairs). *Then* deepen the moat that makes Boss PM impossible to copy — agent-native execution with an enforced spend ledger, the publishing-production pipeline, and true multi-repo portfolio intelligence. *Then* breadth and parity. *Then* multiplayer and platform reach. Sequence discipline matters more than any single feature: **nothing data-bearing ships before persistence; nothing tenant-scoped before auth; no wire-up before the feature it surfaces actually persists.**

---

## What Boss PM is

An operator PM tool for **Mangu Platforms**, a publishing house that produces comics and books using AI agent swarms (it built this repo). One board spans every Mangu repo, each tagged `cash-engine` or `lab`. The wedge, from `docs/PRD.md`, is three testable claims:

| # | Claim | Status today |
|---|---|---|
| 1 | **Instant UI** — new issue paints < 80 ms, optimistic before the network | ✅ **Real** (`components/IssueCreate.tsx` fires `onOptimistic` before `fetch`). No instrumentation proves < 80 ms; detail-page edits are *not* optimistic. |
| 2 | **Agent-native** — assign a named agent/swarm with a *required* cost cap | ⚠️ **Half-real.** Cap is a first-class column, enforced with a 400 on create — but only on create (not PATCH), and there is **no spend tracking, run, or dispatch**. Assigning an agent triggers nothing. |
| 3 | **Portfolio truth** — one board, cash-vs-lab, GitHub state mirrored | ❌ **Broken.** Portfolio board and filters work; the GitHub status mirror is dead code and never matches an issue. |

The seed (`lib/seed.ts`) is the real portfolio: Mangu Publishing, Madcap Tees, Hathor Red, Q Cash, Chambers, Alice Chains (cash-engines); Andromeda, ACX City, Cashmere Thoughts, Book1 Assign, Boss PM (labs).

---

## Feature reality scorecard

How much of what's on screen actually works in production. **"Persists?"** means *survives a Vercel serverless cold start.*

| Feature | lib | API | UI | Persists? | Tests | Notes |
|---|:--:|:--:|:--:|:--:|:--:|---|
| Products (CRUD) | ✅ | ✅ | ✅ | ✅ | ✅ | store + optional Supabase |
| Issues (CRUD, optimistic create) | ✅ | ✅ | ✅ | ✅ | ✅ | the solid core |
| Priority | ✅ | ✅ | ✅ | ⚠️ | ✅ | in code; **missing from `docs/SCHEMA.sql`** |
| Bulk actions | — | ✅ | ✅ | ✅ | — | writes activity only, not history/notifs |
| Kanban board | — | — | ✅ | ✅ | — | 4 columns — **`cancelled` issues vanish** |
| Analytics / CSV+JSON export | — | ✅ | ✅ | ✅ | ✅ | CSV has **formula-injection** hole |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | client-side + `/api/search` |
| GitHub links / read-sync | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | **mirror is dead code**; `per_page=50`, no pagination |
| Agent cost-cap + dashboard | ✅ | ✅ | ✅ | ⚠️ | ✅ | **caps only — no spend** |
| Labels | ✅ | ✅ | ✅ | ❌ | ✅ | in-memory array only |
| Comments ("Notes") | ✅ | ✅ | ✅ | ❌ | ✅ | in-memory array only |
| Sub-tasks | ✅ | ✅ | ✅ | ❌ | ✅ | in-memory array only |
| Relations | ✅ | ✅ | ✅ | ❌ | ✅ | in-memory array only |
| Time tracking | ✅ | ✅ | ✅ | ❌ | ✅ | in-memory array only |
| History (audit) | ✅ | ✅ | ✅ | ❌ | ✅ | in-memory; only PATCH writes it |
| Activity feed | ✅ | ✅ | ✅ | ❌ | ✅ | in-memory array only |
| Notifications / Inbox | ✅ | ✅ | ✅ | ❌ | ✅ | in-memory; `comment`/`mention`/`due_soon` types are dead |
| Custom fields | ✅ | ✅ | ❌ | ❌ | ✅ | **backend only — no UI** |
| SLA policies | ✅ | ✅ | ❌ | ❌ | ✅ | **backend only — computed at read time** |
| Saved views | ✅ | ✅ | ⚠️ | ❌ | ✅ | apply-only; no "save current view" |
| Auth / tenancy | ❌ | ❌ | ❌ | — | ❌ | **none anywhere** |

---

## Critical findings

Ranked, cross-cutting, each re-verified against source. These are the reason Phase 0 exists.

| # | Severity | Finding | Evidence |
|---|:--:|---|---|
| 1 | 🔴 CRITICAL | **11 feature modules lose 100% of data on every serverless invocation** — bare `const store = []`, no `globalThis` guard, no DB | `lib/{comments,subtasks,relations,timelog,notifications,history,activity,custom-fields,labels,views,sla}.ts` |
| 2 | 🔴 CRITICAL | **Schema drift** — two SQL files disagree; 12 feature tables exist in no SQL; `priority` missing from `docs/SCHEMA.sql` | `docs/SCHEMA.sql` vs `supabase/migrations/001_initial_schema.sql` |
| 3 | 🔴 CRITICAL | **GitHub mirror is dead code** — every link written `issue_id: null`, mirror joins on `issue_id`, always returns 0. Claim 3 does nothing | `lib/github.ts:34`, `lib/store.ts:171` |
| 4 | 🔴 CRITICAL | **No spend column** — "stop at cap" is unenforceable; dashboard sums caps and calls them "budget" | `app/agents/page.tsx`, `app/api/agents/route.ts` |
| 5 | 🔴 CRITICAL | **Silent Supabase-error fallback** — every `db.ts` fn does `if (error) return mem()`, so failed writes 201-succeed into ephemeral seed and vanish, with zero logging | `lib/db.ts` |
| 6 | 🟠 HIGH | **Assigning an agent triggers nothing** — no run, no session, no dispatch. "Native" = one of two hardcoded strings | `lib/store.ts`, `app/api/issues/route.ts` |
| 7 | 🟠 HIGH | **No auth/authz on any of 28 routes; RLS open or absent** — a launch blocker at $8–12/user/mo | all `app/api/**`, `docs/SCHEMA.sql` |
| 8 | 🟠 HIGH | **GitHub webhook has zero signature verification** despite settings claiming it — forgeable event / DoS amplifier | `app/api/webhooks/github/route.ts` |
| 9 | 🟠 HIGH | **The publishing domain is unrepresentable** — nothing above `Product` (a repo); flat status can't express the script→pencils→inks→letters relay | `lib/types.ts` |
| 10 | 🟠 HIGH | **Cost-cap enforced on create but not PATCH** — an issue can be flipped to a capless agent; in-memory accepts it, Supabase check-constraint 500s | `app/api/issues/[id]/route.ts` |
| 11 | 🟠 HIGH | **No event bus** — comment/subtask/time writes fire no side effects; only PATCH fans out (and skips SLA) | across `app/api/**` |
| 12 | 🟠 HIGH | **No CI; route handlers never executed by tests** — 28 routes have zero direct coverage; the 3 wedge claims have no guarding test | no `.github/workflows`; `tests/*` |
| 13 | 🟠 HIGH | **Accessibility broken at baseline** — inline edit is mouse-only, no `:focus-visible` ring, modals lack focus trap/restore | `app/issues/[id]/page.tsx`, `app/globals.css` |
| 14 | 🟡 MED | **Injection sinks** — PostgREST `.or()` filter interpolates a raw slug; CSV export doesn't neutralize `= + - @` prefixes | `lib/db.ts`, `app/api/export/route.ts` |
| 15 | 🟡 MED | **Detail page infinite-loads** on a missing/deleted issue; **11-request waterfall** on load; Skeleton/ErrorBoundary are dead code | `app/issues/[id]/page.tsx`, `components/{Skeleton,ErrorBoundary}.tsx` |

---

## Quick Wins (Day 1)

High-impact, low-effort. Do these first — several are the difference between a claim working and not.

- [ ] **QW1.** Add a `globalThis` guard to every feature store — stop the warm-lambda bleed before the full persistence layer lands. → `P0-E03`
- [ ] **QW2.** Fix `issue_links.issue_id` association so `mirrorStatusFromGithub` can match — the one-line bug that makes **Claim 3** work. → `P0`, [Quick Win] `lib/github.ts`
- [ ] **QW3.** Reconcile the two SQL files into one migration; add the missing `priority` column; delete the divergent `docs/SCHEMA.sql`. → `P0-E02.1`
- [ ] **QW4.** Verify GitHub webhook signatures (timing-safe HMAC `x-hub-signature-256`) + `x-github-delivery` dedup. → `P0` webhook epic
- [ ] **QW5.** Kill the PostgREST `.or()` injection sink in `dbGetProduct` — use two `.eq` lookups. → `lib/db.ts`
- [ ] **QW6.** Harden CSV export against formula injection (`= + - @`). → `app/api/export/route.ts`
- [ ] **QW7.** Stop silently swallowing Supabase errors in `db.ts` — log them; don't serve ephemeral seed on failure. → `P0-E05`-adjacent
- [ ] **QW8.** Add a `typecheck` script (`tsc --noEmit`) + a GitHub Actions workflow gating lint/typecheck/test/build. → `P0-E02.3` / CI epic
- [ ] **QW9.** Add not-found + error states to the issue detail page to kill the infinite "Loading issue…" hang. → reliability epic
- [ ] **QW10.** Enforce the agent cost-cap invariant on PATCH, not just create. → `app/api/issues/[id]/route.ts`
- [ ] **QW11.** Add a global `:focus-visible` ring and `aria-label`s on icon-only controls. → a11y epic
- [ ] **QW12.** Record an explicit keep/cut ruling per sprawl feature in `AGENTS.md` before investing persistence effort. → `P0-E01`

---

## The roadmap at a glance

| Phase | Name | Goal | Epics · Stories |
|---|---|---|:--:|
| **[Phase 0](#phase-0--make-it-real-now)** | Make it real *(Now)* | Everything on screen actually persists, is secure, gated by auth; the two dead-moat bugs become real. Turn a demo into a product that survives one request. | 15 · 46 |
| **[Phase 1](#phase-1--deepen-the-wedge-next)** | Deepen the wedge *(Next)* | Make the three differentiators irreplaceable: agent execution with an enforced spend ledger, the publishing-production OS, portfolio truth across every repo. | 24 · 77 |
| **[Phase 2](#phase-2--parity--breadth-later)** | Parity & breadth *(Later)* | Close the day-to-day table-stakes gap vs Linear/Height/Shortcut; round out publishing and portfolio surfaces. | 21 · 52 |
| **[Phase 3](#phase-3--extend-outward-horizon)** | Extend outward *(Horizon)* | Turn the single-player wedge into multiplayer; broadcast portfolio truth; platform-tier polish. | 5 · 13 |

### Sequencing rules (hard dependencies)

1. **Persistence + schema before all data-bearing work.** Bake `tenant_id` and RLS into the schema-as-code migration so auth doesn't force a re-migration.
2. **Event bus + integrity sit on top of persistence** — do them before any feature that must emit notifications/history or cascade-delete.
3. **Auth gates tenant-scoped work.** RLS is schema-level, so it's *designed* alongside the schema even though the login UI lands later in P0.
4. **Dead-moat repairs are prerequisites, not features** — the GitHub mirror fix and the agent persistence substrate must be green before Phase 1 builds on them.
5. **Agent chain:** Registry → Cost Ledger + Runs → Dispatch → Guardrails. (A run belongs to an agent; cost events attach to a run; dispatch needs runs; guardrails gate dispatch.)
6. **Publishing chain:** Series & Title (root) → stage pipeline → contributor payments (released on stage approval) → editorial calendar/gates → per-title P&L → deliverable manifest.
7. **Portfolio chain:** repaired mirror → GitHub App auth + pagination → PR/CI tracking → muster view + cash-engine P&L. Write-back (P2) needs a trustworthy mirror first.
8. **Wire-up after persistence** — don't surface custom-fields/SLA/views in the UI until their tables land.

### Theme rollup

- **Persistence** — one durable pattern (globalThis fallback + Supabase + migration) for every feature; the P0 that unblocks everything.
- **Schema & data integrity** — collapse two contradictory SQL files into one authoritative, tenant-aware schema with FKs, cascades, and a drift guard.
- **Security & auth** — signed webhooks, injection fixes, honest failure modes, then real auth + per-tenant RLS as the launch gate.
- **Agent-native (the moat)** — from a 2-value enum to a registry, a real spend ledger that hard-stops at cap, run telemetry, live dispatch, guardrails.
- **Publishing-domain (the deepest moat)** — series/title above issue, a stage pipeline with approval gates, contributor payment milestones, editorial cadence, per-title P&L no generic tracker can copy.
- **Portfolio truth** — repair and persist the mirror, then GitHub App auth, PR/CI tracking, a cross-repo muster view, cash-engine P&L.
- **Quality, CI & observability** — a PR gate, real route/integration/a11y coverage, a DB-boundary validation layer, structured logging + error monitoring.
- **PM table-stakes & parity** — query language + saved views, cycles/estimates/burndown, projects/milestones, my-work/triage, rich collaboration, keyboard parity.
- **UX craft** — accessibility baseline, coherent keyboard/command system, design-system consolidation, mobile, theme, first-run onboarding.
- **Delight & multiplayer (horizon)** — live updates, peek panels, undo, attachments, Slack/email broadcast, public share links, PWA/offline/i18n.

---

## Epic Index


**Phase 0 — Make it real (Now)**

| Epic | Title | Pri | Eff | Theme | Stories |
|---|---|:--:|:--:|---|:--:|
| [P0-E01](#p0-e01) | Reconcile scope discipline — decide keep-vs-cut on sprawl modules | P2 | S | PM-core | 1 |
| [P0-E02](#p0-e02) | Schema-as-code: one authoritative, migrated Supabase schema for every entity | P0 | L | Publishing-domain | 3 |
| [P0-E03](#p0-e03) | Unified persistence layer: one source of truth for ALL features | P0 | XL | Persistence | 4 |
| [P0-E04](#p0-e04) | Data integrity: referential integrity, cascades, and orphan prevention | P0 | L | Quality | 3 |
| [P0-E05](#p0-e05) | One event bus: every change fans out to history + activity + notification + SLA | P0 | L | Cross-feature integration | 3 |
| [P0-E06](#p0-e06) | Agent persistence foundation + Registry schema (migration 002) | P0 | L | Persistence | 4 |
| [P0-E07](#p0-e07) | Fix and persist the GitHub mirror: real issue reconciliation across the db layer | P0 | M | PM-core | 3 |
| [P0-E08](#p0-e08) | Make it survive production (Vercel hardening & security) | P0 | M | Security | 4 |
| [P0-E09](#p0-e09) | Harden the GitHub webhook: signature verification, event fan-out, and durable delivery log | P0 | M | Security | 3 |
| [P0-E10](#p0-e10) | CI/CD pipeline: lint + typecheck + test + build gate on every PR | P0 | M | Quality | 3 |
| [P0-E11](#p0-e11) | Authentication & authorization | P0 | XL | Security | 2 |
| [P0-E12](#p0-e12) | Reliability of interactive UI — make detail-page and inbox features actually persist and degrade gracefully | P0 | L | Persistence | 3 |
| [P0-E13](#p0-e13) | Make every feature durable — one persistence pattern, no evaporating data | P0 | XL | Persistence | 3 |
| [P0-E14](#p0-e14) | Security hardening of the existing surface | P0 | M | Security | 4 |
| [P0-E15](#p0-e15) | Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real | P0 | XL | Persistence | 3 |

**Phase 1 — Deepen the wedge (Next)**

| Epic | Title | Pri | Eff | Theme | Stories |
|---|---|:--:|:--:|---|:--:|
| [P1-E16](#p1-e16) | Agent Registry & Profiles — arbitrary named agents, capabilities, dispatch config | P0 | L | Agent-native | 4 |
| [P1-E17](#p1-e17) | Cost Ledger — actual spend vs cap, burndown, alerts, hard-stop at cap | P0 | XL | PM-core | 5 |
| [P1-E18](#p1-e18) | Agent Runs & Telemetry — run history, status, tokens, artifacts, logs | P1 | L | Agent-native | 4 |
| [P1-E19](#p1-e19) | Routing & Dispatch — assign actually triggers an agent | P1 | XL | Agent-native | 5 |
| [P1-E20](#p1-e20) | Guardrails & Approvals — human-in-the-loop, cost thresholds, kill switch | P1 | L | Quality | 3 |
| [P1-E21](#p1-e21) | Agent-to-skill-domain mapping (deep tie-in to the real Mangu fleet) | P1 | M | Agent-native | 2 |
| [P1-E22](#p1-e22) | Series & Title as first-class objects above Issue (product → series → arc/volume → title → task) | P0 | XL | Publishing-domain | 2 |
| [P1-E23](#p1-e23) | Production pipeline as a stage workflow with per-stage owners, approval gates & refinement caps | P0 | XL | Publishing-domain | 3 |
| [P1-E24](#p1-e24) | Contributor contracts, payment milestones & kill-fees | P1 | L | Publishing-domain | 3 |
| [P1-E25](#p1-e25) | Editorial & launch calendar, release cadence, and go/no-go gates | P1 | L | Publishing-domain | 2 |
| [P1-E26](#p1-e26) | Per-title P&L across channels (production cost incl. agent spend vs revenue) | P1 | L | Publishing-domain | 3 |
| [P1-E27](#p1-e27) | Real GitHub auth, pagination, and rate-limit resilience (GitHub App + PAT) | P1 | L | Persistence | 3 |
| [P1-E28](#p1-e28) | First-class PR, commit/branch, and CI status tracking | P1 | L | Publishing-domain | 3 |
| [P1-E29](#p1-e29) | Multi-repo portfolio intelligence: health board, engine rollups, and muster view | P1 | L | Portfolio | 3 |
| [P1-E30](#p1-e30) | Product P&L and cash-engine ROI (the money view) | P1 | L | Portfolio | 3 |
| [P1-E31](#p1-e31) | API hardening: validation, error envelope, pagination | P1 | L | PM-core | 4 |
| [P1-E32](#p1-e32) | Observability, error tracking & honest failure modes | P1 | M | Observability | 3 |
| [P1-E33](#p1-e33) | Type-safety & runtime validation at the DB boundary | P1 | M | Quality | 2 |
| [P1-E34](#p1-e34) | Test-coverage expansion: API routes, pages, integration, error paths, a11y | P0 | L | Quality | 5 |
| [P1-E35](#p1-e35) | Test isolation & determinism for feature libs | P1 | S | Quality | 1 |
| [P1-E36](#p1-e36) | Accessibility baseline — keyboard operability, focus, and semantics | P0 | L | A11y | 4 |
| [P1-E37](#p1-e37) | Surface the backend-only features in the UI | P1 | L | UX | 4 |
| [P1-E38](#p1-e38) | Missing operator screens — my-work, per-agent detail, notifications | P1 | XL | PM-core | 3 |
| [P1-E39](#p1-e39) | Schema integrity, persistence for feature libs, and seed/reset tooling | P1 | L | Persistence | 3 |

**Phase 2 — Parity & breadth (Later)**

| Epic | Title | Pri | Eff | Theme | Stories |
|---|---|:--:|:--:|---|:--:|
| [P2-E40](#p2-e40) | Real query language + saveable smart views (deepen the existing filter/view code) | P0 | L | PM-core | 3 |
| [P2-E41](#p2-e41) | One coherent keyboard + command system | P1 | L | UX | 2 |
| [P2-E42](#p2-e42) | Command palette parity + keyboard-first list navigation | P1 | M | Delight | 3 |
| [P2-E43](#p2-e43) | My Work + Triage inbox | P1 | M | UX | 2 |
| [P2-E44](#p2-e44) | Cycles/sprints, estimates/points, and burndown/burnup | P1 | XL | PM-core | 3 |
| [P2-E45](#p2-e45) | Projects / Milestones / Goals with progress rollup | P1 | L | PM-core | 2 |
| [P2-E46](#p2-e46) | Rich collaboration: markdown, mentions, reactions, threads, edit | P1 | L | UX | 3 |
| [P2-E47](#p2-e47) | Deepen sub-issues into trees and relations into a dependency graph | P1 | L | PM-core | 3 |
| [P2-E48](#p2-e48) | Automations, recurring issues, and multi-channel notifications + digests | P1 | L | Automations | 3 |
| [P2-E49](#p2-e49) | Deeper bulk edit + templates depth | P1 | M | PM-core | 2 |
| [P2-E50](#p2-e50) | Design-system hardening and consistency | P2 | M | Design-system | 2 |
| [P2-E51](#p2-e51) | Mobile, theme polish, and first-run onboarding | P2 | L | Delight | 3 |
| [P2-E52](#p2-e52) | Agent Inbox — agents ask, the operator answers | P2 | M | UX | 2 |
| [P2-E53](#p2-e53) | Agent Analytics — cost-per-outcome, ROI, cost-effectiveness by task type | P2 | L | Portfolio | 3 |
| [P2-E54](#p2-e54) | Bidirectional write-back to GitHub (the known-later ticket) | P2 | L | PM-core | 2 |
| [P2-E55](#p2-e55) | Rights, metadata, ISBN & deliverable-manifest tracking | P2 | M | Publishing-domain | 2 |
| [P2-E56](#p2-e56) | Launch campaigns & stakeholder-channel readiness | P2 | M | Publishing-domain | 2 |
| [P2-E57](#p2-e57) | Import + interop: CSV/JSON in, GitHub & Linear import, outbound webhooks & API keys | P1 | L | Publishing-domain | 3 |
| [P2-E58](#p2-e58) | Importers: GitHub Projects, Linear, Jira, and CSV | P2 | L | PM-core | 3 |
| [P2-E59](#p2-e59) | Close the audit-trail and test gaps around integration | P1 | M | Quality | 2 |
| [P2-E60](#p2-e60) | Developer experience & documentation accuracy | P2 | S | DX | 2 |

**Phase 3 — Extend outward (Horizon)**

| Epic | Title | Pri | Eff | Theme | Stories |
|---|---|:--:|:--:|---|:--:|
| [P3-E61](#p3-e61) | Live updates, presence, and peek panels — extend the instant wedge to multiplayer | P2 | L | Delight | 3 |
| [P3-E62](#p3-e62) | Cross-portfolio roadmap: milestones, releases, and cycles spanning repos | P2 | L | Portfolio | 2 |
| [P3-E63](#p3-e63) | Portfolio truth broadcast: Slack digests and email | P3 | M | Delight | 2 |
| [P3-E64](#p3-e64) | Undo everywhere + attachments + reactions polish | P2 | M | Delight | 3 |
| [P3-E65](#p3-e65) | Public share links, PWA/offline, theme depth, and i18n | P3 | L | UX | 3 |

---

## Phase 0 — Make it real (Now)

> **Goal.** Everything the app already shows must actually persist, be secure, and be gated by auth — and the two dead moat bugs must become real — before any new surface is built. This phase turns a convincing demo into a product that survives one request.

> **Why this order.** Nearly every analyst independently reported the same blocker: only products/issues/issue_links persist, 11 feature modules and all audit/inbox data evaporate on Vercel, two SQL files contradict each other and omit 12 tables, and the two flagship moat claims (GitHub mirror, cost cap) are dead code. No wedge deepening or breadth counts until the data survives, the schema is authoritative and tenant-aware, the injection/webhook/silent-swallow holes are closed, CI gates merges, and auth exists. Persistence and schema come first because everything data-bearing depends on them; the event bus and integrity layer sit on top; the dead-moat repairs (mirror reconciliation, agent persistence substrate) are cheap once the durable pattern exists and must be true before Phase 1 builds on them.


<a id="p0-e01"></a>
### P0-E01 · Reconcile scope discipline — decide keep-vs-cut on sprawl modules
`P2` · effort **S** · theme _PM-core_ · source `FEAT` · 1 story

**Why this matters:** AGENTS.md explicitly said to delete time tracking and avoid sprawl before core sync is solid, yet timelog/sla/custom-fields/views were built non-durably. A conscious keep-or-cut decision prevents pouring XL persistence effort into features that shouldn't exist yet.

**`P0-E01.1` — Explicit keep/cut ruling per Tier-2 feature, recorded in AGENTS.md** _(dev est: S)_
> As the owner, I want a written decision on each sprawl module so that persistence effort targets only features we are committed to.

Review timelog, sla, custom-fields, views, relations against the PRD wedge (instant UI, agent cost-caps, portfolio truth). Record keep/cut per feature. Cut modules are removed (lib + route + tests + UI) rather than left as dead non-durable code; kept modules proceed through the persistence epic.

*Acceptance criteria:*
- [ ] Each Tier-2 feature has a documented keep or cut decision tied to the PRD wedge
- [ ] Cut features are fully removed, not left as evaporating stubs
- [ ] AGENTS.md is updated so its stated discipline matches the actual codebase

Files: `AGENTS.md`, `docs/PROSPERITY.md`


<a id="p0-e02"></a>
### P0-E02 · Schema-as-code: one authoritative, migrated Supabase schema for every entity
`P0` · effort **L** · theme _Publishing-domain_ · source `DATA` · 3 stories

**Why this matters:** Two SQL files contradict each other and the TS types (priority missing from docs/SCHEMA.sql; enum-vs-text; cascade-vs-set-null; RLS on-vs-off), and 12 feature tables exist in no SQL at all. There is no single schema an operator can run to get a working DB.

**`P0-E02.1` — Reconcile the core schema into one migration and delete the divergent file** _(dev est: S)_
> As an operator, I want exactly one canonical schema for products/issues/issue_links, so what I run matches the code.

Pick migrations/001 as the source of truth (it has priority, the updated_at trigger, and text+check that matches the JS validators), add the missing priority column story below, and either delete docs/SCHEMA.sql or regenerate it from the migration. Resolve issue_links.issue_id delete behavior deliberately (SET NULL is correct so GitHub links survive issue deletion) and document RLS posture.

*Acceptance criteria:*
- [ ] Only one authoritative schema source remains; the other is generated or removed
- [ ] priority column is present and matches lib/types.ts
- [ ] issue_links.issue_id delete behavior is decided and identical everywhere
- [ ] RLS decision (on for prod) is explicit

Files: `docs/SCHEMA.sql`, `supabase/migrations/001_initial_schema.sql`

**`P0-E02.2` — Write migrations for all 12 feature tables with FKs and indexes** _(dev est: L)_
> As an operator, I want labels, comments, subtasks, relations, time_entries, notifications, issue_history, activity_events, custom_fields, custom_field_values, saved_views, and issue_labels as real tables, so features can persist.

Add numbered migrations defining each table with a FK to issues(id) ON DELETE CASCADE (and label_id/field_id FKs where relevant), the composite/unique keys the libs assume (issue_labels PK, custom_field_values unique per issue+field), and query indexes matching the lib access patterns. Columns must match the TS types exactly.

*Acceptance criteria:*
- [ ] Each of the 12 tables has a migration file
- [ ] Every child table has a FK to its parent with an explicit ON DELETE rule
- [ ] Column names/types match lib/*.ts one-to-one
- [ ] Generated Supabase types compile against lib types

Files: `supabase/migrations/002_features.sql`, `supabase/migrations/003_indexes.sql`, `lib/types.ts`  
Depends on: Reconcile the core schema

**`P0-E02.3` — Add a schema-drift CI guard** _(dev est: M)_
> As a maintainer, I want CI to fail when TS types and SQL diverge, so drift can't silently return.

Generate types from the migration (Supabase generate_typescript_types) and diff against lib/types.ts, or add a test that asserts every field used in db.ts insert/update rows exists in the schema. There is currently no CI config at all, so this establishes the first gate.

*Acceptance criteria:*
- [ ] A CI job or vitest test fails if a lib type field has no schema column
- [ ] Runs on every PR
- [ ] Documented in README/AGENTS.md

Files: `.github/workflows/ci.yml`, `tests/schema-drift.test.ts`  
Depends on: Write migrations for all 12 feature tables


<a id="p0-e03"></a>
### P0-E03 · Unified persistence layer: one source of truth for ALL features
`P0` · effort **XL** · theme _Persistence_ · source `DATA` · 4 stories

**Why this matters:** Today only products/issues/issue_links persist (and only when Supabase env exists); 11 feature modules lose 100% of their data between serverless invocations, and audit writes (history/activity/notifications) fired during every issue mutation vanish immediately in production. This is the P0 backbone: nothing else matters if the data doesn't survive one request.

**`P0-E03.1` — Create a db module per feature that mirrors the store/db.ts pattern** _(dev est: L)_
> As the operator, I want comments, subtasks, relations, time, labels, notifications, history, activity, custom fields, and saved views to be read/written through a db layer, so they persist to Supabase when configured.

For each feature lib, extract the array into a store-shaped module and add a db wrapper that prefers Supabase and falls back to memory — exactly as lib/db.ts wraps lib/store.ts. Routes import the db wrapper, never the raw array. Keep function signatures identical so routes barely change.

*Acceptance criteria:*
- [ ] Every feature route imports from a db-* wrapper, not a bare module array
- [ ] With Supabase env set, a POST then GET across two simulated cold starts returns the written row
- [ ] With no Supabase env, behavior is unchanged from today (memory)

Files: `lib/db.ts`, `lib/comments.ts`, `lib/subtasks.ts`, `lib/relations.ts`, `lib/timelog.ts`, `lib/notifications.ts`, `lib/history.ts`, `lib/activity.ts`, `lib/custom-fields.ts`, `lib/labels.ts`, `lib/views.ts`  
Depends on: Supabase tables for all features (schema-as-code epic)

**`P0-E03.2` — Add globalThis guard to every in-memory store as the no-Supabase fallback** _(dev est: M)_
> As a developer running without Supabase, I want in-memory data to at least survive dev HMR and warm invocations, so local behavior matches the core store.

Wrap each feature module's array in the `globalThis.__boss` pattern from lib/store.ts (extend the Memory type with comments/subtasks/etc). This does not fix serverless cold starts (only Supabase does) but removes the HMR/warm-instance data loss and unifies the fallback.

*Acceptance criteria:*
- [ ] All feature arrays live under a single globalThis namespace
- [ ] Editing a feature file in dev no longer resets its data
- [ ] Memory type in lib/store.ts (or a new lib/memory.ts) enumerates every collection

Files: `lib/store.ts`, `lib/comments.ts`, `lib/subtasks.ts`, `lib/notifications.ts`, `lib/activity.ts`

**`P0-E03.3` — Route audit-trail writes through the persistent layer** _(dev est: S)_
> As the operator, I want the inbox, activity feed, and issue history to show real events in production, so the audit trail is trustworthy.

Once history/activity/notifications persist, verify the write sites in app/api/issues/route.ts and app/api/issues/[id]/route.ts land durably. Consider making these writes best-effort async but awaited so a failed audit write is logged, not lost silently.

*Acceptance criteria:*
- [ ] Creating an issue in production then loading /inbox shows the notification
- [ ] PATCHing status then loading /api/issues/[id]/history shows the change
- [ ] Audit write failures are surfaced, not swallowed

Files: `app/api/issues/route.ts`, `app/api/issues/[id]/route.ts`, `lib/history.ts`, `lib/activity.ts`, `lib/notifications.ts`  
Depends on: Create a db module per feature

**`P0-E03.4` — Decide and document the sprawl: gate or delete post-MVP feature persistence** _(dev est: S)_
> As the owner, I want an explicit decision on time-tracking/SLA/custom-fields/saved-views/history, so we don't pay schema+persistence cost for features AGENTS.md said to cut.

AGENTS.md:21 says delete Gantt/docs/chat/time-tracking from MVP. Either (a) formally keep these and persist them, or (b) feature-flag/remove them so they don't add schema-drift and test weight while core sync is broken. Record the call in docs.

*Acceptance criteria:*
- [ ] A short decision doc lists each post-MVP module as keep/flag/delete
- [ ] Deleted modules have their routes, libs, tests, and nav entries removed
- [ ] Kept modules are in the unified persistence + schema epics

Files: `docs/PROSPERITY.md`, `AGENTS.md`, `lib/timelog.ts`, `lib/sla.ts`, `lib/custom-fields.ts`, `lib/views.ts`


<a id="p0-e04"></a>
### P0-E04 · Data integrity: referential integrity, cascades, and orphan prevention
`P0` · effort **L** · theme _Quality_ · source `DATA` · 3 stories

**Why this matters:** Deleting an issue leaves orphaned comments/subtasks/relations/time/labels/history/notifications everywhere, relations reference issues that may not exist, and the GitHub link association (issue_id) is never set so the whole link->issue graph is disconnected.

**`P0-E04.1` — Fix issue_links.issue_id association so mirroring can work** _(dev est: M)_
> As the operator, I want synced GitHub links attached to their internal issue, so status mirroring actually mirrors.

In lib/github.ts, resolve issue_id by matching an existing internal issue (e.g. by product + a stored github number or title convention) instead of hard-coding null, or add an explicit link->issue linking endpoint. Then mirrorStatusFromGithub() in store.ts will match. Add a regression test proving mirror returns >0 when a link is associated and GitHub state is 'closed'.

*Acceptance criteria:*
- [ ] Synced links can carry a non-null issue_id
- [ ] mirrorStatusFromGithub updates a linked issue's status from GitHub state
- [ ] A test asserts mirror count >0 for a linked+closed case

Files: `lib/github.ts`, `lib/store.ts`, `app/api/sync/github/route.ts`, `tests/store.test.ts`

**`P0-E04.2` — Cascade-clean all child records on issue delete** _(dev est: M)_
> As the operator, I want deleting an issue to remove its comments, subtasks, relations, time, labels, history, notifications, and field values, so no orphans remain.

With SQL FKs (ON DELETE CASCADE) the DB handles this; for the in-memory path, have deleteIssue also purge the feature stores (or route delete through a single service that fans out). Add a test that after delete, all child collections for that issue are empty.

*Acceptance criteria:*
- [ ] DELETE /api/issues/[id] leaves zero child rows for that issue in both backends
- [ ] Batch delete does the same
- [ ] Test covers orphan absence across all child stores

Files: `app/api/issues/[id]/route.ts`, `app/api/issues/batch/route.ts`, `lib/store.ts`, `supabase/migrations/002_features.sql`  
Depends on: Write migrations for all 12 feature tables

**`P0-E04.3` — Validate foreign references before insert** _(dev est: S)_
> As the operator, I want the API to reject a comment/relation/subtask on a non-existent issue, so bad references can't be created.

Add existence checks (issue exists, label exists, target issue exists for relations) in the relevant routes/libs before creating child rows, returning 404/400. relations.ts already blocks self-relation; extend to verify both endpoints exist.

*Acceptance criteria:*
- [ ] POSTing a comment to an unknown issue id returns 404
- [ ] Adding a relation to a non-existent target returns 404
- [ ] Adding a label that doesn't exist returns 404 (already partly handled)

Files: `app/api/issues/[id]/comments/route.ts`, `app/api/issues/[id]/relations/route.ts`, `app/api/issues/[id]/subtasks/route.ts`, `lib/relations.ts`


<a id="p0-e05"></a>
### P0-E05 · One event bus: every change fans out to history + activity + notification + SLA
`P0` · effort **L** · theme _Cross-feature integration_ · source `FEAT` · 3 stories

**Why this matters:** Side effects are hand-wired per route today, so most mutations reach none of the four cross-cutting systems. A single emit() call site removes the inconsistency, resurrects the dead notification types, and makes SLA reactive instead of read-time-guessed.

**`P0-E05.1` — Build lib/events.ts emit() dispatching to the four sinks** _(dev est: M)_
> As a developer, I want a single emitEvent(issue, kind, detail, actor) so that every mutation consistently produces history, activity, notification, and SLA recompute.

Create lib/events.ts exporting emitEvent(). It maps an event kind to: recordChange (when field/old/new present), logActivity, createNotification (for the right type), and an SLA recompute/persist for status transitions. Centralize the branching that currently lives inline in app/api/issues/[id]/route.ts.

*Acceptance criteria:*
- [ ] emitEvent handles kinds: created, status_changed, priority_changed, assigned, commented, labeled, subtask_toggled, time_logged, related, field_changed, updated, deleted
- [ ] Each kind produces the correct subset of {history, activity, notification, sla}
- [ ] Unit test asserts the fan-out per kind
- [ ] app/api/issues/[id]/route.ts is refactored to call emitEvent and behavior is preserved

Files: `lib/events.ts`, `app/api/issues/[id]/route.ts`, `tests/events.test.ts`

**`P0-E05.2` — Route every sub-resource mutation through emitEvent** _(dev est: M)_
> As the operator, I want comments, subtasks, time logs, label and relation changes to appear in history, the activity feed, and the inbox so the audit trail is complete.

In the comments/subtasks/time/labels/relations/fields routes, call emitEvent after a successful write. Comment add fires the (currently dead) 'comment' notification and a 'commented' activity; field change records history; label add/remove logs activity. Make the batch route emit per-item like the single route.

*Acceptance criteria:*
- [ ] Adding a comment produces a 'comment' notification and an activity entry
- [ ] Toggling a subtask, logging time, and changing labels/relations each produce an activity entry
- [ ] A custom-field value change records a history entry
- [ ] Batch status/priority changes produce the same history+notification as single edits

Files: `app/api/issues/[id]/comments/route.ts`, `app/api/issues/[id]/subtasks/route.ts`, `app/api/issues/[id]/time/route.ts`, `app/api/issues/[id]/labels/route.ts`, `app/api/issues/[id]/relations/route.ts`, `app/api/issues/[id]/fields/route.ts`, `app/api/issues/batch/route.ts`  
Depends on: Build lib/events.ts emit() dispatching to the four sinks

**`P0-E05.3` — Make SLA reactive: persist responded_at/resolved_at and recompute on transition** _(dev est: M)_
> As the operator, I want SLA breach detected the moment a status changes so that /api/sla reflects truth instead of inferring timestamps.

Add responded_at/resolved_at columns (migration 002) set by emitEvent on the first non-open transition and on done/cancelled. Rewrite app/api/sla/route.ts to read persisted timestamps rather than guessing from status+updated_at. Emit a due_soon/breach notification when a recompute crosses a deadline.

*Acceptance criteria:*
- [ ] First transition out of open/backlog stamps responded_at once and does not move on later edits
- [ ] done/cancelled stamps resolved_at; reopening clears resolved_at
- [ ] /api/sla uses persisted timestamps, not updated_at inference
- [ ] Crossing a response/resolution deadline emits a notification

Files: `app/api/sla/route.ts`, `lib/sla.ts`, `lib/events.ts`, `supabase/migrations/002_features.sql`  
Depends on: Build lib/events.ts emit() dispatching to the four sinks, Author migration 002 defining all feature tables


<a id="p0-e06"></a>
### P0-E06 · Agent persistence foundation + Registry schema (migration 002)
`P0` · effort **L** · theme _Persistence_ · source `AGENT` · 4 stories

**Why this matters:** Every other agent feature is dead on arrival in production unless agent state is durable. Only products/issues/issue_links survive a serverless cold start today; a cost ledger or run log built as a module-level array (the notifications.ts/activity.ts pattern) loses all spend between requests, which turns the flagship 'hard-stop at cap' guarantee into a lie. This epic lays the durable substrate — new Supabase tables plus a lib/agentdb.ts wrapper that mirrors lib/db.ts, with a globalThis.__boss fallback so it also works memory-only — that all later agent epics build on. It also closes the documented schema drift by shipping the tables in SQL, not just TS.

**`P0-E06.1` — Create migration 002 with agents, agent_runs, cost_events, budgets, approvals, agent_questions tables** _(dev est: M)_
> As the operator, I want agent data stored in real tables, so that runs and spend survive deploys and cold starts instead of vanishing.

Add supabase/migrations/002_agent_native.sql defining: agents(id uuid pk, slug text unique, name text, kind text check in ('named','swarm','skill'), description text, capabilities text[] default '{}', model text, default_cap_cents int, monthly_cap_cents int, dispatch_target jsonb, status text check in ('active','paused','archived') default 'active', avatar text, created_at timestamptz); agent_runs(id, issue_id fk, agent_id fk, status text check in ('queued','running','succeeded','failed','cancelled','awaiting_input') default 'queued', model, tokens_in int default 0, tokens_out int default 0, cost_cents int default 0, duration_ms int, external_ref text, output_url text, artifact_urls jsonb, error text, started_at, finished_at, created_at); cost_events(id, run_id fk, issue_id, agent_id, product_id, kind text check in ('tokens','api','tool'), cents int not null, tokens int, note text, created_at); budgets(id, scope text check in ('portfolio','product','agent'), scope_id text, period text check in ('monthly','total'), cap_cents int not null, created_at, unique(scope,scope_id,period)); approvals(id, run_id, issue_id, requested_cents int, threshold_cents int, status text check in ('pending','approved','rejected') default 'pending', decided_by text, decided_at, reason, created_at); agent_questions(id, run_id, issue_id, agent_id, question text, options jsonb, status text check in ('open','answered','expired') default 'open', answer text, answered_by text, answered_at, created_at). Add indexes on agent_runs(issue_id), agent_runs(agent_id,status), cost_events(run_id), cost_events(product_id), agent_questions(status). Mirror the whole file into docs/SCHEMA.sql so the two stay in lockstep.

*Acceptance criteria:*
- [ ] migration 002 runs cleanly on a fresh Supabase project after 001
- [ ] docs/SCHEMA.sql contains the identical table definitions (no drift)
- [ ] All FKs cascade or set-null sensibly (agent_runs.issue_id ON DELETE CASCADE; cost_events.run_id ON DELETE CASCADE)
- [ ] Every cents column is integer and NOT NULL where it represents recorded money

Files: `supabase/migrations/002_agent_native.sql`, `docs/SCHEMA.sql`

**`P0-E06.2` — Add TS types for Agent, AgentRun, CostEvent, Budget, Approval, AgentQuestion** _(dev est: S)_
> As a developer, I want typed agent entities, so that routes and UI share one source of truth and TS strict catches drift.

In lib/types.ts add exported types matching migration 002. Change AgentName from a closed union to `type AgentName = string` (or introduce AgentRef = { id: string; slug: string }) and add `agent_id: string | null` to Issue and CreateIssueInput while KEEPING agent_name for back-compat/display. Add cost_spent_cents:number to Issue (default 0). Add AgentRunStatus, CostEventKind, BudgetScope, ApprovalStatus, QuestionStatus string-literal unions.

*Acceptance criteria:*
- [ ] tsc --noEmit passes with the widened AgentName
- [ ] Issue gains agent_id and cost_spent_cents without breaking existing consumers
- [ ] No remaining code depends on AgentName being exactly two literals

Files: `lib/types.ts`  
Depends on: Create migration 002 with agents, agent_runs, cost_events, budgets, approvals, agent_questions tables

**`P0-E06.3` — Build lib/agentdb.ts durable wrapper with globalThis fallback** _(dev est: M)_
> As the operator, I want agent reads/writes to hit Supabase when configured and a globalThis-guarded store otherwise, so that agent state never uses the evaporating bare-array pattern.

Create lib/agentdb.ts modeled on lib/db.ts: functions dbListAgents/dbCreateAgent/dbGetAgent/dbUpdateAgent, dbListRuns/dbCreateRun/dbUpdateRun/dbGetRun, dbAppendCostEvent/dbListCostEvents, dbListBudgets/dbUpsertBudget, dbListQuestions/dbAnswerQuestion, dbCreateApproval/dbDecideApproval. When supabaseAdmin() is null, fall back to an in-memory store held on globalThis.__boss (extend the Memory type in lib/store.ts to carry agents/runs/cost_events/budgets/approvals/questions) so it survives HMR and warm reuse. NEVER use a bare module-level array.

*Acceptance criteria:*
- [ ] With no Supabase env, creating an agent then re-reading in the same warm process returns it
- [ ] globalThis.__boss is the only in-memory backing (grep shows no `const store = []` in agentdb.ts)
- [ ] Every write path validates cents are integers >= 0

Files: `lib/agentdb.ts`, `lib/store.ts`  
Depends on: Add TS types for Agent, AgentRun, CostEvent, Budget, Approval, AgentQuestion

**`P0-E06.4` — Seed the registry from the current two agents + backfill agent_id on seed issues** _(dev est: S)_
> As the operator, I want alice and swarm to exist as registry rows and existing issues to point at them, so that the migration is non-breaking.

In lib/seed.ts add SEED_AGENTS = [{slug:'alice',name:'Alice',kind:'named',capabilities:['manuscript','prose','epub'],default_cap_cents:800,...},{slug:'swarm',name:'Swarm',kind:'swarm',capabilities:['multi-agent','variants'],default_cap_cents:400,...}]. Set agent_id on the six seed agent issues to the matching seed agent id, and cost_spent_cents to a realistic fraction of cap (e.g. i-1 spent 450 of 800) so the ledger UI has data. Update tests/agents.test.ts to read caps from the registry/issues rather than the hard-coded literal sum, and to not assume exactly two agent names.

*Acceptance criteria:*
- [ ] Seed agents load into the registry store on cold start
- [ ] Every seed agent issue has a non-null agent_id resolving to a seed agent
- [ ] tests/agents.test.ts passes and no longer hard-codes 800+600+500+400+300+1200 nor assumes only alice/swarm exist

Files: `lib/seed.ts`, `tests/agents.test.ts`  
Depends on: Build lib/agentdb.ts durable wrapper with globalThis fallback


<a id="p0-e07"></a>
### P0-E07 · Fix and persist the GitHub mirror: real issue reconciliation across the db layer
`P0` · effort **M** · theme _PM-core_ · source `PORT` · 3 stories

**Why this matters:** mirrorStatusFromGithub is verified dead (joins on issue_id which is always null) and sync writes to mem() while reads hit Supabase. Claim 3 — the product's headline differentiator — does not actually work in production. This must be true before any richer portfolio intelligence is trustworthy.

**`P0-E07.1` — Route sync through the db layer so links persist in production** _(dev est: S)_
> As the operator, I want synced GitHub links stored in Supabase, so that they survive serverless invocations and appear on the product page in production.

Change lib/github.ts to call dbUpsertLinks (lib/db.ts) instead of store.upsertLinks, keeping the mem() fallback via db.ts. Ensure syncProductIssues is async-consistent with the db helpers. Remove the direct store import from github.ts.

*Acceptance criteria:*
- [ ] With Supabase configured, POST /api/sync/github writes rows readable by dbListLinks
- [ ] With no Supabase env, mem() fallback still works
- [ ] github.ts no longer imports from lib/store.ts directly
- [ ] Existing sync tests updated to assert persistence path

Files: `lib/github.ts`, `lib/db.ts`, `tests/api.test.ts`

**`P0-E07.2` — Reconcile GitHub issues to local issues and populate issue_link.issue_id** _(dev est: M)_
> As the operator, I want each GitHub issue matched to (or promoted into) a local issue, so that status mirroring actually has a join to act on.

Add a reconciliation step in the sync path: for each incoming link, resolve issue_id by (a) an existing link, (b) a body/title marker like boss-pm:{id}, or (c) optionally auto-creating a local issue for the product. Persist issue_id on the link. This is the missing key that makes mirrorStatusFromGithub live.

*Acceptance criteria:*
- [ ] After sync, links for tracked issues have a non-null issue_id
- [ ] A GitHub issue already linked keeps its issue_id stable across syncs
- [ ] Auto-create is behind a per-product opt-in flag
- [ ] Unit test proves issue_id is populated (guards the original bug)

Files: `lib/github.ts`, `lib/reconcile.ts`, `lib/store.ts`, `supabase/migrations/002_github_integration.sql`  
Depends on: Route sync through the db layer so links persist in production

**`P0-E07.3` — Rewrite mirrorStatusFromGithub with a configurable state map and db persistence** _(dev est: M)_
> As the operator, I want GitHub open/closed (and labels) mapped to my workflow states without clobbering nuance, so that mirrored status is meaningful.

Rewrite mirrorStatusFromGithub to operate through db.ts, join on the now-populated issue_id, and apply a configurable map (closed→done, open→keep-or-open, optional label→doing/backlog). Never overwrite cancelled. Record each change to the durable history/activity log. Return count plus a per-issue changeset.

*Acceptance criteria:*
- [ ] Closing a GitHub issue moves the linked local issue to done on next sync
- [ ] cancelled local issues are never mirrored over
- [ ] State map is centralized and unit-tested
- [ ] Mirror runs against Supabase when configured, mem() otherwise

Files: `lib/store.ts`, `lib/db.ts`, `lib/github-statemap.ts`, `app/api/sync/github/route.ts`, `tests/store.test.ts`  
Depends on: Reconcile GitHub issues to local issues and populate issue_link.issue_id


<a id="p0-e08"></a>
### P0-E08 · Make it survive production (Vercel hardening & security)
`P0` · effort **M** · theme _Security_ · source `DATA` · 4 stories

**Why this matters:** The webhook is unauthenticated despite the UI claiming signature verification, a PostgREST filter-injection sink exists in dbGetProduct, CSV export is formula-injectable, and there's no concurrency control — the deploy target is Vercel serverless where all of this is exposed.

**`P0-E08.1` — Verify GitHub webhook signatures with GITHUB_WEBHOOK_SECRET** _(dev est: S)_
> As the owner, I want the webhook to reject forged/unsigned events, so it can't be abused to trigger syncs.

Compute HMAC-SHA256 over the raw body and compare (timing-safe) against x-hub-signature-256 using GITHUB_WEBHOOK_SECRET before processing. Reject with 401 when missing/invalid. The settings UI already promises this env var is used — make it true.

*Acceptance criteria:*
- [ ] Requests without a valid signature get 401
- [ ] Valid signed payloads process as before
- [ ] Secret absence is handled (reject or documented dev bypass)

Files: `app/api/webhooks/github/route.ts`, `lib/github.ts`

**`P0-E08.2` — Eliminate the PostgREST .or() filter-injection sink** _(dev est: S)_
> As the owner, I want product lookups to be injection-safe, so a crafted slug can't alter the query.

Replace the interpolated `.or(\`id.eq.${idOrSlug},slug.eq.${idOrSlug}\`)` in lib/db.ts with two separate `.eq` queries (try id, then slug) or a sanitized/validated identifier, removing user input from the filter grammar.

*Acceptance criteria:*
- [ ] dbGetProduct no longer interpolates raw input into a PostgREST filter string
- [ ] A slug containing commas/parentheses returns a clean not-found, not an error or unintended match
- [ ] Behavior for normal slugs/ids unchanged

Files: `lib/db.ts`

**`P0-E08.3` — Harden CSV export against formula injection and column corruption** _(dev est: S)_
> As the operator, I want exported CSVs to be safe to open, so a malicious title can't run a formula or break columns.

Quote and escape every field (not just title), and prefix any cell starting with =,+,-,@ with a neutralizing character. Consider a small CSV helper.

*Acceptance criteria:*
- [ ] All fields are individually escaped
- [ ] Cells starting with formula characters are neutralized
- [ ] A comma/newline in agent_name or product name no longer shifts columns

Files: `app/api/export/route.ts`, `lib/csv.ts`

**`P0-E08.4` — Add optimistic concurrency to issue updates** _(dev est: M)_
> As the operator, I want concurrent edits to not silently clobber each other, so the GitHub sync and my edits don't fight.

Add an updated_at (or version) precondition to dbUpdateIssue: reject with 409 when the client's expected version doesn't match. The Supabase updated_at trigger already bumps the timestamp; use it as the concurrency token.

*Acceptance criteria:*
- [ ] A stale PATCH (old updated_at) returns 409
- [ ] Fresh PATCH succeeds and returns the new updated_at
- [ ] Sync + manual edit race is resolved deterministically

Files: `lib/db.ts`, `lib/store.ts`, `app/api/issues/[id]/route.ts`  
Depends on: Standardize the response envelope


<a id="p0-e09"></a>
### P0-E09 · Harden the GitHub webhook: signature verification, event fan-out, and durable delivery log
`P0` · effort **M** · theme _Security_ · source `PORT` · 3 stories

**Why this matters:** The webhook is currently an unauthenticated write path (verified: no x-hub-signature-256 check anywhere). Portfolio Truth depends on trusting inbound GitHub state; an unsigned endpoint that triggers syncs and mutates the activity log is a P0 exploit and a credibility hole for a paid PM tool.

**`P0-E09.1` — Verify x-hub-signature-256 HMAC on every webhook delivery** _(dev est: S)_
> As the operator, I want every GitHub webhook payload cryptographically verified, so that no forged POST can mutate my portfolio state.

In app/api/webhooks/github/route.ts, read the raw request body via req.text() (not req.json), compute HMAC-SHA256 with GITHUB_WEBHOOK_SECRET, and compare against the x-hub-signature-256 header using crypto.timingSafeEqual. Reject with 401 on mismatch or missing secret/header. Add a lib/github-webhook.ts helper verifySignature(rawBody, header, secret). Parse JSON only after verification.

*Acceptance criteria:*
- [ ] A POST with a valid signature is processed; an invalid or missing signature returns 401
- [ ] Comparison uses crypto.timingSafeEqual, not string ==
- [ ] Missing GITHUB_WEBHOOK_SECRET fails closed (401/500), never open
- [ ] Raw body is read once and reused for both verification and parsing

Files: `app/api/webhooks/github/route.ts`, `lib/github-webhook.ts`, `tests/webhook.test.ts`

**`P0-E09.2` — Persist a webhook delivery log with idempotent x-github-delivery dedup** _(dev est: M)_
> As the operator, I want each webhook delivery recorded and de-duplicated, so that retries do not double-process and I can audit inbound events.

Add a webhook_deliveries table (id, delivery_id unique, event, action, repo_full_name, received_at, signature_valid bool, processed bool, error). Store x-github-delivery; if already seen, short-circuit with 200 replayed:true. Replace the lib/activity.ts write (ephemeral) with a db-backed insert.

*Acceptance criteria:*
- [ ] Replayed delivery_id is detected and not reprocessed
- [ ] Table added to supabase migration and to db.ts helpers
- [ ] Invalid-signature attempts are still logged with signature_valid:false
- [ ] Handler no longer depends on the non-persistent lib/activity.ts array

Files: `supabase/migrations/002_github_integration.sql`, `lib/db.ts`, `app/api/webhooks/github/route.ts`  
Depends on: Verify x-hub-signature-256 HMAC on every webhook delivery

**`P0-E09.3` — Fan out issues, pull_request, push, check_run/suite, and release events** _(dev est: M)_
> As the operator, I want the webhook to handle all portfolio-relevant event types, so that PR, CI, and release truth updates in near-real-time.

Extend the handler switch beyond issues/issue_comment to pull_request, push, check_run, check_suite, and release. Match the product by full repo (owner + name), not name alone, to avoid cross-owner collisions. Route each event to a typed upsert (issue_links, pull_requests, checks, releases) rather than a blanket re-sync.

*Acceptance criteria:*
- [ ] Each event type updates the correct table without a full re-fetch
- [ ] Product match uses payload.repository.full_name (owner/name)
- [ ] Unknown events return 200 ignored without side effects
- [ ] check_run/check_suite update CI status on the linked PR

Files: `app/api/webhooks/github/route.ts`, `lib/github-events.ts`, `lib/db.ts`  
Depends on: Persist a webhook delivery log with idempotent x-github-delivery dedup


<a id="p0-e10"></a>
### P0-E10 · CI/CD pipeline: lint + typecheck + test + build gate on every PR
`P0` · effort **M** · theme _Quality_ · source `QUAL` · 3 stories

**Why this matters:** Nothing currently gates merges. For an AI-agent-built repo with high churn, an automated PR gate is the single highest-leverage quality investment — it turns silent broken pushes into caught failures and makes every other quality effort enforceable.

**`P0-E10.1` — Add GitHub Actions CI workflow** _(dev est: S)_
> As the operator, I want every PR to run lint, typecheck, tests, and build, so that broken code cannot merge.

Create .github/workflows/ci.yml running on pull_request and push to main: setup Node 22, npm ci, then four jobs/steps — npm run lint, npm run typecheck (new script), npm test, npm run build. Cache npm. Fail fast per step. Use matrix only if needed; single Node version is fine.

*Acceptance criteria:*
- [ ] Workflow triggers on PR and push to main
- [ ] lint, typecheck, test, build each run and a failure fails the check
- [ ] npm dependencies are cached between runs
- [ ] A red step blocks merge (documented as required check)

Files: `.github/workflows/ci.yml`, `package.json`  
Depends on: Add typecheck script

**`P0-E10.2` — Add typecheck script (tsc --noEmit)** _(dev est: S)_
> As a contributor, I want a `npm run typecheck` command, so that type errors surface before build/CI.

Add "typecheck": "tsc --noEmit" to package.json scripts. Verify it passes against the current tree; fix or file any type errors it reveals (notably the db.ts casts).

*Acceptance criteria:*
- [ ] `npm run typecheck` exists and runs tsc --noEmit
- [ ] It passes on main (or surfaced errors are triaged)

Files: `package.json`

**`P0-E10.3` — Add pre-commit hook (lint-staged + typecheck-lite)** _(dev est: S)_
> As a contributor, I want fast local checks before commit, so that obvious failures never reach CI.

Add husky + lint-staged: on pre-commit run eslint --fix on staged .ts/.tsx and run vitest related to changed files. Keep it fast (<10s typical).

*Acceptance criteria:*
- [ ] husky pre-commit hook installed via prepare script
- [ ] lint-staged runs eslint on staged files
- [ ] Committing a lint error is blocked locally

Files: `package.json`, `.husky/pre-commit`, `.lintstagedrc.json`


<a id="p0-e11"></a>
### P0-E11 · Authentication & authorization
`P0` · effort **XL** · theme _Security_ · source `QUAL` · 2 stories

**Why this matters:** Every route and page is open and RLS is either fully permissive or off. A paid multi-tenant PM tool cannot launch without a notion of user, session, and per-tenant data isolation. This is a launch blocker for the $8-12/user pricing.

**`P0-E11.1` — Introduce authentication (Supabase Auth or equivalent)** _(dev est: L)_
> As the operator, I want to sign in, so that the board is not world-writable.

Add Supabase Auth (email/OAuth) with middleware.ts protecting app pages and API routes; unauthenticated API calls return 401. Keep the in-memory dev fallback usable via a dev bypass flag so `npm run dev` stays unblocked per AGENTS.md.

*Acceptance criteria:*
- [ ] Unauthenticated API requests return 401
- [ ] Pages redirect to sign-in when unauthenticated
- [ ] Dev mode can bypass auth via explicit env flag without shipping the bypass to prod

Files: `middleware.ts`, `lib/auth.ts`, `app/api/issues/route.ts`

**`P0-E11.2` — Tenant model + enforced RLS policies** _(dev est: L)_
> As an operator, I want my portfolio isolated from other tenants, so that data cannot leak.

Add an owner/tenant column to products/issues/issue_links and replace `using(true)` policies with policies scoped to auth.uid()/tenant. Reconcile docs/SCHEMA.sql and migration 001 into one authoritative migration. Update db.ts queries to be tenant-scoped.

*Acceptance criteria:*
- [ ] RLS policies restrict rows to the authenticated tenant (no using(true))
- [ ] A single authoritative migration defines tenanted tables
- [ ] db.ts queries filter by tenant

Files: `supabase/migrations/002_auth_rls.sql`, `docs/SCHEMA.sql`, `lib/db.ts`  
Depends on: Introduce authentication (Supabase Auth or equivalent)


<a id="p0-e12"></a>
### P0-E12 · Reliability of interactive UI — make detail-page and inbox features actually persist and degrade gracefully
`P0` · effort **L** · theme _Persistence_ · source `UX` · 3 stories

**Why this matters:** The detail page and Inbox present durable features (comments, subtasks, time, labels, notifications) that silently lose data on serverless. Either they persist or the UI must stop claiming they do. This is the difference between a demo and a product.

**`P0-E12.1` — Not-found and error states for the issue detail page** _(dev est: S)_
> As an operator, I want a clear 'issue not found' page instead of an infinite spinner, so that a stale link or deleted issue doesn't look like a hang.

Track a loading boolean separate from issue in app/issues/[id]/page.tsx. When the /api/issues/:id fetch resolves with no issue, render a not-found card with a link back to /issues. Add a caught-error state for the Promise.all load. Wrap the route in ErrorBoundary.

*Acceptance criteria:*
- [ ] Navigating to /issues/does-not-exist shows a not-found card, not 'Loading issue…'
- [ ] A failed load shows an error card with a retry button
- [ ] The page never stays on the loading text once any fetch settles

Files: `app/issues/[id]/page.tsx`, `components/ErrorBoundary.tsx`

**`P0-E12.2` — Gate or label non-persistent sub-features honestly** _(dev est: M)_
> As an operator, I don't want to add a comment or subtask that silently disappears, so that I can trust what I see.

Until the feature libs persist, either (a) hide comments/subtasks/relations/time/labels/history/inbox/activity behind a build flag when Supabase isn't configured, or (b) surface an explicit 'in-memory, non-persistent in this environment' banner sourced from /api/settings supabase_connected. Reuse the settings connection state already fetched in app/settings/page.tsx.

*Acceptance criteria:*
- [ ] When supabase_connected is false, detail sub-feature sections and Inbox/Activity show a clear non-persistent notice
- [ ] No section presents itself as durable when it is not
- [ ] When Supabase is connected the notice disappears

Files: `app/issues/[id]/page.tsx`, `app/inbox/page.tsx`, `app/activity/page.tsx`

**`P0-E12.3` — Wire ErrorBoundary and real skeletons across routes** _(dev est: M)_
> As an operator, I want fast, non-jarring loading and no white screens, so that the app feels solid.

Mount ErrorBoundary in app/layout.tsx around {children}. Replace ad-hoc 'Loading…' paragraphs with the existing TableSkeleton/CardSkeleton on issues, board, agents, workload, analytics, and the detail page.

*Acceptance criteria:*
- [ ] A thrown render error shows the fallback card, not a blank page
- [ ] Issues list and board show skeletons while data loads
- [ ] components/Skeleton.tsx exports are imported by at least four routes

Files: `app/layout.tsx`, `components/ErrorBoundary.tsx`, `components/Skeleton.tsx`, `app/issues/page.tsx`, `app/board/page.tsx`, `app/agents/page.tsx`


<a id="p0-e13"></a>
### P0-E13 · Make every feature durable — one persistence pattern, no evaporating data
`P0` · effort **XL** · theme _Persistence_ · source `FEAT` · 3 stories · _supplementary (overlaps an earlier epic)_

**Why this matters:** 11 feature modules silently lose all data on Vercel. This is the single largest gap between 'looks done' and 'is done': the detail page, inbox, and activity feed are functionally empty in production. lib/db.ts already proves the durable pattern; every feature lib must adopt it.

**`P0-E13.1` — Add globalThis guard to all feature stores (stop-the-bleed)** _(dev est: M)_
> As the operator, I want feature data to survive within a running instance so that comments/subtasks/etc are not lost between requests on a warm lambda or in dev.

Replace each `const store: T[] = []` with a `globalThis.__boss_<feature>` accessor mirroring lib/store.ts mem(). Keep all exported function signatures identical. This is the minimal fix that makes warm-instance and single-region behavior correct before the Supabase work lands.

*Acceptance criteria:*
- [ ] No feature lib declares a bare module-level mutable array; each reads through a globalThis-backed accessor
- [ ] Existing unit tests pass unchanged
- [ ] A POST then GET across two requests in dev returns the written row

Files: `lib/labels.ts`, `lib/comments.ts`, `lib/subtasks.ts`, `lib/relations.ts`, `lib/timelog.ts`, `lib/notifications.ts`, `lib/history.ts`, `lib/activity.ts`, `lib/custom-fields.ts`, `lib/sla.ts`, `lib/views.ts`

**`P0-E13.2` — Author migration 002 defining all feature tables** _(dev est: L)_
> As the operator, I want a real schema for every feature so that data persists in Supabase across deployments and regions.

Write supabase/migrations/002_features.sql creating labels, issue_labels, comments, subtasks, issue_relations, time_entries, notifications, issue_history, activity_events, custom_fields, custom_field_values, sla_policies (seeded), saved_views. Add FKs to issues(id) with on-delete cascade. Reconcile docs/SCHEMA.sql to match (including the missing priority column).

*Acceptance criteria:*
- [ ] Every Tier-2 feature has a table with columns matching its TS type
- [ ] docs/SCHEMA.sql and supabase/migrations agree, both include issues.priority
- [ ] FKs cascade-delete feature rows when an issue is deleted
- [ ] Seed rows for sla_policies and default labels/custom-fields are inserted idempotently

Files: `supabase/migrations/002_features.sql`, `docs/SCHEMA.sql`

**`P0-E13.3` — Give each feature lib a Supabase-or-memory backend like lib/db.ts** _(dev est: L)_
> As the operator, I want features backed by Supabase when configured so that nothing evaporates in production.

For each feature, add a db-layer function set that calls supabaseAdmin() and falls back to the globalThis store on null/error, exactly as lib/db.ts does for issues. Route handlers switch to the async db functions. Keep pure lib functions for tests.

*Acceptance criteria:*
- [ ] Each feature route awaits a db-layer call that uses Supabase when SUPABASE env is set
- [ ] With no Supabase env, behavior is identical to the in-memory path
- [ ] Round-trip persistence verified against a real/branch Supabase for at least comments, subtasks, time, labels
- [ ] Cascade delete of an issue removes its feature rows

Files: `lib/comments.ts`, `lib/subtasks.ts`, `lib/timelog.ts`, `lib/labels.ts`, `lib/relations.ts`, `lib/notifications.ts`, `lib/history.ts`, `lib/activity.ts`, `lib/custom-fields.ts`, `lib/sla.ts`, `lib/views.ts`  
Depends on: Author migration 002 defining all feature tables, Add globalThis guard to all feature stores (stop-the-bleed)


<a id="p0-e14"></a>
### P0-E14 · Security hardening of the existing surface
`P0` · effort **M** · theme _Security_ · source `QUAL` · 4 stories · _supplementary (overlaps an earlier epic)_

**Why this matters:** Independent of full auth, the current endpoints carry concrete, exploitable holes: an unauthenticated webhook that fires GitHub calls, PostgREST filter injection, no rate limiting, and a UI that advertises a security control that does not exist. These are cheap to close and high-impact.

**`P0-E14.1` — Verify GitHub webhook signatures** _(dev est: S)_
> As the operator, I want the webhook to reject forged payloads, so that it cannot be used to trigger syncs or abuse the GitHub API.

In app/api/webhooks/github/route.ts, read the raw body and verify X-Hub-Signature-256 HMAC against GITHUB_WEBHOOK_SECRET (constant-time compare); return 401 on mismatch. This makes the settings-page claim true.

*Acceptance criteria:*
- [ ] Requests without a valid HMAC signature get 401
- [ ] A correctly signed payload still processes
- [ ] GITHUB_WEBHOOK_SECRET added to .env.example

Files: `app/api/webhooks/github/route.ts`, `.env.example`

**`P0-E14.2` — Fix PostgREST filter injection in dbGetProduct** _(dev est: S)_
> As the operator, I want id/slug lookups to be injection-safe, so that crafted input cannot alter queries.

Replace the interpolated `.or(\`id.eq.${x},slug.eq.${x}\`)` with two parameterized .eq() queries (try id, then slug) or validate the input against a UUID/slug regex before use.

*Acceptance criteria:*
- [ ] No user input is string-interpolated into a PostgREST filter
- [ ] Lookup by id and by slug both still work
- [ ] A test passes a comma/operator-laden slug and it is treated as a literal miss, not an injection

Files: `lib/db.ts`, `tests/routes/products.route.test.ts`

**`P0-E14.3` — Add rate limiting to write and sync endpoints** _(dev est: M)_
> As the operator, I want abuse protection, so that create/sync/webhook cannot be hammered.

Add lightweight rate limiting (e.g. Upstash ratelimit or an in-memory token bucket for dev) in middleware or per-route for POST /api/issues, POST /api/sync/github, and the webhook. Return 429 when exceeded.

*Acceptance criteria:*
- [ ] Exceeding the limit returns 429
- [ ] Limits are configurable via env
- [ ] Dev fallback works without external services

Files: `lib/ratelimit.ts`, `app/api/sync/github/route.ts`, `middleware.ts`

**`P0-E14.4` — Escape CSV formula characters in export** _(dev est: S)_
> As a user, I want exported CSVs to be safe to open, so that malicious titles cannot execute as spreadsheet formulas.

In app/api/export/route.ts, prefix any cell beginning with =,+,-,@ (tab/CR too) with a quote or space before quoting. Add a test with a title like '=cmd()'.

*Acceptance criteria:*
- [ ] Cells starting with formula characters are neutralized
- [ ] Existing quote-escaping still applies
- [ ] A test verifies formula-injection is defused

Files: `app/api/export/route.ts`, `tests/routes/export.route.test.ts`


<a id="p0-e15"></a>
### P0-E15 · Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real
`P0` · effort **XL** · theme _Persistence_ · source `PM` · 3 stories · _supplementary (overlaps an earlier epic)_

**Why this matters:** Two-thirds of the product silently drops data on Vercel because every feature lib is a module-level array. No table-stakes or delight work below counts until comments/labels/relations/subtasks/time/notifications/views/history persist. This is the P0 that unblocks everything.

**`P0-E15.1` — Add SQL migrations for all feature tables** _(dev est: M)_
> As the operator, I want my comments, labels, sub-tasks, relations, time, views, notifications and history to still exist after a deploy, so that the tool is trustworthy.

Write a new migration (supabase/migrations/002_features.sql) creating: comments, subtasks, issue_relations, labels, issue_labels, time_entries, notifications, issue_history, activity_events, custom_fields, field_values, saved_views. Add the missing `priority` column to issues if absent. Mirror into docs/SCHEMA.sql.

*Acceptance criteria:*
- [ ] Migration creates all listed tables with FKs to issues/products
- [ ] issues.priority column exists in SQL
- [ ] docs/SCHEMA.sql matches the migration

Files: `supabase/migrations/002_features.sql`, `docs/SCHEMA.sql`

**`P0-E15.2` — Route every feature lib through a db-backed layer with in-memory fallback + globalThis guard** _(dev est: L)_
> As a developer, I want feature libs to use Supabase when configured and a globalThis-backed in-memory store otherwise, so that data survives serverless invocations and dev HMR.

For each of comments/subtasks/relations/labels/timelog/notifications/history/activity/views/custom-fields: move the store to globalThis (like lib/store.ts) and add a Supabase read/write path mirroring lib/db.ts's fallback pattern. Keep function signatures stable so API routes are untouched.

*Acceptance criteria:*
- [ ] No feature lib declares a bare module-level array as its only store
- [ ] With Supabase env set, data persists across simulated cold starts (test)
- [ ] Without Supabase, data survives within a process via globalThis
- [ ] Existing per-feature vitest suites still pass

Files: `lib/comments.ts`, `lib/subtasks.ts`, `lib/relations.ts`, `lib/labels.ts`, `lib/timelog.ts`, `lib/notifications.ts`, `lib/history.ts`, `lib/activity.ts`, `lib/views.ts`, `lib/custom-fields.ts`, `lib/db.ts`  
Depends on: Add SQL migrations for all feature tables

**`P0-E15.3` — Persistence smoke tests across cold-start boundary** _(dev est: M)_
> As a maintainer, I want tests proving feature data persists, so that regressions are caught.

Add tests that write a comment/label/view, re-import the module fresh (simulating a new invocation), and assert the data is readable via the Supabase-mock path.

*Acceptance criteria:*
- [ ] Test writes then reads each feature type across a module reset
- [ ] CI-style vitest run is green

Files: `tests/persistence.test.ts`  
Depends on: Route every feature lib through a db-backed layer with in-memory fallback + globalThis guard


---

## Phase 1 — Deepen the wedge (Next)

> **Goal.** Make the three differentiators real and irreplaceable: agent-native execution with an enforced spend ledger, the publishing-production operating system, and portfolio truth across every repo — with the API/quality/a11y hardening that keeps the craft bar high while the moat is built.

> **Why this order.** With the foundation fixed, invest in what makes Boss PM impossible to replace. Order within the phase follows hard dependencies. Agent-native leads because the cost ledger's hard-stop is the literal moat and it sits directly on the Phase-0 agent substrate: registry before runs (runs belong to an agent), ledger + runs before dispatch and guardrails. Publishing-domain is the deepest, least-copyable differentiator: Series/Title must exist before the stage pipeline, and the pipeline before contributor payments (payment releases on stage approval), calendar, and per-title P&L. Portfolio truth builds on the repaired mirror: GitHub App auth and pagination before PR/CI tracking, then the muster view and cash-engine P&L. The quality track (API hardening, observability, DB-boundary validation, route/a11y test coverage, surfacing already-built backend features, and the missing my-work/per-agent operator screens) runs in parallel so the wedge ships reliable, not just impressive.


<a id="p1-e16"></a>
### P1-E16 · Agent Registry & Profiles — arbitrary named agents, capabilities, dispatch config
`P0` · effort **L** · theme _Agent-native_ · source `AGENT` · 4 stories

**Why this matters:** Mangu runs dozens of domain skills (adjutant, architect, herald, the comic pipeline agents). A 2-value enum can name two of them. The registry is what lets an operator declare 'the audiobook-producer agent, capabilities [tts,acx-qc], default cap $6, dispatches to Claude Code Remote' and then assign issues to it. This is the entity every other epic hangs off — runs belong to an agent, budgets roll up to an agent, routing rules pick an agent by capability. Without it, 'agent-native' means 'two hard-coded strings'.

**`P1-E16.1` — Registry CRUD API: /api/agents (list/create) and /api/agents/[id] (get/patch/archive)** _(dev est: M)_
> As the operator, I want to create and edit agents with capabilities and a default cap, so that I can register any of my swarm's specialists.

Rewrite app/api/agents/route.ts to GET the registry (dbListAgents) merged with the existing aggregation stats, and POST to create an agent (validate slug unique, name required, kind in enum, default_cap_cents integer>=0). Add app/api/agents/[id]/route.ts with GET (agent + its runs + rollup), PATCH (edit capabilities/caps/status/dispatch_target), DELETE (soft-archive, never hard-delete if runs exist). Keep the existing by_agent/by_product summary shape available at /api/agents?view=stats for the current dashboard so nothing breaks.

*Acceptance criteria:*
- [ ] POST /api/agents creates an agent with capabilities array and returns 201
- [ ] POST with duplicate slug returns 400
- [ ] PATCH updates capabilities without touching runs
- [ ] DELETE on an agent with runs sets status='archived' rather than removing the row
- [ ] Existing dashboard stats still render via the stats view

Files: `app/api/agents/route.ts`, `app/api/agents/[id]/route.ts`, `lib/agentdb.ts`  
Depends on: Build lib/agentdb.ts durable wrapper with globalThis fallback

**`P1-E16.2` — Agent profile page /agents/[slug]** _(dev est: M)_
> As the operator, I want a page per agent showing its capabilities, budget posture, run history, and current work, so that I can judge and manage each specialist.

Add app/agents/[slug]/page.tsx: header (name, kind badge, capability chips, status toggle active/paused), budget card (monthly cap vs month-to-date spend with a burndown bar reused from the ledger epic), a runs table (status, issue, duration, cost, output link), and the list of issues currently assigned. Wire the existing app/agents/page.tsx agent cards to link into this page.

*Acceptance criteria:*
- [ ] /agents/alice renders alice's capabilities, month-to-date spend vs monthly cap, and recent runs
- [ ] Pausing an agent from this page sets status='paused' and blocks new dispatch (enforced in the dispatch epic)
- [ ] Capability chips reflect the registry capabilities array

Files: `app/agents/[slug]/page.tsx`, `app/agents/page.tsx`  
Depends on: Registry CRUD API: /api/agents (list/create) and /api/agents/[id] (get/patch/archive)

**`P1-E16.3` — Registry-driven agent picker in IssueCreate (replace the 3 hard-coded options)** _(dev est: M)_
> As the operator, I want the create form's assignee dropdown to list my real registered agents, so that I can assign to any specialist without a code change.

Replace the hard-coded <option>s in IssueCreate.tsx:196-212 with options fetched from GET /api/agents (active only). Selecting an agent pre-fills the cap input from that agent's default_cap_cents. Send agent_id (not just agent_name) in CreateIssueInput. Update validateCreate in lib/store.ts to accept agent_id and resolve/validate it against the registry, keeping the cap-required rule. Show a capability hint under the picker.

*Acceptance criteria:*
- [ ] The dropdown lists every active registry agent, not a fixed three
- [ ] Choosing an agent auto-fills the cap with its default_cap_cents (operator can override)
- [ ] Created issue persists agent_id and agent_name
- [ ] Agent selected with an empty cap still returns 400 (moat preserved)

Files: `components/IssueCreate.tsx`, `lib/store.ts`, `lib/types.ts`  
Depends on: Registry CRUD API: /api/agents (list/create) and /api/agents/[id] (get/patch/archive), Seed the registry from the current two agents + backfill agent_id on seed issues

**`P1-E16.4` — New-agent form /agents/new** _(dev est: S)_
> As the operator, I want a form to register a new agent, so that onboarding a specialist is a UI action.

Add app/agents/new/page.tsx with fields: name, slug (auto from name), kind (named|swarm|skill), capabilities (tag input), model, default cap ($), monthly cap ($, optional), dispatch target (none|claude-code-remote|github-copilot|webhook + config). POST to /api/agents, redirect to the new profile.

*Acceptance criteria:*
- [ ] Submitting creates the agent and redirects to /agents/[slug]
- [ ] Slug collision shows an inline error
- [ ] Dispatch target choice is stored as structured jsonb for the dispatch epic to consume

Files: `app/agents/new/page.tsx`  
Depends on: Registry CRUD API: /api/agents (list/create) and /api/agents/[id] (get/patch/archive)


<a id="p1-e17"></a>
### P1-E17 · Cost Ledger — actual spend vs cap, burndown, alerts, hard-stop at cap
`P0` · effort **XL** · theme _PM-core_ · source `AGENT` · 5 stories

**Why this matters:** This is the literal moat: 'stop at cap' must be real. Right now every dollar figure in the product is a sum of CAPS with no spend to compare against. The ledger records per-run cost events, maintains cost_spent_cents per issue, drives an 80%/100% alert, and — the crown-jewel guarantee — hard-stops a run at its cap. A cap you can enforce is the one thing no competitor (Linear, Height, Jira) has. This epic converts the seed issue promise 'Five variants. Stop at cap.' from prose into enforced behavior.

**`P1-E17.1` — Cost event ingestion + rolling cost_spent_cents** _(dev est: M)_
> As the operator, I want each unit of agent spend recorded as an event that rolls up onto the issue, so that spend is auditable and live.

Add POST /api/runs/[id]/cost (and internal helper dbAppendCostEvent) that inserts a cost_events row (cents, tokens, kind, note) and atomically increments agent_runs.cost_cents and the parent issue.cost_spent_cents. Expose GET /api/issues/[id]/cost returning the event list + totals. Extend lib/money.ts with formatSpend, pctOfCap(spent,cap), and remainingCents(cap,spent) helpers so all surfaces format identically.

*Acceptance criteria:*
- [ ] Posting a cost event increments both the run's cost_cents and the issue's cost_spent_cents
- [ ] GET /api/issues/[id]/cost returns ordered events summing to cost_spent_cents
- [ ] pctOfCap returns null when cap is null and a bounded 0..>100 integer otherwise
- [ ] cost_spent_cents is never allowed to go negative

Files: `app/api/runs/[id]/cost/route.ts`, `app/api/issues/[id]/cost/route.ts`, `lib/agentdb.ts`, `lib/money.ts`  
Depends on: Build lib/agentdb.ts durable wrapper with globalThis fallback

**`P1-E17.2` — Hard-stop at cap enforcement** _(dev est: L)_
> As the operator, I want a run to be cancelled the moment cumulative spend reaches its cap, so that 'stop at cap' is guaranteed, not aspirational.

In dbAppendCostEvent, after incrementing, compare issue.cost_spent_cents (or run.cost_cents against the effective cap = min(issue cap, agent monthly remaining, product/portfolio remaining)). If >= cap, set the run status to 'cancelled', stamp error='cap_reached', emit a kill signal to the dispatch adapter (cancel the Claude Code Remote session / stop trigger), and write a cost-alert. Return a 402/flag on the cost POST so the caller (the agent) knows to stop. Guard against races so two concurrent events cannot both slip over the cap.

*Acceptance criteria:*
- [ ] A cost event that would cross the cap flips the run to cancelled and records error='cap_reached'
- [ ] The dispatch adapter receives a cancel call for that run's external_ref
- [ ] Effective cap is the MIN of issue cap and any enclosing product/agent/portfolio budget remaining
- [ ] A run already at/over cap rejects further cost events

Files: `lib/agentdb.ts`, `lib/dispatch.ts`, `app/api/runs/[id]/cost/route.ts`  
Depends on: Cost event ingestion + rolling cost_spent_cents, Dispatch adapter interface + Claude Code Remote adapter

**`P1-E17.3` — Budget alerts at 80% and 100%** _(dev est: M)_
> As the operator, I want to be alerted when an issue or agent crosses 80% and 100% of budget, so that I intervene before a surprise.

On each cost event, compute pct against the effective cap; when it crosses 80 (first time) and 100 (first time), create a durable alert (extend the notifications concept but persisted via agentdb, type 'budget_80'|'budget_100') with idempotency flags on the budget/run so each threshold fires once. Surface a count badge in Nav and a list in /agent-inbox or /budgets.

*Acceptance criteria:*
- [ ] Crossing 80% creates exactly one budget_80 alert for that issue/run
- [ ] Crossing 100% creates exactly one budget_100 alert and coincides with hard-stop
- [ ] Alerts persist across a cold start (not the bare-array pattern)
- [ ] Re-posting events after 100% does not spam new alerts

Files: `lib/agentdb.ts`, `components/Nav.tsx`, `app/budgets/page.tsx`  
Depends on: Cost event ingestion + rolling cost_spent_cents

**`P1-E17.4` — Portfolio / product / agent budget rollups + monthly caps** _(dev est: L)_
> As the operator, I want spend ceilings at the product, agent, and whole-portfolio level with a monthly reset, so that no single cheap task can accumulate into an unbounded monthly bill.

Add /api/budgets (GET rollup, POST/PATCH set a cap for a scope) reading the budgets table. Compute month-to-date spend per scope by summing cost_events joined to issues/agents/products within the current calendar month. The effective-cap MIN in the hard-stop story consumes these. Monthly caps reset by virtue of the month-window sum (no cron needed) but expose remaining = cap - MTD spend.

*Acceptance criteria:*
- [ ] Setting a $500/mo portfolio cap makes remaining = 500 - sum(all cost_events this month)
- [ ] A product cap and an agent cap can both apply; effective per-run cap is the tightest binding constraint
- [ ] Rollup endpoint returns spent/cap/remaining/pct for portfolio, each product, each agent
- [ ] Month boundary changes the MTD figure without a manual reset

Files: `app/api/budgets/route.ts`, `app/budgets/page.tsx`, `lib/agentdb.ts`  
Depends on: Cost event ingestion + rolling cost_spent_cents

**`P1-E17.5` — Cost burndown UI on the issue detail page + upgraded /agents dashboard** _(dev est: M)_
> As the operator, I want to see spent-vs-cap as a burndown on each agent issue and real spend on the dashboard, so that the numbers reflect money, not caps.

On app/issues/[id]/page.tsx add an agent cost panel: cap, spent, remaining, a burndown bar (green<80, amber<100, red at cap) using pctOfCap, and the cost-event list. Fix app/agents/page.tsx so the 'budget' stats show spent AND cap (e.g. '$4.50 / $8.00') sourced from cost_spent_cents, not the cap-only sum. Add a portfolio spend total to /agents.

*Acceptance criteria:*
- [ ] Issue detail shows spent/cap/remaining and a color-staged burndown bar
- [ ] Dashboard 'budget' reads as spent-of-cap, not cap alone
- [ ] Numbers on the dashboard reconcile with the sum of cost_events

Files: `app/issues/[id]/page.tsx`, `app/agents/page.tsx`  
Depends on: Cost event ingestion + rolling cost_spent_cents, Portfolio / product / agent budget rollups + monthly caps


<a id="p1-e18"></a>
### P1-E18 · Agent Runs & Telemetry — run history, status, tokens, artifacts, logs
`P1` · effort **L** · theme _Agent-native_ · source `AGENT` · 4 stories

**Why this matters:** A dispatched agent task is invisible today. Runs make execution observable: an issue accrues a timeline of runs (queued→running→succeeded/failed/awaiting_input), each with tokens, duration, model, the output PR/artifact link, and a log stream. Runs are the join point for the entire wedge — cost events attach to a run, approvals gate a run, analytics measure runs, the inbox surfaces a run's question. Without a run record you cannot say whether the agent actually did the work.

**`P1-E18.1` — Run lifecycle API: create/list/get/update-status/cancel** _(dev est: M)_
> As the operator (and as an agent callback), I want to create a run and advance its status, so that execution is tracked from queue to terminal state.

Add app/api/runs/route.ts (GET list with filters agent_id/issue_id/status; POST create in status 'queued'), app/api/runs/[id]/route.ts (GET run+events+cost; PATCH status transitions with started_at/finished_at/duration_ms/error/output_url/artifact_urls), app/api/runs/[id]/cancel (operator or kill-switch driven). Also GET /api/issues/[id]/runs for the detail page. Enforce a legal status machine (queued→running→{succeeded,failed,cancelled,awaiting_input}; awaiting_input→running).

*Acceptance criteria:*
- [ ] Creating a run returns it in 'queued'
- [ ] PATCH to 'running' stamps started_at; PATCH to a terminal state stamps finished_at and computes duration_ms
- [ ] Illegal transitions (e.g. succeeded→running) are rejected
- [ ] GET /api/issues/[id]/runs returns runs newest-first

Files: `app/api/runs/route.ts`, `app/api/runs/[id]/route.ts`, `app/api/runs/[id]/cancel/route.ts`, `app/api/issues/[id]/runs/route.ts`, `lib/agentdb.ts`  
Depends on: Build lib/agentdb.ts durable wrapper with globalThis fallback

**`P1-E18.2` — Run log/event stream** _(dev est: S)_
> As the operator, I want a per-run log so that I can see what the agent did and diagnose a failure.

Add a lightweight run_events append (reuse cost_events shape or a run_events table: level info|warn|error, message, ts) via POST /api/runs/[id]/events and GET on the same. Cap retained events per run (e.g. 500, like activity.ts) to bound memory.

*Acceptance criteria:*
- [ ] Posting a log line appends to the run and is returned in order by GET
- [ ] Retention cap prevents unbounded growth
- [ ] Error-level events are visually distinct in the UI

Files: `app/api/runs/[id]/events/route.ts`, `lib/agentdb.ts`  
Depends on: Run lifecycle API: create/list/get/update-status/cancel

**`P1-E18.3` — Runs list page /agents/runs and run detail /runs/[id]** _(dev est: M)_
> As the operator, I want to browse all runs and drill into one, so that telemetry is navigable.

Add app/agents/runs/page.tsx (filterable table: agent, issue, status badge, tokens, duration, cost, output link) and app/runs/[id]/page.tsx (header with status + external_ref, cost panel, artifact links, log stream, cancel button). Add a StatusBadge variant for run statuses (reuse components/StatusBadge.tsx patterns).

*Acceptance criteria:*
- [ ] /agents/runs lists runs with working status/agent filters
- [ ] /runs/[id] shows logs, cost events, artifacts, and a cancel action for non-terminal runs
- [ ] Output/artifact links open the PR or file

Files: `app/agents/runs/page.tsx`, `app/runs/[id]/page.tsx`, `components/StatusBadge.tsx`  
Depends on: Run lifecycle API: create/list/get/update-status/cancel, Run log/event stream

**`P1-E18.4` — Run history panel on the issue detail page** _(dev est: S)_
> As the operator, I want an issue's run history inline, so that I see every attempt, its cost, and its output without leaving the issue.

On app/issues/[id]/page.tsx add a Runs section listing that issue's runs (status, started, duration, tokens, cost, output link) with a 'Dispatch again' button (dispatch epic). Show the currently-running run's live status.

*Acceptance criteria:*
- [ ] Issue detail lists all runs for that issue with per-run cost and output
- [ ] A running run shows a live/animated indicator
- [ ] Empty state reads sensibly for issues never dispatched

Files: `app/issues/[id]/page.tsx`  
Depends on: Run lifecycle API: create/list/get/update-status/cancel


<a id="p1-e19"></a>
### P1-E19 · Routing & Dispatch — assign actually triggers an agent
`P1` · effort **XL** · theme _Agent-native_ · source `AGENT` · 5 stories

**Why this matters:** This makes the tool NATIVE rather than a labeler: assigning (or a button press) spawns real execution against Claude Code Remote / GitHub Copilot / a webhook, creates a run, and streams status/cost back. Mangu already runs these swarms via exactly these tools, so this is the highest-leverage credibility feature — Boss PM becomes the control plane over the swarm it was built by. Auto-assign by capability turns the registry's capabilities array into a router.

**`P1-E19.1` — Dispatch adapter interface + Claude Code Remote adapter** _(dev est: L)_
> As the operator, I want a pluggable dispatch layer so that an issue can be executed by whatever backend the chosen agent targets.

Create lib/dispatch.ts exporting dispatch(issue, agent, run) and cancel(run) that switch on agent.dispatch_target.kind. Implement the 'claude-code-remote' adapter using create_session (prompt built from issue title/body, cap, capabilities) and store the returned session id as run.external_ref; implement cancel via the session interrupt/archive. Implement a 'webhook' adapter (POST issue+run to a configured URL) and a 'github-copilot' adapter (assign_copilot_to_issue / create_pull_request_with_copilot) as thinner variants. Each adapter is responsible only for start/cancel; status and cost flow back via the callback webhook.

*Acceptance criteria:*
- [ ] dispatch() creates a run in 'queued', calls the adapter, moves run to 'running' on success, and stores external_ref
- [ ] cancel() halts the external job for a run's external_ref
- [ ] An unknown/none dispatch_target creates the run but leaves it 'queued' with a note (manual mode)
- [ ] Adapter selection is driven by the agent's stored dispatch_target

Files: `lib/dispatch.ts`, `app/api/issues/[id]/dispatch/route.ts`  
Depends on: Run lifecycle API: create/list/get/update-status/cancel, Registry CRUD API: /api/agents (list/create) and /api/agents/[id] (get/patch/archive)

**`P1-E19.2` — Dispatch endpoint + button; dispatch on agent-assign** _(dev est: M)_
> As the operator, I want a Dispatch button on an agent issue and optional auto-dispatch on assignment, so that assigning does real work.

Add POST /api/issues/[id]/dispatch that loads the issue+agent, checks the agent is active and budget remains, applies approval gating (guardrails epic), then calls lib/dispatch. Add a Dispatch/Re-dispatch button to app/issues/[id]/page.tsx. Optionally, when an issue is created/updated to an agent assignee with auto_dispatch on the agent, kick dispatch from app/api/issues/route.ts (replacing the fire-and-forget notification at lines 32-33).

*Acceptance criteria:*
- [ ] Dispatch button creates a run and triggers the adapter
- [ ] Dispatch is refused (409) if the agent is paused, the kill switch is on, or budget is exhausted
- [ ] Auto-dispatch fires only for agents flagged auto_dispatch
- [ ] The create path no longer just fires a dead notification

Files: `app/api/issues/[id]/dispatch/route.ts`, `app/issues/[id]/page.tsx`, `app/api/issues/route.ts`  
Depends on: Dispatch adapter interface + Claude Code Remote adapter

**`P1-E19.3` — Agent callback webhook /api/webhooks/agent** _(dev est: M)_
> As an executing agent, I want to report status, cost, logs, and artifacts back, so that the run reflects reality and the cap can be enforced.

Add app/api/webhooks/agent/route.ts accepting {run_id, external_ref, event: 'status'|'cost'|'log'|'question'|'artifact', ...}. Route to dbUpdateRun / dbAppendCostEvent (which enforces hard-stop) / run events / agent_questions. Mirror the existing app/api/webhooks/github/route.ts structure and shared-secret header check. This is the inbound channel that closes the loop with the dispatch adapters.

*Acceptance criteria:*
- [ ] A cost callback increments spend and can trigger hard-stop + a cancel back to the adapter
- [ ] A status callback advances the run and computes duration on terminal states
- [ ] A question callback creates an agent_questions row (inbox epic)
- [ ] Unsigned/secret-mismatched callbacks are rejected

Files: `app/api/webhooks/agent/route.ts`, `lib/agentdb.ts`  
Depends on: Dispatch adapter interface + Claude Code Remote adapter, Cost event ingestion + rolling cost_spent_cents

**`P1-E19.4` — Capability-based auto-assign + routing rules** _(dev est: L)_
> As the operator, I want issues auto-routed to the best agent by capability/product/priority, so that I don't hand-pick an assignee for routine work.

Add a routing_rules concept (match jsonb: product_id?/priority?/title_regex?/label?, agent_id, auto_dispatch, enabled, priority-order) with /api/routing-rules CRUD and a resolveAgent(issue) helper that returns the first matching rule's agent, else falls back to a capability match against the registry (issue's product/labels → agent.capabilities overlap). Offer a 'Suggest agent' affordance in IssueCreate.

*Acceptance criteria:*
- [ ] An issue matching a rule is assigned (and optionally dispatched) to the ruled agent
- [ ] With no rule, resolveAgent picks the highest-capability-overlap active agent or returns null
- [ ] Rules are ordered and the first match wins
- [ ] Suggest-agent in the create form pre-selects the resolved agent

Files: `app/api/routing-rules/route.ts`, `lib/routing.ts`, `components/IssueCreate.tsx`  
Depends on: Registry CRUD API: /api/agents (list/create) and /api/agents/[id] (get/patch/archive), Dispatch endpoint + button; dispatch on agent-assign

**`P1-E19.5` — Dispatch queue + concurrency guard** _(dev est: M)_
> As the operator, I want dispatched work to queue and respect a concurrency limit, so that a burst does not spawn unbounded parallel spend.

Add a simple queue view /agents/queue over runs in 'queued'/'running', with a per-agent and global max-concurrent-runs setting (stored in settings). dispatch() checks the limit and leaves excess runs 'queued'; a lightweight drain (invoked on callbacks / on-demand) promotes queued runs when a slot frees.

*Acceptance criteria:*
- [ ] Runs beyond the concurrency limit stay 'queued' rather than starting
- [ ] Completing a run promotes the next queued run
- [ ] Queue page shows queued and running work with position

Files: `app/agents/queue/page.tsx`, `lib/dispatch.ts`, `lib/settings.ts`  
Depends on: Dispatch endpoint + button; dispatch on agent-assign, Agent callback webhook /api/webhooks/agent


<a id="p1-e20"></a>
### P1-E20 · Guardrails & Approvals — human-in-the-loop, cost thresholds, kill switch
`P1` · effort **L** · theme _Quality_ · source `AGENT` · 3 stories

**Why this matters:** The wedge is cost SAFETY. Safety needs a brake pedal: an approval gate before expensive runs, a per-scope threshold above which dispatch pauses for sign-off, and a global kill switch to freeze all agents instantly (a runaway swarm is the nightmare a publishing house fears most). These features are the reason an operator trusts autonomous agents with a budget at all, and they are entirely absent today.

**`P1-E20.1` — Cost-approval gate above a threshold** _(dev est: M)_
> As the operator, I want runs whose cap exceeds a threshold to require my approval before executing, so that expensive work is deliberate.

Add an approval_threshold_cents setting (global, overridable per agent). In the dispatch endpoint, if the effective cap >= threshold, create an approvals row (status 'pending'), leave the run 'queued', and do NOT call the adapter until approved. Add POST /api/approvals/[id]/decide (approve→dispatch proceeds; reject→run cancelled). Surface pending approvals in Nav and /agent-inbox.

*Acceptance criteria:*
- [ ] A dispatch over threshold creates a pending approval and does not start the agent
- [ ] Approving triggers the adapter and moves the run to running
- [ ] Rejecting cancels the run with reason
- [ ] Below-threshold dispatches skip the gate

Files: `app/api/approvals/route.ts`, `app/api/approvals/[id]/decide/route.ts`, `lib/dispatch.ts`, `lib/settings.ts`  
Depends on: Dispatch endpoint + button; dispatch on agent-assign

**`P1-E20.2` — Global + per-agent kill switch** _(dev est: M)_
> As the operator, I want one button that halts all agent execution, so that I can stop a runaway swarm instantly.

Add a kill-switch flag in settings (global) and agent.status='paused' (per-agent). POST /api/agents/kill toggles global freeze; when on, dispatch() refuses and any in-flight runs are cancelled via the adapter (best-effort loop over running runs calling cancel). Add a prominent kill control to app/agents/page.tsx and Nav.

*Acceptance criteria:*
- [ ] Enabling the kill switch cancels all running runs and blocks new dispatch
- [ ] Per-agent pause blocks only that agent
- [ ] Disabling the kill switch restores dispatch (queued runs can drain)
- [ ] State persists across a cold start

Files: `app/api/agents/kill/route.ts`, `lib/dispatch.ts`, `app/agents/page.tsx`, `components/Nav.tsx`, `lib/settings.ts`  
Depends on: Dispatch adapter interface + Claude Code Remote adapter, Run lifecycle API: create/list/get/update-status/cancel

**`P1-E20.3` — Human-in-the-loop checkpoints (awaiting_input)** _(dev est: M)_
> As the operator, I want an agent to pause at a defined checkpoint and wait for my go-ahead, so that I stay in control of multi-step work.

Support run status 'awaiting_input': the agent callback can set a run to awaiting_input with a prompt; the run holds until the operator resolves it (from the inbox or run detail), which transitions it back to 'running' and signals the adapter. Reuse the agent_questions channel for the prompt text.

*Acceptance criteria:*
- [ ] A run can enter awaiting_input and stops consuming budget while paused
- [ ] Operator resolution returns it to running and notifies the adapter
- [ ] awaiting_input runs are visually flagged and surfaced in the inbox

Files: `app/api/runs/[id]/route.ts`, `lib/agentdb.ts`, `app/runs/[id]/page.tsx`  
Depends on: Run lifecycle API: create/list/get/update-status/cancel, Agent inbox: question channel + operator answer


<a id="p1-e21"></a>
### P1-E21 · Agent-to-skill-domain mapping (deep tie-in to the real Mangu fleet)
`P1` · effort **M** · theme _Agent-native_ · source `PUB` · 2 stories

**Why this matters:** Boss PM's agent-native wedge is generic today (alice|swarm). Mangu's real power is a squad where each agent owns pipeline phases matching an actual skill: architect=blueprint/outline, quill=script/chapters, finisher=EPUB/metadata, herald=launch, envoy=channels. Mapping stage ownership to the real fleet lets the tool auto-route a stage to the right agent and show 'this stage is Quill's' — the tie-in that makes Boss PM feel purpose-built for this house and not portable to any other customer.

**`P1-E21.1` — Expand agent registry with domains and skill links** _(dev est: M)_
> As Renee, I want the real agent fleet (scout/architect/quill/finisher/herald/envoy/adjutant) as named assignees each tied to the phases they own, so that assigning a stage picks the right agent automatically.

Replace the alice|swarm-only AgentName with a registry (lib/agents-registry.ts): each agent = { name, label, domain_stages[], skill_slug, cost_default_cents }. Keep alice/swarm for backward compatibility. Update the DB enum via migration, validateCreate, and the create UI. Map pipeline stage keys to default agents (blueprint/outline→architect, script/chapter→quill, edit/epub/metadata→finisher, marketing/launch→herald, channel-setup→envoy).

*Acceptance criteria:*
- [ ] Issues and stages can be assigned to any fleet agent by name
- [ ] A stage's default owner agent is derived from its stage_key
- [ ] agent_name enum migration adds the new agents without breaking existing rows
- [ ] Create API still 400s an agent assignee with no cost cap

Files: `lib/agents-registry.ts`, `lib/types.ts`, `lib/store.ts`, `supabase/migrations/002_publishing_schema.sql`, `components/IssueCreate.tsx`  
Depends on: Workflow templates + per-title stage instances with owner_kind human|agent

**`P1-E21.2` — Fleet dashboard by pipeline domain + Adjutant muster view** _(dev est: M)_
> As Renee, I want the agents dashboard to show each agent's active stages and spend within their domain, plus an Adjutant-style 'one next action per title', so that I command the fleet the way the adjutant skill describes.

Extend app/agents/page.tsx to group by fleet agent and show active stages, titles touched, and cost-cap spend within their pipeline domain. Add an Adjutant muster panel: for each active title, its current stage, blocked-on (gate/agent/external), and the single next action + which agent runs it — mirroring the adjutant skill's fleet-status mode.

*Acceptance criteria:*
- [ ] Agents dashboard groups work by the real fleet and their domains
- [ ] Each agent shows active stages + total cap spend in-domain
- [ ] Muster panel lists every active title with one next action and owning agent
- [ ] Titles idle 14+ days flagged as stalled per the adjutant rule

Files: `app/agents/page.tsx`, `app/api/agents/route.ts`, `components/MusterPanel.tsx`  
Depends on: Expand agent registry with domains and skill links, Pipeline board + stage approval action with structured feedback


<a id="p1-e22"></a>
### P1-E22 · Series & Title as first-class objects above Issue (product → series → arc/volume → title → task)
`P0` · effort **XL** · theme _Publishing-domain_ · source `PUB` · 2 stories

**Why this matters:** The atomic unit of a publishing house is a TITLE (a book or an issue-of-a-series), not a repo task. Until a title exists as its own object with series/arc/volume hierarchy, no pipeline, calendar, P&L, or manifest feature has anything to attach to. This is the foundation the entire strategy stands on and the single change that reframes Boss PM from 'a tracker for a publisher' into 'a publisher's operating system'.

**`P1-E22.1` — Add Series, Arc, Volume, and Title types + durable persistence** _(dev est: L)_
> As Renee, I want THE ELEVENTH PROFESSION and its 24 issues, 4 arcs, and 4 volumes to exist as real objects, so that I can plan and track the series the way I actually run it.

Add types Series (id, product_id FK, slug, name, cadence_weeks, total_planned_issues, bible_url), Arc (id, series_id, number, name, issue_start, issue_end, arc_turn, gate_at_issue), Volume (id, series_id, number, name, collects_from, collects_to, status), and Title (id, product_id, series_id nullable, arc_id nullable, volume_id nullable, slug, name, kind: 'single-issue'|'graphic-novel'|'novel'|'audiobook'|'collected-volume'|'deluxe', issue_number nullable, status: pipeline stage key, age_category, heat_level, page_count, target_release_on, backmatter_plan). Implement CRUD in a new lib/titles.ts + lib/series.ts following the store.ts globalThis pattern, wrap in db.ts (dbListTitles/dbGetTitle/dbCreateTitle/dbListSeries), and add migration 002_publishing_schema.sql + update docs/SCHEMA.sql. An Issue gains an optional title_id FK so tasks roll up to a title. Seed THE ELEVENTH PROFESSION with all 24 issues/4 arcs/4 volumes from the roadmap skill.

*Acceptance criteria:*
- [ ] GET /api/series returns THE ELEVENTH PROFESSION with 4 arcs and 24 titles nested
- [ ] A Title persists across a simulated serverless cold start (globalThis) and to Supabase when configured
- [ ] Creating an Issue with a title_id links it; GET /api/titles/[slug] returns the title plus its child issues
- [ ] migration 002 creates series/arcs/volumes/titles tables with FKs and the issues.title_id column; docs/SCHEMA.sql matches
- [ ] Seed data includes issue #1 'Term of Art' under Arc I 'Night Classes', collected into Vol 1

Files: `lib/types.ts`, `lib/titles.ts`, `lib/series.ts`, `lib/store.ts`, `lib/db.ts`, `lib/seed.ts`, `supabase/migrations/002_publishing_schema.sql`, `docs/SCHEMA.sql`

**`P1-E22.2` — Title detail page and Series roadmap page** _(dev est: L)_
> As Renee, I want to open a series and see every issue's arc, volume, release target, and current pipeline stage on one page, so that 'where is every book' is answerable in one glance.

New app/series/[slug]/page.tsx renders the arc ladder (I-IV) with each title as a card showing issue number, current stage, and target release. New app/titles/[slug]/page.tsx is the title cockpit: header (kind, issue #, arc, volume, heat/age), a tab strip for Pipeline / P&L / Metadata / Assets / Campaign (stubs wired in later epics), and the child-issue list reusing IssueTable. Add a TitleCard component and a StatusBadge variant for pipeline stages. Link products/[slug] to its series/titles.

*Acceptance criteria:*
- [ ] /series/eleventh-profession shows 4 arcs, each listing its issues with stage + release date
- [ ] /titles/[slug] shows title header and its linked issues, using existing Chambers tokens
- [ ] Navigating product → series → title works with no orphan pages
- [ ] New rows paint optimistically consistent with the existing 80ms create discipline

Files: `app/series/[slug]/page.tsx`, `app/titles/[slug]/page.tsx`, `app/products/[slug]/page.tsx`, `components/TitleCard.tsx`, `components/StatusBadge.tsx`, `components/Nav.tsx`  
Depends on: Add Series, Arc, Volume, and Title types + durable persistence


<a id="p1-e23"></a>
### P1-E23 · Production pipeline as a stage workflow with per-stage owners, approval gates & refinement caps
`P0` · effort **XL** · theme _Publishing-domain_ · source `PUB` · 3 stories

**Why this matters:** A title's real state is not one status — it's a relay of stages (blueprint→script→thumbnails→pencils→inks→colors→letters→proof→EPUB→cover→launch), each with an owner (a human artist OR a named agent), an approval gate, and a 3-pass refinement cap. This is the single most publishing-specific capability and the thing that makes the tool feel like it was built by a publisher. No competitor models an approval relay where the owner can be an AI agent.

**`P1-E23.1` — Workflow templates + per-title stage instances with owner_kind human|agent** _(dev est: L)_
> As Renee, I want each title to carry the exact stage relay for its kind (comic vs book), with each stage owned by a person or an agent, so that the tool tracks the process I actually run instead of a flat status.

Add a WORKFLOW_TEMPLATES constant (lib/pipeline.ts): the comic relay and the 12-phase book pipeline, each stage carrying { key, label, default_owner_kind, default_agent, payment_pct, is_gate }. Add type ProductionStage (id, title_id, stage_key, owner_kind: 'human-artist'|'agent'|'operator', owner_ref: agent_name|contributor_id, status: 'not-started'|'in-progress'|'in-review'|'revise'|'approved'|'blocked', refinement_passes int, approved_by, approved_at, entered_at, due_on). On title create, instantiate the template's stages. Enforce the relay rule: a stage cannot enter 'in-progress' while its upstream stage is not 'approved' (validation in lib/pipeline.ts, 400 on violation). Cap refinement_passes at 3 and surface 'pass 3 failed → fix the upstream document' per the skill.

*Acceptance criteria:*
- [ ] Creating a comic title auto-creates thumbnails/pencils/inks/colors/letters/proof/EPUB/cover stages
- [ ] POST advancing a downstream stage while upstream is open returns 400 with a relay-violation message
- [ ] A stage owned by an agent stores agent_name; owned by a human stores contributor_id
- [ ] refinement_passes increments on each REVISE and warns at 3
- [ ] Stages persist via store.ts globalThis + db.ts Supabase, not a bare array

Files: `lib/pipeline.ts`, `lib/types.ts`, `lib/store.ts`, `lib/db.ts`, `app/api/titles/[id]/stages/route.ts`, `supabase/migrations/002_publishing_schema.sql`  
Depends on: Add Series, Arc, Volume, and Title types + durable persistence

**`P1-E23.2` — Pipeline board + stage approval action with structured feedback** _(dev est: L)_
> As Renee, I want a per-title pipeline board where I approve or send back a stage with the exact feedback format my skill requires, so that approvals are one click and the record is clean.

New app/pipeline/page.tsx (portfolio-wide, columns = stages, cards = titles) and a Pipeline tab on the title cockpit (columns = this title's stages). A StageCard shows owner (agent badge or contributor name), status, days-in-stage, and refinement pass count. An approve/revise control writes verdict APPROVED / REVISE / ESCALATE and captures the ≤3 revision-note format; approving a gate stage records approved_by + approved_at and unlocks the next stage. Idle >7 days flags red per the skill's 'where are the pages' rule.

*Acceptance criteria:*
- [ ] /pipeline shows every in-flight title placed in its current stage column
- [ ] Approving a stage unlocks the next and stamps approved_by/approved_at
- [ ] REVISE captures up to 3 notes and increments refinement_passes
- [ ] A stage idle >7 days renders a visible stale flag
- [ ] Agent-owned stages show the agent badge; human-owned show the contributor

Files: `app/pipeline/page.tsx`, `app/titles/[slug]/page.tsx`, `components/PipelineBoard.tsx`, `components/StageCard.tsx`, `app/api/titles/[id]/stages/route.ts`  
Depends on: Workflow templates + per-title stage instances with owner_kind human|agent

**`P1-E23.3` — Per-page tracker for comics (postage-stamp status matrix)** _(dev est: M)_
> As Renee, I want a per-page grid showing thumbnails/pencils/inks/colors/letters status for each of the 22 pages, so that I can answer 'where are the pages' precisely and catch even-page reveal errors.

Add type ComicPage (id, title_id, page_number, beat_name, thumb_status, pencil_status, ink_status, color_status, letter_status, reveal_on_even bool, idle_since). Render a compact matrix on the title cockpit: rows = pages, columns = art stages, cells = APPROVED/IN/— chips (the skill's 'P05 — inks APPROVED · colors IN · letters —' line as a grid). Flag any page idle >7 days and any reveal not on an even page.

*Acceptance criteria:*
- [ ] A comic title shows a 22-row page matrix with 5 stage columns
- [ ] Each cell reflects approved/in-progress/not-started and is editable
- [ ] Pages idle >7 days are visually flagged
- [ ] reveal_on_even mismatch surfaces a warning
- [ ] Page rows persist durably

Files: `lib/pipeline.ts`, `lib/types.ts`, `app/titles/[slug]/page.tsx`, `components/PageTracker.tsx`, `app/api/titles/[id]/pages/route.ts`  
Depends on: Workflow templates + per-title stage instances with owner_kind human|agent


<a id="p1-e24"></a>
### P1-E24 · Contributor contracts, payment milestones & kill-fees
`P1` · effort **L** · theme _Publishing-domain_ · source `PUB` · 3 stories

**Why this matters:** The art relay moves real money on approval (10% thumbs / 40% pencils / 30% inks / final 20%), and kill-fees fire at 3 weeks dark. This is money leaving the building that no generic PM tool tracks. Tying payment release to stage approval — and doing it for human artists the same way cost-caps govern agents — is a uniquely publishing capability that also extends Boss PM's existing 'agent spend is a first-class field, surface it' posture to human spend.

**`P1-E24.1` — Contributor & contract objects with deal model and rates** _(dev est: M)_
> As Renee, I want each artist/editor/letterer stored with their role, deal model, page rate and kill-fee, so that payment tracking has a real payee.

Add type Contributor (id, name, role: 'penciller'|'inker'|'colorist'|'letterer'|'editor'|'designer'|'cover-artist'|'narrator', deal_model: 'work-for-hire'|'co-creator', page_rate_cents, weekly_page_rate_cents, kill_fee_cents, rights_note, start_date, status). CRUD in lib/contributors.ts (store+db pattern). A ProductionStage.owner_ref can point at a contributor. Seed with placeholder rates from comic-book-craft ranges (line art $75-250, colors $35-150, letters $10-25, cover $300-1000) flagged as quote-against ranges.

*Acceptance criteria:*
- [ ] POST /api/contributors creates a payee with role + deal_model
- [ ] A stage can be assigned to a contributor by id
- [ ] Contributors persist durably
- [ ] Seeded rate placeholders are labeled as ranges, not commitments

Files: `lib/contributors.ts`, `lib/types.ts`, `lib/store.ts`, `lib/db.ts`, `app/api/contributors/route.ts`, `supabase/migrations/002_publishing_schema.sql`  
Depends on: Workflow templates + per-title stage instances with owner_kind human|agent

**`P1-E24.2` — Payment milestones released on stage approval** _(dev est: M)_
> As Renee, I want approving pencils to mark 40% of the page fee due to the penciller, so that payment tracking is a byproduct of approvals, never a spreadsheet.

Add type PaymentMilestone (id, title_id, stage_key, contributor_id, pct, amount_cents, trigger: 'stage-approved'|'kill-fee'|'change-order', status: 'pending'|'released'|'held', released_at). On stage approval, auto-create/release the milestone using the template's payment_pct and the contributor's rate. Enforce the skill rule: never release a downstream milestone while an upstream stage is open. Render a payment ledger on the title cockpit and a portfolio 'money owed to contributors' rollup.

*Acceptance criteria:*
- [ ] Approving pencils creates a released milestone at 40% of the page fee
- [ ] Attempting to release a downstream milestone with an open upstream stage is blocked
- [ ] The title ledger sums pending vs released per contributor
- [ ] Milestones persist durably and appear in per-title cost (feeds P&L epic)

Files: `lib/payments.ts`, `lib/types.ts`, `app/api/payments/route.ts`, `components/PaymentLedger.tsx`, `app/titles/[slug]/page.tsx`  
Depends on: Contributor & contract objects with deal model and rates, Pipeline board + stage approval action with structured feedback

**`P1-E24.3` — Pace-slip alerts, kill-fee trigger, and change-order logging** _(dev est: S)_
> As Renee, I want the tool to warn me when an artist is two weeks behind and to compute the kill-fee when they go three weeks dark, so that I follow my own trouble protocol instead of improvising.

Compute pace from stage entered_at vs house pace (1-2 pages/artist-week). One week behind = note; two weeks = 'renegotiate schedule' banner; three weeks dark = kill-fee trigger that creates a kill-fee milestone (pay approved work, retain rights). A change-order action logs a paid change at stage rate after a stage is approved. Surface all three on the pipeline board and title cockpit.

*Acceptance criteria:*
- [ ] A stage 2 weeks past pace shows a renegotiate banner
- [ ] 3 weeks with no page activity offers a one-click kill-fee milestone for approved work only
- [ ] A post-approval change creates a change-order milestone at stage rate
- [ ] Alerts derive from real entered_at/updated_at timestamps

Files: `lib/payments.ts`, `lib/pipeline.ts`, `components/PipelineBoard.tsx`, `app/titles/[slug]/page.tsx`  
Depends on: Payment milestones released on stage approval


<a id="p1-e25"></a>
### P1-E25 · Editorial & launch calendar, release cadence, and go/no-go gates
`P1` · effort **L** · theme _Publishing-domain_ · source `PUB` · 2 stories

**Why this matters:** The series runs on a locked 6-week cadence with hard gates (Gate A before financing 2-6; arc-end gates at 6/12/18; M1/M2/M3 sign-offs). A publisher lives or dies on 'what ships when' and 'what am I not allowed to advance yet'. Encoding cadence + gate-blocking turns the generic roadmap page into a real editorial calendar and enforces the operator's own discipline.

**`P1-E25.1` — Go/no-go gate objects with sign-off enforcement** _(dev est: M)_
> As Renee, I want M1/M2/M3 and Gate A/arc-end gates recorded per title with an explicit sign-off, so that no title can be marked past a gate it hasn't cleared.

Add type LaunchGate (id, title_id or series_id, gate_key: 'M1'|'M2'|'M3'|'GateA'|'arc-end', criteria JSON checklist, status: 'pending'|'passed'|'blocked', owner, passed_at, note). Block a title from advancing into gated stages until the gate is 'passed'. A GateBadge shows pending/passed on the title cockpit and pipeline board. Seed EP issue #1 with M1 passed (script approved) per the roadmap status block.

*Acceptance criteria:*
- [ ] A title cannot enter a post-M2 stage until M2 gate = passed
- [ ] Passing a gate records owner + passed_at + note
- [ ] Gate status renders on title cockpit and pipeline board
- [ ] Seed reflects EP #1 M1 passed, 2-6 blocked behind Gate A

Files: `lib/gates.ts`, `lib/types.ts`, `app/api/titles/[id]/gates/route.ts`, `components/GateBadge.tsx`, `app/titles/[slug]/page.tsx`  
Depends on: Workflow templates + per-title stage instances with owner_kind human|agent

**`P1-E25.2` — Cadence engine + editorial calendar view** _(dev est: M)_
> As Renee, I want a calendar of target release dates driven by the series cadence, so that I can see the next six months of ships and spot cadence slips.

Derive target_release_on for series titles from series.cadence_weeks and the prior issue's release. New app/calendar/page.tsx renders a month grid of title releases and gate deadlines across all products, color-coded by kind and cash-engine|lab. Flag titles whose stage progress can't hit their release at house pace. Enforce the roadmap rule 'monthly cadence only with 3 issues fully banked'.

*Acceptance criteria:*
- [ ] /calendar shows title releases and gate deadlines by month
- [ ] Changing series cadence_weeks reflows downstream target dates
- [ ] A title behind pace for its release date is flagged
- [ ] Cash-engine vs lab titles are visually distinguished (reuses engine_tag semantics)

Files: `lib/series.ts`, `app/calendar/page.tsx`, `components/CalendarGrid.tsx`, `app/roadmap/page.tsx`, `components/Nav.tsx`  
Depends on: Go/no-go gate objects with sign-off enforcement, Add Series, Arc, Volume, and Title types + durable persistence


<a id="p1-e26"></a>
### P1-E26 · Per-title P&L across channels (production cost incl. agent spend vs revenue)
`P1` · effort **L** · theme _Publishing-domain_ · source `PUB` · 3 stories

**Why this matters:** engine_tag asks 'which of my things makes money' but cannot compute it. A publisher needs per-title P&L: production cost (agent spend + contributor payments + services + ISBN + ads) vs revenue by channel (KDP/Apple/ACX/BookBub), with ROI, to know which title is the cash engine. This is the sharpest possible evolution of Boss PM's existing money posture and directly upgrades the 'PORTFOLIO TRUTH' claim from status-truth to money-truth.

**`P1-E26.1` — Channel registry + per-title channel listing/metadata** _(dev est: M)_
> As Renee, I want each title's status and metadata on KDP/Apple/ACX/IngramSpark/BookBub, so that I know where it's live and where an account gap blocks launch.

Add CHANNELS constant (KDP, Apple Books, IngramSpark, ACX/Audible, Google Play, Kobo, D2D, BookBub) from the envoy roster. Add type TitleChannel (id, title_id, channel_key, status: 'not-listed'|'draft'|'in-review'|'live', identifier (ASIN/ISBN), price_cents, royalty_rate, list_url, account_ready bool). Render a channel matrix on the title cockpit. Link account_ready=false to a stakeholder gap (Envoy).

*Acceptance criteria:*
- [ ] A title shows a matrix of channels with per-channel status and price
- [ ] account_ready=false renders an Envoy stakeholder-gap flag
- [ ] Channels persist durably
- [ ] Channel list matches the envoy skill roster

Files: `lib/channels.ts`, `lib/types.ts`, `app/api/titles/[id]/channels/route.ts`, `components/ChannelMatrix.tsx`, `app/titles/[slug]/page.tsx`  
Depends on: Add Series, Arc, Volume, and Title types + durable persistence

**`P1-E26.2` — Revenue & cost entries with agent-spend rollup** _(dev est: M)_
> As Renee, I want revenue per channel and every cost (agent spend, artist payments, ISBN, ads) attributed to a title, so that P&L is computed, not guessed.

Add types RevenueEntry (id, title_id, channel_key, period, units, gross_cents, net_cents, source) and CostEntry (id, title_id, category: 'agent-spend'|'contributor'|'service'|'isbn'|'ads', amount_cents, ref_id, incurred_on). Auto-derive agent-spend cost from the title's agent-assigned issues' cost_cap_cents and contributor cost from released payment milestones. Provide POST endpoints for manual revenue import.

*Acceptance criteria:*
- [ ] Agent-owned issue caps roll into the title's agent-spend cost
- [ ] Released payment milestones roll into contributor cost
- [ ] Manual revenue rows can be added per channel per month
- [ ] All entries persist durably and are queryable per title

Files: `lib/pnl.ts`, `lib/types.ts`, `app/api/titles/[id]/pl/route.ts`, `app/api/pnl/route.ts`, `supabase/migrations/002_publishing_schema.sql`  
Depends on: Channel registry + per-title channel listing/metadata, Payment milestones released on stage approval

**`P1-E26.3` — P&L view + portfolio cash-engine ranking** _(dev est: M)_
> As Renee, I want each title's cost vs revenue vs ROI, and a portfolio ranking of which titles are cash engines, so that I fund the winners.

A P&L tab on the title cockpit (cost breakdown, revenue by channel, net, ROI). A portfolio view (extend app/analytics/page.tsx or new app/pnl/page.tsx) ranks titles by ROI and net, and reconciles against each product's engine_tag (flag a 'lab'-tagged product whose title is actually a cash engine, and vice versa).

*Acceptance criteria:*
- [ ] Title P&L shows cost, revenue-by-channel, net, and ROI
- [ ] Portfolio view ranks titles by net and ROI
- [ ] engine_tag mismatch (lab that earns / cash-engine that doesn't) is surfaced
- [ ] Numbers reconcile with the underlying cost/revenue entries

Files: `app/pnl/page.tsx`, `app/analytics/page.tsx`, `components/PLTable.tsx`, `app/titles/[slug]/page.tsx`  
Depends on: Revenue & cost entries with agent-spend rollup


<a id="p1-e27"></a>
### P1-E27 · Real GitHub auth, pagination, and rate-limit resilience (GitHub App + PAT)
`P1` · effort **L** · theme _Persistence_ · source `PORT` · 3 stories

**Why this matters:** A single global PAT with a 50-issue single-page fetch cannot serve a multi-repo portfolio: repos silently truncate and rate limits are shared. GitHub App installation tokens give per-org scoping, higher limits, and are the professional integration path.

**`P1-E27.1` — Paginate issue fetch and add ETag conditional caching** _(dev est: M)_
> As the operator, I want all issues fetched regardless of count, so that large repos show complete truth without wasting rate budget.

In lib/github.ts, follow the Link rel=next header to page through all issues; send If-None-Match with a stored ETag per (repo, resource) and treat 304 as no-change. Store etag + last_synced on a github_sync_state table keyed by product_id.

*Acceptance criteria:*
- [ ] A repo with >50 issues returns all of them
- [ ] A 304 response skips re-processing and is counted as unchanged
- [ ] ETag is persisted and reused across syncs
- [ ] Rate-limit headers are respected with backoff on 403 secondary limits

Files: `lib/github.ts`, `lib/db.ts`, `supabase/migrations/002_github_integration.sql`

**`P1-E27.2` — Add GitHub App installation-token auth alongside PAT** _(dev est: L)_
> As the operator, I want to connect via a GitHub App installation, so that each org gets scoped, higher-limit, auditable access instead of one shared PAT.

Add lib/github-auth.ts that mints installation access tokens (JWT signed with GITHUB_APP_PRIVATE_KEY, exchanged per installation_id) and caches them until expiry. A settings toggle selects App vs PAT per owner. Store installation_id per product/owner.

*Acceptance criteria:*
- [ ] Sync uses an installation token when an installation is configured for the owner
- [ ] Tokens are cached and refreshed before the ~1h expiry
- [ ] Falls back to GITHUB_TOKEN PAT when no App is configured
- [ ] Private key is read from env, never committed or logged

Files: `lib/github-auth.ts`, `lib/github.ts`, `app/settings/page.tsx`, `app/api/settings/route.ts`  
Depends on: Paginate issue fetch and add ETag conditional caching

**`P1-E27.3` — Per-owner sync-state dashboard and manual/scheduled sync trigger** _(dev est: M)_
> As the operator, I want to see last-sync time, rate-limit budget, and errors per repo, so that I trust the portfolio is current.

Expose github_sync_state (last_synced, etag, rate_remaining, last_error) via /api/sync/github GET and render a settings panel. Add an optional scheduled sync (cron route) that refreshes all github_repo products.

*Acceptance criteria:*
- [ ] Settings shows per-repo last-sync and any last_error
- [ ] Rate-limit remaining is visible per owner
- [ ] A manual 'sync all' and a scheduled path both update sync-state
- [ ] Errors surface per repo without failing the whole batch (matches current try/catch)

Files: `app/settings/page.tsx`, `app/api/sync/github/route.ts`, `app/api/cron/sync/route.ts`  
Depends on: Add GitHub App installation-token auth alongside PAT


<a id="p1-e28"></a>
### P1-E28 · First-class PR, commit/branch, and CI status tracking
`P1` · effort **L** · theme _Publishing-domain_ · source `PORT` · 3 stories

**Why this matters:** Issues alone don't tell you if work is shipping. PRs, their linked branches/commits, and CI checks are the actual 'is it done and green?' signal the operator needs across every Mangu repo — and the current code explicitly discards all of it.

**`P1-E28.1` — Add pull_requests, commits, and checks tables keyed to products/issues** _(dev est: M)_
> As the operator, I want PRs, commits, and CI checks stored per repo, so that shipping status is queryable across the portfolio.

New tables: pull_requests (id, product_id, issue_id nullable, number, title, state, draft, merged, head_ref, base_ref, html_url, ci_status, updated_at, unique(owner,repo,number)); commits (sha, product_id, pr_number nullable, message, author, html_url, committed_at); checks (id, pr_number, name, status, conclusion, html_url). Add db.ts helpers and mem() fallback.

*Acceptance criteria:*
- [ ] Migration adds all three tables with natural-key uniqueness
- [ ] db.ts exposes dbUpsertPRs/dbListPRs/dbUpsertChecks with mem fallback
- [ ] PR rows carry a rolled-up ci_status derived from checks
- [ ] Linked issue_id resolved via branch name or PR body marker

Files: `supabase/migrations/002_github_integration.sql`, `lib/db.ts`, `lib/types.ts`

**`P1-E28.2` — Fetch and sync PRs + checks in the sync path** _(dev est: M)_
> As the operator, I want a sync to also pull open/recent PRs and their check runs, so that the board reflects real CI state.

Extend lib/github.ts with syncProductPRs (GET /repos/{o}/{r}/pulls?state=all) and check-run fetch per head sha. Link PRs to issues via 'Closes #' references or a branch naming convention. Persist via the new db helpers.

*Acceptance criteria:*
- [ ] Open and recently-merged PRs appear per product
- [ ] Each PR shows aggregated CI status (success/failure/pending)
- [ ] PR→issue links are populated where a Closes/Fixes reference exists
- [ ] Draft PRs are distinguished from ready ones

Files: `lib/github.ts`, `lib/reconcile.ts`, `app/api/sync/github/route.ts`  
Depends on: Add pull_requests, commits, and checks tables keyed to products/issues, Fan out issues, pull_request, push, check_run/suite, and release events

**`P1-E28.3` — PR + CI panel on the product page and a portfolio 'shipping' view** _(dev est: M)_
> As the operator, I want to see open PRs and their CI status per product and across the portfolio, so that I know what is about to ship or is blocked red.

Add a PR table to app/products/[slug]/page.tsx (number, title, draft/ready, CI badge, links to issue) and a /shipping route rolling up all open PRs across repos sorted by CI-red-first. Reuse StatusBadge/PriorityBadge patterns; add a CiBadge component.

*Acceptance criteria:*
- [ ] Product page lists that repo's open PRs with a CI badge
- [ ] A portfolio /shipping view aggregates PRs across all repos
- [ ] Red CI sorts to the top
- [ ] Clicking a PR opens its GitHub html_url

Files: `app/products/[slug]/page.tsx`, `app/shipping/page.tsx`, `components/CiBadge.tsx`, `components/Nav.tsx`  
Depends on: Fetch and sync PRs + checks in the sync path


<a id="p1-e29"></a>
### P1-E29 · Multi-repo portfolio intelligence: health board, engine rollups, and muster view
`P1` · effort **L** · theme _Portfolio_ · source `PORT` · 3 stories

**Why this matters:** The core wedge vs Linear/Jira is one board across every Mangu repo split by cash-engine vs lab. Today the home page counts open issues but offers no health scoring, no cross-repo dependency view, and no 'where is every product right now' muster — the exact things the operator (and the adjutant workflow) need.

**`P1-E29.1` — Portfolio health scoring per product and per engine** _(dev est: M)_
> As the operator, I want a health score per product rolling up open criticals, stale issues, CI-red PRs, and cost-cap burn, so that I can triage the whole house at a glance.

Add a lib/health.ts that computes a per-product health signal from issues (open criticals, overdue due_on, staleness), GitHub PR CI status, and agent cap totals. Surface a color-coded health chip on app/page.tsx cards and per-engine (cash-engine vs lab) rollup tiles. Extend /api/stats to return health rollups.

*Acceptance criteria:*
- [ ] Each product card shows a health state (green/amber/red) with the driving reason
- [ ] cash-engine and lab each get an aggregate health rollup tile
- [ ] Health accounts for overdue issues, open criticals, and CI-red PRs
- [ ] /api/stats returns the rollup used by the UI

Files: `lib/health.ts`, `app/page.tsx`, `app/api/stats/route.ts`  
Depends on: Fetch and sync PRs + checks in the sync path

**`P1-E29.2` — Cross-repo dependency graph** _(dev est: L)_
> As the operator, I want to declare that one product/issue blocks another across repos, so that portfolio-level sequencing is visible.

Add a portfolio_dependencies table (id, from_product_id, from_issue_id nullable, to_product_id, to_issue_id nullable, kind blocks|depends-on, note). Render a dependency panel per product and a portfolio-wide graph/list view. Detect cross-repo blockers surfaced by GitHub 'Depends on owner/repo#n' references during sync.

*Acceptance criteria:*
- [ ] A dependency can be created across two products
- [ ] Product page lists what blocks it and what it blocks
- [ ] A portfolio view lists all cross-repo blockers
- [ ] GitHub cross-repo references are auto-suggested as dependencies

Files: `supabase/migrations/003_portfolio.sql`, `lib/dependencies.ts`, `lib/db.ts`, `app/products/[slug]/page.tsx`, `app/portfolio/page.tsx`

**`P1-E29.3` — 'Where is every product' muster view** _(dev est: M)_
> As the operator, I want a single muster table of every product with stage, open/agent counts, health, last GitHub sync, and last release, so that the weekly review is one screen.

Add /muster: one row per product with engine tag, health chip, open/doing/done counts, agent task count + total cap, last synced_at, latest release tag, and open-PR count. Sortable and engine-filterable. This is the operator/adjutant home for portfolio truth.

*Acceptance criteria:*
- [ ] Every product appears exactly once with the listed columns
- [ ] Sortable by health, open count, and last-sync
- [ ] Engine filter (all/cash-engine/lab) works
- [ ] Rows link to the product page

Files: `app/muster/page.tsx`, `app/api/stats/route.ts`, `components/Nav.tsx`  
Depends on: Portfolio health scoring per product and per engine


<a id="p1-e30"></a>
### P1-E30 · Product P&L and cash-engine ROI (the money view)
`P1` · effort **L** · theme _Portfolio_ · source `PORT` · 3 stories

**Why this matters:** cash-engine vs lab is the strategic frame, but money_note is just prose. Turning it into real revenue/cost tracking gives the operator a defensible ROI view — cash engines must earn, labs must justify burn — which no generic PM tool offers and which directly backs the positioning.

**`P1-E30.1` — Structured revenue/cost model per product** _(dev est: M)_
> As the operator, I want to record revenue and cost per product over time, so that money_note becomes real P&L instead of a sentence.

Add product_financials table (id, product_id, period_month, revenue_cents, cost_cents, note, source manual|stripe|import). Keep money_note as a headline but compute figures from rows. Add db helpers and a simple entry form on the product page.

*Acceptance criteria:*
- [ ] Monthly revenue and cost can be entered per product
- [ ] Product page shows current-month and trailing P&L
- [ ] money_note remains editable as a summary
- [ ] Figures persist via db layer with mem fallback

Files: `supabase/migrations/003_portfolio.sql`, `lib/finance.ts`, `lib/db.ts`, `app/products/[slug]/page.tsx`

**`P1-E30.2` — Cash-engine ROI dashboard tying spend (incl. agent caps) to revenue** _(dev est: M)_
> As the operator, I want an ROI view that nets revenue against costs including agent cost-cap burn, so that I know which engines actually pay.

Add /money: per-product and per-engine revenue, cost, agent-cap committed vs consumed, and ROI %. Roll cash-engine vs lab separately (labs show burn/runway, engines show margin). Extend analytics with a money section. Agent cap totals already computed in app/page.tsx become a real cost input here.

*Acceptance criteria:*
- [ ] Per-product ROI = (revenue - cost) / cost with agent caps included in cost
- [ ] cash-engine aggregate margin and lab aggregate burn shown separately
- [ ] Committed vs consumed agent budget visible
- [ ] Money view exportable via existing /api/export

Files: `app/money/page.tsx`, `app/analytics/page.tsx`, `lib/finance.ts`, `app/api/stats/route.ts`  
Depends on: Structured revenue/cost model per product

**`P1-E30.3` — Optional Stripe revenue import for cash engines** _(dev est: M)_
> As the operator, I want cash-engine revenue pulled from Stripe, so that the money view is accurate without manual entry.

Add an optional Stripe reader that maps a product to a Stripe account/product and fills product_financials.revenue_cents by month with source:stripe. Behind an env-gated integration, verifying Stripe webhook signatures (note: seed issue i-8 already flags this pattern).

*Acceptance criteria:*
- [ ] A product can map to a Stripe source and import monthly revenue
- [ ] Imported rows are marked source:stripe and don't clobber manual rows
- [ ] Stripe webhooks are signature-verified
- [ ] Integration is optional and off by default

Files: `lib/stripe.ts`, `app/api/webhooks/stripe/route.ts`, `lib/finance.ts`  
Depends on: Structured revenue/cost model per product


<a id="p1-e31"></a>
### P1-E31 · API hardening: validation, error envelope, pagination
`P1` · effort **L** · theme _PM-core_ · source `DATA` · 4 stories

**Why this matters:** No zod/schema validation on the write hot path (junk enums persist in memory but not Supabase, so validity depends on backend), no shared error contract, and no pagination — the API can't scale or be consumed reliably.

**`P1-E31.1` — Introduce zod schemas and a shared validate() helper for every mutating route** _(dev est: L)_
> As an API consumer, I want consistent 400s with field-level detail on bad input, so I can trust and handle validation.

Add zod schemas for issue create/update, product create, and each feature payload; parse in a shared helper that returns a typed error envelope. Critically, validate enum values (status, priority, assignee_kind) on PATCH /issues/[id] and batch, and re-run the agent cost-cap invariant on update so the moat rule holds on PATCH, not just POST.

*Acceptance criteria:*
- [ ] PATCH /issues/[id] with status:'bogus' returns 400 in both backends
- [ ] Switching an issue to agent with no cost_cap returns 400 on PATCH
- [ ] Every mutating route validates via a shared zod-backed helper
- [ ] Validation errors include which field failed

Files: `lib/validation.ts`, `app/api/issues/route.ts`, `app/api/issues/[id]/route.ts`, `app/api/issues/batch/route.ts`, `app/api/products/route.ts`

**`P1-E31.2` — Standardize the response envelope across all routes** _(dev est: M)_
> As an API consumer, I want a predictable {data|error, code} shape, so error handling is uniform.

Adopt a single envelope (e.g. success `{data:...}`, error `{error:{message, code, field?}}`) via a small response helper and apply it to all 27 routes. Preserve HTTP status semantics (201/400/404/409/500).

*Acceptance criteria:*
- [ ] All routes return via the shared helper
- [ ] Errors carry a machine-readable code
- [ ] A test asserts envelope consistency across a sample of routes

Files: `lib/api-response.ts`, `app/api/issues/route.ts`, `app/api/products/route.ts`, `app/api/labels/route.ts`

**`P1-E31.3` — Add pagination and server-side filtering to list endpoints** _(dev est: M)_
> As the operator with a large portfolio, I want paged, filterable issue lists, so the board and API stay fast.

Add limit/cursor (or offset) to GET /api/issues, /api/search, /api/export, and return total counts. Add ?status, ?priority, ?assignee_kind, ?agent_name filters to /api/issues so the board/roadmap stop pulling everything and filtering client-side.

*Acceptance criteria:*
- [ ] GET /api/issues supports limit + cursor and returns nextCursor
- [ ] Status/priority/assignee filters work server-side
- [ ] Export streams or pages rather than loading all rows

Files: `app/api/issues/route.ts`, `app/api/search/route.ts`, `app/api/export/route.ts`, `lib/db.ts`  
Depends on: Standardize the response envelope

**`P1-E31.4` — Fill missing CRUD endpoints implied by the UI** _(dev est: M)_
> As the operator, I want to edit/delete products, delete comments, and rename labels, so the API matches what the product needs.

Add PATCH+DELETE and GET /api/products/[slug], DELETE for a single comment, PATCH for label rename, and subtask reorder using the existing position column. Wire the already-existing but unrouted lib functions (deleteComment).

*Acceptance criteria:*
- [ ] Products can be updated and deleted via API
- [ ] A comment can be deleted via API
- [ ] Labels can be renamed; subtasks can be reordered

Files: `app/api/products/[slug]/route.ts`, `app/api/issues/[id]/comments/route.ts`, `app/api/labels/route.ts`, `app/api/issues/[id]/subtasks/route.ts`  
Depends on: Standardize the response envelope


<a id="p1-e32"></a>
### P1-E32 · Observability, error tracking & honest failure modes
`P1` · effort **M** · theme _Observability_ · source `QUAL` · 3 stories

**Why this matters:** There is no logging, no error monitoring, and — worst — db.ts silently swallows DB errors and serves/writes ephemeral seed data, so production failures are invisible and cause silent data loss. You cannot operate what you cannot see.

**`P1-E32.1` — Stop silently swallowing Supabase errors** _(dev est: M)_
> As the operator, I want DB failures surfaced, so that I never silently lose writes to ephemeral memory.

In lib/db.ts, distinguish 'no client configured' (legitimate in-memory mode) from 'client configured but query errored'. When a client exists and a query/insert errors, log it and either throw (so the route returns 5xx) or return a typed error — do NOT fall back to memory for writes. Keep the memory path only when no client is configured.

*Acceptance criteria:*
- [ ] A configured-but-failing insert does not silently return in-memory data
- [ ] Errors are logged with context
- [ ] The no-client dev path is unchanged
- [ ] A test simulates a client error and asserts it is not swallowed as success

Files: `lib/db.ts`, `tests/db.error.test.ts`

**`P1-E32.2` — Structured logging utility** _(dev est: S)_
> As the operator, I want consistent server logs, so that I can trace requests and errors.

Add lib/log.ts (thin wrapper over console with level + JSON in prod) and use it at route boundaries and in db.ts error branches. Include request id where available.

*Acceptance criteria:*
- [ ] A log helper exists and is used in at least issues, sync, webhook routes and db.ts error paths
- [ ] Log level is env-controlled

Files: `lib/log.ts`, `app/api/issues/route.ts`, `lib/db.ts`

**`P1-E32.3` — Wire error monitoring (Sentry or equivalent)** _(dev est: M)_
> As the operator, I want production errors reported, so that I learn about failures without reading logs.

Integrate an error-tracking SDK for both server routes and the client ErrorBoundary; capture unhandled route exceptions and client render errors. Gate on an env DSN so dev stays quiet.

*Acceptance criteria:*
- [ ] Server route exceptions are reported when DSN is set
- [ ] components/ErrorBoundary reports captured errors
- [ ] No-op when DSN is unset

Files: `lib/monitoring.ts`, `components/ErrorBoundary.tsx`, `app/api/issues/route.ts`  
Depends on: Structured logging utility


<a id="p1-e33"></a>
### P1-E33 · Type-safety & runtime validation at the DB boundary
`P1` · effort **M** · theme _Quality_ · source `QUAL` · 2 stories

**Why this matters:** Blind `as Type` casts on every Supabase response mean schema drift becomes silent runtime corruption. A validation boundary converts drift into caught errors and is the durable fix behind the SCHEMA.sql/priority bug.

**`P1-E33.1` — Validate DB rows with a schema instead of casting** _(dev est: M)_
> As a maintainer, I want DB responses parsed against a schema, so that malformed rows fail loudly instead of propagating.

Introduce zod (or valibot) schemas for Product/Issue/IssueLink and parse Supabase results in db.ts instead of `as Type`. On parse failure, log and error rather than returning malformed data. Generate/verify against Supabase types where possible.

*Acceptance criteria:*
- [ ] db.ts no longer uses `as Product/Issue/IssueLink` for query results
- [ ] A row missing a required column (e.g. priority) produces a caught, logged error
- [ ] Schemas are shared with lib/types where feasible

Files: `lib/db.ts`, `lib/schemas.ts`, `lib/types.ts`

**`P1-E33.2` — Strengthen ESLint (typescript-eslint) and drop deprecated next lint** _(dev est: S)_
> As a maintainer, I want lint to catch unsafe casts and floating promises, so that whole classes of bugs are prevented.

Add typescript-eslint to eslint.config.mjs with rules like no-floating-promises, no-explicit-any (warn), await-thenable; lint test files too. Migrate `npm run lint` off deprecated `next lint` to `eslint .` per Next 16 guidance.

*Acceptance criteria:*
- [ ] typescript-eslint rules are active
- [ ] lint script uses eslint directly, not next lint
- [ ] Lint runs over tests/ as well as lib/ and app/

Files: `eslint.config.mjs`, `package.json`


<a id="p1-e34"></a>
### P1-E34 · Test-coverage expansion: API routes, pages, integration, error paths, a11y
`P0` · effort **L** · theme _Quality_ · source `QUAL` · 5 stories

**Why this matters:** Today zero route handlers, pages, or components are exercised; the three product-wedge claims (instant create, agent-cap 400, portfolio sync) have no integration test. Coverage of the actual HTTP surface and its error paths is what prevents shipped regressions in the features customers pay for.

**`P1-E34.1` — Invoke API route handlers directly in tests** _(dev est: M)_
> As a maintainer, I want tests that call the real route exports with Request objects, so that status codes, response shapes, and side effects are verified.

For each route, import GET/POST/PATCH/DELETE and call with a `new Request(url, {method, body})`. Assert status and JSON. Start with the wedge routes: app/api/issues (201 on valid, 400 agent-without-cap, 400 invalid JSON), app/api/sync/github (404 no-product, results shape), app/api/webhooks/github (ping->pong, no-repo, no-matching-product). Reset globalThis.__boss in beforeEach.

*Acceptance criteria:*
- [ ] issues POST returns 400 for agent assignee with no cost_cap_cents and 201 for valid
- [ ] issues POST returns 400 on malformed JSON body
- [ ] sync/github POST returns 404 when no matching product
- [ ] webhook returns pong on ping event and ok:true no-matching-product otherwise
- [ ] Tests import the actual route module, not a reimplementation

Files: `tests/routes/issues.route.test.ts`, `tests/routes/sync-github.route.test.ts`, `tests/routes/webhooks-github.route.test.ts`

**`P1-E34.2` — Replace reimplemented-logic tests with real-code tests** _(dev est: S)_
> As a maintainer, I want tests to exercise the shipped search/export code, so that they catch real regressions.

tests/search.test.ts and tests/api.test.ts currently re-implement filters inline. Rewrite them to import app/api/search/route.ts and app/api/export/route.ts and assert against their output (JSON and CSV branches), including the CSV escaping.

*Acceptance criteria:*
- [ ] search test imports and calls the search route handler
- [ ] export test asserts both json and csv format branches
- [ ] No test re-implements production logic inline

Files: `tests/search.test.ts`, `tests/api.test.ts`, `app/api/search/route.ts`, `app/api/export/route.ts`

**`P1-E34.3` — Component and page render tests with Testing Library** _(dev est: M)_
> As a maintainer, I want the create form and key components rendered and interacted with, so that the optimistic-create UX is guarded.

Use @testing-library/react (already installed) to render components/IssueCreate.tsx, QuickAdd, StatusBadge, PriorityBadge, ErrorBoundary. Assert IssueCreate shows a validation/400 message when an agent is chosen without a cap, and that ErrorBoundary renders fallback on a thrown child.

*Acceptance criteria:*
- [ ] IssueCreate renders and blocks/flags agent-without-cap in the UI
- [ ] ErrorBoundary renders its fallback when a child throws
- [ ] At least StatusBadge and PriorityBadge have snapshot/text assertions

Files: `tests/components/IssueCreate.test.tsx`, `tests/components/ErrorBoundary.test.tsx`, `tests/components/badges.test.tsx`

**`P1-E34.4` — Add coverage reporting with thresholds** _(dev est: S)_
> As the operator, I want coverage measured and floored, so that new code arrives with tests.

Enable vitest coverage (v8 provider) in vitest.config.ts, output text+lcov, and set a starting threshold (e.g. lines 60%) that CI enforces. Wire `npm run test -- --coverage` into CI.

*Acceptance criteria:*
- [ ] vitest.config.ts declares coverage provider and reporters
- [ ] A threshold is set and CI fails below it
- [ ] coverage/ is gitignored (already is)

Files: `vitest.config.ts`, `package.json`, `.github/workflows/ci.yml`  
Depends on: Add GitHub Actions CI workflow

**`P1-E34.5` — Basic accessibility checks on key pages/components** _(dev est: M)_
> As a user relying on assistive tech, I want the primary flows to be a11y-clean, so that the tool is usable.

Add jest-axe (or axe-core) render assertions for IssueCreate, the issues table, and Nav. Assert no serious/critical violations. Keep scope to smoke-level a11y.

*Acceptance criteria:*
- [ ] axe runs against at least IssueCreate and IssueTable
- [ ] No serious or critical violations in tested components

Files: `tests/a11y/smoke.a11y.test.tsx`, `package.json`


<a id="p1-e35"></a>
### P1-E35 · Test isolation & determinism for feature libs
`P1` · effort **S** · theme _Quality_ · source `QUAL` · 1 story

**Why this matters:** Feature-lib tests share unreset module arrays and pass only by luck of ordering. Making state resettable removes flakiness and is a prerequisite for trustworthy coverage numbers.

**`P1-E35.1` — Give every feature lib a reset seam and reset it in tests** _(dev est: S)_
> As a maintainer, I want deterministic tests, so that adding or reordering tests never breaks unrelated assertions.

Either (a) move each feature lib onto a globalThis-guarded store like store.ts and delete the guard key in beforeEach, or (b) export an internal __resetForTests() from each lib and call it in beforeEach. Apply to labels, comments, subtasks, relations, timelog, notifications, history, activity, custom-fields, sla, views. Update their tests to reset.

*Acceptance criteria:*
- [ ] Each feature-lib test file resets state in beforeEach
- [ ] labels/comments tests no longer depend on Date.now() ids or insertion order for isolation
- [ ] Running any single test file in isolation and the full suite both pass

Files: `lib/labels.ts`, `lib/comments.ts`, `lib/subtasks.ts`, `lib/notifications.ts`, `tests/labels.test.ts`, `tests/comments.test.ts`


<a id="p1-e36"></a>
### P1-E36 · Accessibility baseline — keyboard operability, focus, and semantics
`P0` · effort **L** · theme _A11y_ · source `UX` · 4 stories

**Why this matters:** Core actions (editing a title, using modals) are mouse-only and focus is invisible. This blocks keyboard and screen-reader users entirely and undercuts the 'Linear-class craft' positioning.

**`P1-E36.1` — Global focus-visible ring on all interactive elements** _(dev est: S)_
> As a keyboard user, I want to see where focus is, so that I can navigate without a mouse.

Add a token-based :focus-visible outline (e.g. outline: 2px solid var(--gold); outline-offset: 2px) in globals.css for a, button, .chip, input, select, textarea, [tabindex]. Ensure it reads in both themes.

*Acceptance criteria:*
- [ ] Tabbing through any page shows a clearly visible focus ring
- [ ] The ring uses design tokens and is visible in light and dark themes
- [ ] No interactive element relies on the browser default only

Files: `app/globals.css`

**`P1-E36.2` — Make inline title/body edit keyboard-accessible** _(dev est: S)_
> As a keyboard user, I want to rename an issue and edit its description, so that I can use the core editor without a mouse.

In app/issues/[id]/page.tsx convert the editable <h1>/<p> to buttons (or add role=button, tabindex=0, and onKeyDown for Enter/Space) that enter edit mode. Keep the visual affordance.

*Acceptance criteria:*
- [ ] Enter/Space on the focused title or body opens the editor
- [ ] Focus moves into the input on activation and Esc restores view mode
- [ ] Screen readers announce it as an editable control

Files: `app/issues/[id]/page.tsx`, `app/globals.css`

**`P1-E36.3` — Accessible modals: role, focus trap, and restore** _(dev est: M)_
> As an assistive-tech user, I want the palette and help dialogs to behave as real dialogs, so that focus doesn't escape behind them.

Add role=dialog + aria-modal=true + aria-label to QuickAdd and KeyboardHelp panels, trap Tab within the panel, and restore focus to the previously focused element on close.

*Acceptance criteria:*
- [ ] Tab cycles only within the open dialog
- [ ] Closing returns focus to the trigger/last element
- [ ] Dialogs expose role and accessible name

Files: `components/QuickAdd.tsx`, `components/KeyboardHelp.tsx`

**`P1-E36.4` — Labels, skip link, and contrast pass** _(dev est: M)_
> As a screen-reader user, I want controls named and content reachable, so that the app is usable.

Add aria-labels to row-select checkboxes (IssueTable), the D/L ThemeToggle, and search clear button; add a skip-to-content link before Nav in layout; audit --mute and gold-dim text pairs against WCAG AA and darken as needed.

*Acceptance criteria:*
- [ ] Every icon-only control has an accessible name
- [ ] A skip link appears on first Tab and jumps to <main>
- [ ] Body/muted text meets AA contrast in both themes

Files: `components/IssueTable.tsx`, `components/ThemeToggle.tsx`, `components/SearchInput.tsx`, `app/layout.tsx`, `app/globals.css`


<a id="p1-e37"></a>
### P1-E37 · Surface the backend-only features in the UI
`P1` · effort **L** · theme _UX_ · source `FEAT` · 4 stories

**Why this matters:** custom-fields, SLA, and templates are fully built server-side but invisible, and saved views can't be created. This is finished logic stranded behind no front door — high value per unit effort.

**`P1-E37.1` — Custom fields on the issue detail page** _(dev est: M)_
> As the operator, I want to see and edit custom field values on an issue so that Epic/Sprint/Environment metadata is usable.

Add a Custom Fields section to app/issues/[id]/page.tsx that GETs /api/custom-fields for definitions and /api/issues/[id]/fields for values, rendering an input per field type (text/number/select/url/date) and PATCHing on change. Route the change through emitEvent so it records history.

*Acceptance criteria:*
- [ ] Detail page lists all custom fields with current values
- [ ] Editing a value persists via PATCH and shows optimistic update
- [ ] select fields render their options; url fields render as links
- [ ] A field change appears in the issue history panel

Files: `app/issues/[id]/page.tsx`  
Depends on: Route every sub-resource mutation through emitEvent

**`P1-E37.2` — SLA dashboard page** _(dev est: M)_
> As the operator, I want an SLA view showing breached and at-risk issues so that I can triage before deadlines slip.

Add app/sla/page.tsx consuming /api/sla, rendering the summary counts (breached/at_risk/healthy) and a sorted list with time-remaining per issue using lib/sla.timeRemaining. Add a Nav entry.

*Acceptance criteria:*
- [ ] Page shows summary tiles and a list of non-closed issues with response/resolution countdowns
- [ ] Breached rows are visually distinct from at-risk and healthy
- [ ] Nav includes an SLA link
- [ ] Clicking an issue navigates to its detail page

Files: `app/sla/page.tsx`, `components/Nav.tsx`

**`P1-E37.3` — Template picker in issue creation** _(dev est: S)_
> As the operator, I want to start a new issue from a template so that agent-task/swarm issues arrive pre-filled with a cost cap.

In app/issues/new/page.tsx (or IssueCreate), fetch /api/templates and offer a template selector that pre-populates title prefix, body, priority, assignee_kind, agent_name, and cost_cap_cents. Reinforces Claim 2 by seeding a cap for agent templates.

*Acceptance criteria:*
- [ ] New-issue form lists the 5 templates
- [ ] Selecting a template pre-fills all its fields including cost_cap_cents for agent templates
- [ ] Operator can edit fields after applying a template
- [ ] Creating from the Agent Task template yields a valid capped agent issue

Files: `app/issues/new/page.tsx`, `components/IssueCreate.tsx`

**`P1-E37.4` — Save-view UI on the issues page** _(dev est: S)_
> As the operator, I want to save my current filter set as a named view so that I can return to it.

app/issues/page.tsx already reads /api/views and applies filters; add a 'Save current filters as view' control that POSTs to /api/views and a delete affordance per user-created view.

*Acceptance criteria:*
- [ ] Operator can name and save the active filter combination
- [ ] Saved view appears in the list and re-applies filters when clicked
- [ ] User-created views can be deleted; seeded views are protected or clearly distinguished

Files: `app/issues/page.tsx`


<a id="p1-e38"></a>
### P1-E38 · Missing operator screens — my-work, per-agent detail, notifications
`P1` · effort **XL** · theme _PM-core_ · source `UX` · 3 stories

**Why this matters:** An operator running agent swarms needs a personal queue, agent drill-downs (budget burn), and trustworthy notifications. Agent cards today are dead-ends and there is no 'assigned to me' view.

**`P1-E38.1` — My Work / assigned-to-me view** _(dev est: M)_
> As the operator, I want a single screen of everything assigned to me and to Alice/Swarm, so that I know what to act on next.

Add app/my-work/page.tsx grouping active issues by assignee with the operator's own queue first (identify via a simple current-user constant/operator). Reuse IssueTable and the workload grouping logic. Add to Nav.

*Acceptance criteria:*
- [ ] Screen lists the operator's active issues plus per-agent groups
- [ ] Reachable from Nav and the palette
- [ ] Empty state guides creating or assigning work

Files: `app/my-work/page.tsx`, `components/Nav.tsx`, `components/IssueTable.tsx`

**`P1-E38.2` — Per-agent detail / drill-down page** _(dev est: M)_
> As the operator, I want to click an agent and see its tasks, budget committed vs remaining, and completion, so that I can manage cost caps.

Add app/agents/[name]/page.tsx fed by /api/agents plus filtered issues; make the agent cards in app/agents/page.tsx link to it. Show cost-cap totals, active/done, and the task list.

*Acceptance criteria:*
- [ ] Agent cards on /agents link to a working detail route
- [ ] Detail shows the agent's issues and aggregate cost-cap
- [ ] Deep-links by agent name resolve

Files: `app/agents/page.tsx`, `app/agents/[name]/page.tsx`

**`P1-E38.3` — Notifications generation and inbox depth** _(dev est: L)_
> As the operator, I want assignment/status/due notifications to actually appear and group, so that Inbox is useful.

Once persistence lands, generate notifications on assignment, status change, and due-soon in the issue mutation paths; add type filters and unread grouping to app/inbox/page.tsx and a Nav unread badge.

*Acceptance criteria:*
- [ ] Assigning or moving an issue creates a notification that survives reload
- [ ] Inbox filters by type and shows unread count in Nav
- [ ] Marking read updates the badge

Files: `app/inbox/page.tsx`, `components/Nav.tsx`, `lib/notifications.ts`  
Depends on: Reliability of interactive UI — make detail-page and inbox features actually persist and degrade gracefully


<a id="p1-e39"></a>
### P1-E39 · Schema integrity, persistence for feature libs, and seed/reset tooling
`P1` · effort **L** · theme _Persistence_ · source `QUAL` · 3 stories · _supplementary (overlaps an earlier epic)_

**Why this matters:** The SQL sources disagree with each other and the code, 11 features have no durable storage and vanish on Vercel, and there is no way to seed or reset a real DB. This is both a correctness issue (features silently fail in prod) and an ops gap.

**`P1-E39.1` — Reconcile SCHEMA.sql and migration into one authoritative schema** _(dev est: M)_
> As an operator setting up Supabase, I want one correct schema, so that inserts do not fail.

Make one authoritative migration the source of truth (add missing priority to match code, decide RLS posture consistently), and either delete docs/SCHEMA.sql or generate it from the migration. Update README to point at the migration.

*Acceptance criteria:*
- [ ] A single schema defines issues WITH priority
- [ ] README references the authoritative file
- [ ] Applying it lets dbCreateIssue insert successfully (verified against a real/branch DB or documented)

Files: `supabase/migrations/001_initial_schema.sql`, `docs/SCHEMA.sql`, `README.md`

**`P1-E39.2` — Persist (or explicitly quarantine) the feature libs** _(dev est: L)_
> As an operator, I want comments/labels/subtasks etc. to survive, so that features are not silently lossy in production.

For features kept in MVP: add Supabase tables + db-backed CRUD (mirroring the store.ts/db.ts pattern) and a globalThis guard for the in-memory dev fallback. For features that violate AGENTS.md's delete-list (timelog, sla, custom-fields, views, history), either remove them or mark them clearly experimental/dev-only. Document the decision.

*Acceptance criteria:*
- [ ] Kept features have a Supabase table and survive across serverless invocations
- [ ] In-memory fallback uses a globalThis guard
- [ ] AGENTS.md-forbidden features are removed or explicitly quarantined with a note

Files: `supabase/migrations/003_feature_tables.sql`, `lib/comments.ts`, `lib/labels.ts`, `AGENTS.md`  
Depends on: Reconcile SCHEMA.sql and migration into one authoritative schema

**`P1-E39.3` — Seed and reset scripts for real environments** _(dev est: M)_
> As an operator, I want to seed and reset a database, so that I can set up staging/prod predictably.

Add npm scripts (e.g. db:seed, db:reset) that push lib/seed.ts data into Supabase and safely truncate for reset (guarded against prod without an explicit flag).

*Acceptance criteria:*
- [ ] db:seed populates a configured Supabase project
- [ ] db:reset truncates only with an explicit confirmation flag
- [ ] Scripts are documented in README

Files: `scripts/seed.ts`, `scripts/reset.ts`, `package.json`, `README.md`  
Depends on: Reconcile SCHEMA.sql and migration into one authoritative schema


---

## Phase 2 — Parity & breadth (Later)

> **Goal.** Close the day-to-day table-stakes gap versus Linear/Height/Shortcut and round out the publishing and portfolio surfaces, so the moat sits inside a tool that is also simply a great PM app.

> **Why this order.** Once the differentiators are real, breadth is what widens adoption and daily love. This is the largest bucket by count but the lowest per-item risk because it mostly deepens existing scaffolding. Sequence the highest-frequency operator needs first — a real query language + saveable views, a unified keyboard/command system, my-work/triage — then the planning primitives (cycles/estimates/burndown, projects/milestones) and collaboration depth (markdown/mentions/reactions, sub-issue trees + dependency graph, automations). Craft consolidation (design-system, mobile/theme/onboarding) and the remaining agent/publishing/portfolio breadth (agent inbox + analytics, GitHub write-back, rights/ISBN/manifest, launch campaigns, importers) land here too — valuable, but none blocks the moat.


<a id="p2-e40"></a>
### P2-E40 · Real query language + saveable smart views (deepen the existing filter/view code)
`P0` · effort **L** · theme _PM-core_ · source `PM` · 3 stories

**Why this matters:** Substring-only filtering and three read-only preset views are the biggest daily gap vs Linear/Height. Operators running one board across every Mangu repo need field filters and their own saved slices.

**`P2-E40.1` — Parse a field-filter query language** _(dev est: M)_
> As the operator, I want to type `status:doing assignee:agent priority:high cap:>300 -label:docs`, so that I can slice the portfolio precisely.

Add lib/query.ts that tokenizes `field:value`, ranges (cap:>300, due:<2026-09-01), free text, and negation, returning a predicate over Issue (+labels). Wire it into app/issues/page.tsx replacing the ad-hoc filter, and reuse it in /api/search.

*Acceptance criteria:*
- [ ] status/assignee/priority/product/label/cap/due/agent filters parse
- [ ] Negation (-label:x) and ranges (cap:>N) work
- [ ] Free text still matches title/body
- [ ] Unit tests cover the parser

Files: `lib/query.ts`, `app/issues/page.tsx`, `app/api/search/route.ts`, `tests/query.test.ts`

**`P2-E40.2` — Save current view / delete view UI** _(dev est: M)_
> As the operator, I want to save my current filter+sort as a named view and delete views, so that my slices persist.

Add a 'Save view' control that POSTs to /api/views with the active query/filters/sort, and a delete affordance on each view chip. Apply the label filter that SavedView.filters already declares.

*Acceptance criteria:*
- [ ] Saving creates a persistent view that reloads after refresh
- [ ] Deleting removes it
- [ ] Applying a view restores query+filters+sort including label

Files: `app/issues/page.tsx`, `lib/views.ts`, `app/api/views/route.ts`  
Depends on: Parse a field-filter query language, Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P2-E40.3` — Views as saved queries with counts** _(dev est: S)_
> As the operator, I want each saved view to store a query string and show its issue count, so that views behave like Linear's.

Extend SavedView to carry a `query` string; render live counts next to each view chip.

*Acceptance criteria:*
- [ ] Views store and apply a raw query string
- [ ] Each view chip shows a current count

Files: `lib/views.ts`, `app/issues/page.tsx`  
Depends on: Save current view / delete view UI


<a id="p2-e41"></a>
### P2-E41 · One coherent keyboard + command system
`P1` · effort **L** · theme _UX_ · source `UX` · 2 stories

**Why this matters:** Five uncoordinated key listeners collide (the 'c' bug) and shortcuts are advertised but context-limited. A single system is table stakes for a speed-positioned tool.

**`P2-E41.1` — Unify keyboard handling into one provider** _(dev est: M)_
> As a power user, I want shortcuts that never conflict, so that C, G-then-X, /, and Cmd+K always do the same thing everywhere.

Create a single KeyboardProvider that owns all global bindings (nav 1/2/3, g-combos, c, /, ?, Cmd+K) and dispatches to registered handlers, replacing the listeners in KeyboardNav, KeyboardHelp, IssueCreate, SearchInput. Fix 'c' so it focuses a present composer and otherwise routes to /issues/new. Use router.push, never window.location.href.

*Acceptance criteria:*
- [ ] Pressing C on /issues focuses the composer and does NOT navigate away
- [ ] Only one handler responds to any given key
- [ ] All navigation uses client routing (no full reload)

Files: `components/KeyboardNav.tsx`, `components/KeyboardHelp.tsx`, `components/IssueCreate.tsx`, `app/layout.tsx`

**`P2-E41.2` — Deepen the command palette into real quick-actions** _(dev est: L)_
> As an operator, I want to create an issue, change status, or assign an agent straight from Cmd+K, so that I never leave the keyboard.

Extend components/QuickAdd.tsx beyond search+navigate: add inline commands (new issue with product/assignee, jump to my-work, run GitHub sync) and rename the component to reflect it's a command palette. Wire quick-create through the same optimistic path as IssueCreate.

*Acceptance criteria:*
- [ ] Cmd+K can create an issue without navigating to /issues/new
- [ ] Palette lists action commands with keyboard selection
- [ ] Quick-create uses the optimistic flow and appears instantly

Files: `components/QuickAdd.tsx`, `components/IssueCreate.tsx`


<a id="p2-e42"></a>
### P2-E42 · Command palette parity + keyboard-first list navigation
`P1` · effort **M** · theme _Delight_ · source `PM` · 3 stories

**Why this matters:** The palette navigates but cannot act, and keyboard handling is fragmented across three components with an inaccurate help panel. Keyboard-first parity with Linear is a core love-driver and cheap given the existing scaffolding.

**`P2-E42.1` — Action commands in the palette** _(dev est: M)_
> As a power user, I want Cmd+K to change status, assign, set priority, add label, and create-in-context, so that I never touch the mouse.

Extend QuickAdd with an action mode: when an issue is focused/open, offer 'Set status…', 'Assign…', 'Set priority…', 'Add label…' that PATCH the issue; add fuzzy ranking and a recents list.

*Acceptance criteria:*
- [ ] Palette can mutate the focused/open issue
- [ ] Fuzzy ranking orders results
- [ ] Recently visited issues appear when query is empty

Files: `components/QuickAdd.tsx`, `app/api/issues/[id]/route.ts`

**`P2-E42.2` — j/k/x/e/c row navigation on lists** _(dev est: M)_
> As a power user, I want to move the selection with j/k, select with x, edit with e, and create with c on the issues list and board, so that bulk work is fast.

Add a focus/selection model to IssueTable and board consuming a single keyboard controller; unify KeyboardNav/KeyboardHelp/SearchInput into one hook.

*Acceptance criteria:*
- [ ] j/k move a visible selection cursor
- [ ] x toggles selection into the existing bulk bar
- [ ] e opens inline edit / detail; c opens create
- [ ] Only one keyboard controller remains

Files: `components/IssueTable.tsx`, `app/issues/page.tsx`, `app/board/page.tsx`, `components/KeyboardNav.tsx`, `components/KeyboardHelp.tsx`  
Depends on: Action commands in the palette

**`P2-E42.3` — Make the keyboard-help panel truthful and complete** _(dev est: S)_
> As a user, I want the shortcut panel to list exactly what works, so that I trust it.

Regenerate KeyboardHelp entries from the real bindings including new j/k/x/e and palette actions.

*Acceptance criteria:*
- [ ] Every listed shortcut is wired
- [ ] New nav/selection shortcuts documented

Files: `components/KeyboardHelp.tsx`  
Depends on: j/k/x/e/c row navigation on lists


<a id="p2-e43"></a>
### P2-E43 · My Work + Triage inbox
`P1` · effort **M** · theme _UX_ · source `PM` · 2 stories

**Why this matters:** There is no assigned-to-me or triage queue; the inbox is only notifications. Every competitor opens on 'your work'. Even with a single operator, agent-vs-user work and an untriaged queue matter.

**`P2-E43.1` — My Work page** _(dev est: M)_
> As the operator, I want a single page of issues assigned to me (and to my agents), grouped by status, so that I start the day in one place.

Add /my-work using the query language (assignee:user OR agent) grouped by status/cycle, with keyboard nav.

*Acceptance criteria:*
- [ ] Shows user-assigned and agent-assigned issues grouped by status
- [ ] Respects active cycle if set
- [ ] Reachable via nav and g-then-key

Files: `app/my-work/page.tsx`, `components/Nav.tsx`, `lib/query.ts`  
Depends on: Parse a field-filter query language

**`P2-E43.2` — Triage queue for untriaged issues** _(dev est: M)_
> As the operator, I want a queue of issues with no status/priority/assignee, so that nothing rots unseen.

Add a triage filter (status backlog + no priority or no assignee) with inline quick-set controls to clear items fast.

*Acceptance criteria:*
- [ ] Lists untriaged issues
- [ ] Inline set of status/priority/assignee from the queue
- [ ] Item leaves the queue once triaged

Files: `app/inbox/page.tsx`, `app/my-work/page.tsx`  
Depends on: My Work page


<a id="p2-e44"></a>
### P2-E44 · Cycles/sprints, estimates/points, and burndown/burnup
`P1` · effort **XL** · theme _PM-core_ · source `PM` · 3 stories

**Why this matters:** There is no first-class cycle or estimate, so velocity is a single number and burndown is impossible. Cycles + points are table-stakes for any team-planning buyer comparing to Shortcut/Linear.

**`P2-E44.1` — Add estimate (points) to the issue model** _(dev est: M)_
> As a planner, I want to set story points on an issue, so that I can size and roll up work.

Add `estimate:number|null` to lib/types.ts Issue + migration, expose it in IssueCreate, the detail page, IssueTable, and CSV/JSON export. Include estimate rollups in /api/stats.

*Acceptance criteria:*
- [ ] Issues store/read an estimate
- [ ] Estimate editable on detail page and shown in table
- [ ] Export includes estimate
- [ ] Stats expose sum/remaining points

Files: `lib/types.ts`, `supabase/migrations/003_estimate.sql`, `components/IssueCreate.tsx`, `app/issues/[id]/page.tsx`, `components/IssueTable.tsx`, `app/api/export/route.ts`, `app/api/stats/route.ts`

**`P2-E44.2` — First-class Cycle entity with scoping** _(dev est: L)_
> As a planner, I want to create time-boxed cycles and assign issues to them, so that I can plan sprints.

Add lib/cycles.ts + table (id, name, start, end, product scope optional) and issues.cycle_id. Add a /cycles page and a cycle picker on the detail page and board filter. Retire the fake cf-sprint custom field.

*Acceptance criteria:*
- [ ] Create/list/close cycles persistently
- [ ] Assign an issue to a cycle
- [ ] Board and issues list can filter by active cycle
- [ ] Cycle shows completed vs total points

Files: `lib/cycles.ts`, `lib/types.ts`, `supabase/migrations/004_cycles.sql`, `app/cycles/page.tsx`, `app/api/cycles/route.ts`, `app/board/page.tsx`, `app/issues/[id]/page.tsx`  
Depends on: Add estimate (points) to the issue model, Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P2-E44.3` — Burndown/burnup + true velocity chart** _(dev est: L)_
> As a lead, I want a burndown for the active cycle and a velocity trend over recent cycles, so that I can forecast.

Snapshot remaining points per day per cycle (nightly or on write) and render burndown/burnup + a per-cycle velocity bar chart on analytics, using the dataviz approach.

*Acceptance criteria:*
- [ ] Burndown shows ideal vs actual remaining points
- [ ] Burnup shows scope vs done
- [ ] Velocity chart shows last N cycles
- [ ] Charts are theme-aware and accessible

Files: `app/analytics/page.tsx`, `app/api/stats/route.ts`, `lib/cycles.ts`  
Depends on: First-class Cycle entity with scoping


<a id="p2-e45"></a>
### P2-E45 · Projects / Milestones / Goals with progress rollup
`P1` · effort **L** · theme _PM-core_ · source `PM` · 2 stories

**Why this matters:** Products=repos is the only grouping; there is no milestone/project/goal with a target date and progress. This is table-stakes for roadmap credibility vs Linear Projects and GitHub Milestones.

**`P2-E45.1` — Milestone entity + issue association** _(dev est: L)_
> As the operator, I want milestones with target dates that group issues, so that the roadmap reflects real deliverables.

Add lib/milestones.ts + table (name, target_date, product_id?, status) and issues.milestone_id; picker on detail page; group roadmap by milestone instead of only due-week.

*Acceptance criteria:*
- [ ] Create/list milestones persistently
- [ ] Assign issues to a milestone
- [ ] Roadmap can group by milestone with % complete

Files: `lib/milestones.ts`, `lib/types.ts`, `supabase/migrations/005_milestones.sql`, `app/roadmap/page.tsx`, `app/issues/[id]/page.tsx`, `app/api/milestones/route.ts`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P2-E45.2` — Goal/OKR tracking tied to milestones** _(dev est: M)_
> As the owner, I want to set a goal with a measurable target and see progress from linked milestones/issues, so that portfolio truth extends to outcomes.

Lightweight goals (title, target metric, current) that aggregate progress from linked milestones; surface on the portfolio home.

*Acceptance criteria:*
- [ ] Create a goal with target/current
- [ ] Goal shows rollup progress
- [ ] Goal visible on portfolio home

Files: `lib/goals.ts`, `app/api/goals/route.ts`, `app/page.tsx`  
Depends on: Milestone entity + issue association


<a id="p2-e46"></a>
### P2-E46 · Rich collaboration: markdown, mentions, reactions, threads, edit
`P1` · effort **L** · theme _UX_ · source `PM` · 3 stories

**Why this matters:** Comments are flat plain text with a fake author and the body renders unformatted — far below competitor collaboration. For a publishing house running agent swarms, threaded discussion and @mentions on issues are core.

**`P2-E46.1` — Markdown rendering for body and comments** _(dev est: M)_
> As a writer, I want markdown in descriptions and comments, so that notes are readable.

Add a small safe markdown renderer (self-contained, no external CDN) and an edit/preview toggle in IssueCreate, detail body, and comment form.

*Acceptance criteria:*
- [ ] Body and comments render markdown (headings, lists, code, links)
- [ ] Edit/preview toggle available
- [ ] Rendering is XSS-safe

Files: `lib/markdown.ts`, `app/issues/[id]/page.tsx`, `components/IssueCreate.tsx`

**`P2-E46.2` — @mentions with notification + reactions + edit/delete** _(dev est: M)_
> As a collaborator, I want to @mention agents/people, react with emoji, and edit/delete my comments, so that discussion is real.

Parse @name in comments to create a mention notification; add an emoji reaction row per comment; wire the existing deleteComment plus an edit endpoint.

*Acceptance criteria:*
- [ ] @mention creates a mention notification
- [ ] Reactions add/remove and show counts
- [ ] Comment edit and delete work from the UI

Files: `lib/comments.ts`, `app/api/issues/[id]/comments/route.ts`, `app/issues/[id]/page.tsx`, `lib/notifications.ts`  
Depends on: Markdown rendering for body and comments, Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P2-E46.3` — Comment threads** _(dev est: M)_
> As a collaborator, I want to reply to a specific comment, so that discussions stay organized.

Add parent_id to comments and render nested replies.

*Acceptance criteria:*
- [ ] Reply creates a child comment
- [ ] Threads render nested

Files: `lib/comments.ts`, `app/issues/[id]/page.tsx`  
Depends on: @mentions with notification + reactions + edit/delete


<a id="p2-e47"></a>
### P2-E47 · Deepen sub-issues into trees and relations into a dependency graph
`P1` · effort **L** · theme _PM-core_ · source `PM` · 3 stories

**Why this matters:** Sub-tasks are a flat checklist and relations are an invisible list — blocking work is not surfaced where decisions happen (board/table). Dependency awareness is table-stakes for planning.

**`P2-E47.1` — Promote sub-tasks to real sub-issues with a parent tree** _(dev est: L)_
> As a planner, I want sub-issues that are real issues with their own status/assignee/estimate and a parent link, so that I can decompose work.

Add issues.parent_id; render children on the parent with rollup progress; allow converting a checklist sub-task into a sub-issue.

*Acceptance criteria:*
- [ ] An issue can have a parent and children
- [ ] Parent shows children with status/estimate rollup
- [ ] Convert checklist item to sub-issue

Files: `lib/types.ts`, `lib/subtasks.ts`, `app/issues/[id]/page.tsx`, `supabase/migrations/006_parent.sql`  
Depends on: Add estimate (points) to the issue model

**`P2-E47.2` — Blocked indicators on board and table** _(dev est: M)_
> As the operator, I want a 'blocked' badge wherever an issue has an unresolved blocked-by relation, so that I see risk at a glance.

Compute blocked state from relations and render a badge in IssueTable and kanban cards; optionally prevent moving a blocked card to done.

*Acceptance criteria:*
- [ ] Blocked issues show a badge in list and board
- [ ] Badge clears when blockers close

Files: `components/IssueTable.tsx`, `app/board/page.tsx`, `lib/relations.ts`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P2-E47.3` — Dependency graph view with cycle detection** _(dev est: M)_
> As a lead, I want a visual graph of blocks/blocked-by, so that I can see the critical path.

Render a self-contained SVG/mermaid dependency graph for a product or cycle; detect and warn on cycles.

*Acceptance criteria:*
- [ ] Graph renders blocks/blocked-by edges
- [ ] Cycles are detected and flagged
- [ ] Nodes link to issues

Files: `app/issues/graph/page.tsx`, `lib/relations.ts`  
Depends on: Blocked indicators on board and table


<a id="p2-e48"></a>
### P2-E48 · Automations, recurring issues, and multi-channel notifications + digests
`P1` · effort **L** · theme _Automations_ · source `PM` · 3 stories

**Why this matters:** Notifications are hardcoded, in-memory, single-channel; there is no rules engine or recurrence. A publishing house running agent swarms needs 'when status=done -> notify/assign' and recurring production tasks.

**`P2-E48.1` — Rules engine (trigger -> condition -> action)** _(dev est: L)_
> As the operator, I want rules like 'when status becomes done, notify me and clear the cap', so that routine reactions are automatic.

Add lib/rules.ts evaluated in the issues PATCH/create path: triggers (status change, assign, due soon), conditions (field match), actions (notify, set field, add label, create follow-up).

*Acceptance criteria:*
- [ ] Rules persist and run on issue create/update
- [ ] At least notify + set-field + add-label actions work
- [ ] Rules manageable from settings

Files: `lib/rules.ts`, `app/api/issues/[id]/route.ts`, `app/api/issues/route.ts`, `app/settings/page.tsx`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P2-E48.2` — Recurring issues** _(dev est: M)_
> As the operator, I want an issue to recur on a schedule, so that repeating production tasks auto-create.

Add a recurrence rule on a template/issue and a cron-like generator (Vercel cron or on-read) that spawns the next instance.

*Acceptance criteria:*
- [ ] A recurrence produces the next issue on schedule
- [ ] Recurrence editable and cancelable

Files: `lib/recurring.ts`, `app/api/recurring/route.ts`, `lib/templates.ts`  
Depends on: Rules engine (trigger -> condition -> action)

**`P2-E48.3` — Email/Slack channels + daily digest** _(dev est: M)_
> As the operator, I want notifications by email and Slack and a daily digest, so that I am reachable off the app.

Add channel adapters (email + Slack webhook) invoked by createNotification, plus a digest job summarizing unread/overdue. Respect per-type preferences in settings.

*Acceptance criteria:*
- [ ] A notification can fan out to email and Slack
- [ ] Daily digest sends a summary
- [ ] Preferences toggle channels per type

Files: `lib/notifications.ts`, `lib/channels.ts`, `app/settings/page.tsx`, `app/api/notifications/route.ts`  
Depends on: Rules engine (trigger -> condition -> action)


<a id="p2-e49"></a>
### P2-E49 · Deeper bulk edit + templates depth
`P1` · effort **M** · theme _PM-core_ · source `PM` · 2 stories

**Why this matters:** Bulk edit covers only status/priority/delete and only on the issues list; templates are a static array. Widening both is cheap given existing /api/issues/batch and the template applier.

**`P2-E49.1` — Bulk assignee/label/due/cycle/product moves** _(dev est: M)_
> As the operator, I want to bulk-set assignee, labels, due date, cycle, and move products, so that triage is fast.

Extend /api/issues/batch with update_assignee/add_label/remove_label/set_due/set_cycle/move_product and add controls to the existing bulk bar; expose selection+bulk on the board too.

*Acceptance criteria:*
- [ ] Bulk assignee/label/due/cycle/product all work
- [ ] Agent bulk-assign enforces the cost cap (400 error path)
- [ ] Bulk bar available on board

Files: `app/api/issues/batch/route.ts`, `app/issues/page.tsx`, `app/board/page.tsx`  
Depends on: First-class Cycle entity with scoping

**`P2-E49.2` — User-created and richer templates** _(dev est: M)_
> As the operator, I want to create my own templates that carry sub-tasks, labels, and a checklist, so that recurring work is one click.

Persist templates; extend IssueTemplate with subtasks[]/labels[]; apply them on create.

*Acceptance criteria:*
- [ ] Create/edit/delete templates persistently
- [ ] Template can carry sub-tasks and labels
- [ ] Applying a template pre-fills all of it

Files: `lib/templates.ts`, `app/api/templates/route.ts`, `components/IssueCreate.tsx`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real


<a id="p2-e50"></a>
### P2-E50 · Design-system hardening and consistency
`P2` · effort **M** · theme _Design-system_ · source `UX` · 2 stories

**Why this matters:** Tokens are strong but a few colors escape them, status vocabulary diverges across screens, and duplicated status/badge rendering invites drift. Consolidation keeps the craft bar high as features grow.

**`P2-E50.1` — Single source of truth for statuses and their colors** _(dev est: M)_
> As a developer, I want one status list and color map, so that board, list, and detail never disagree.

Extract STATUS constants (incl. cancelled) and their token colors to lib, consume them in app/board/page.tsx (add a cancelled column or an explicit filtered-out affordance), the detail page, and list filters.

*Acceptance criteria:*
- [ ] Cancelled issues are visible/handled on the board
- [ ] Board, detail, and filters draw from one status list
- [ ] Status colors reference tokens only

Files: `app/board/page.tsx`, `app/issues/[id]/page.tsx`, `app/issues/page.tsx`, `lib/types.ts`

**`P2-E50.2` — Route status rendering through StatusBadge and remove token drift** _(dev est: S)_
> As a developer, I want one badge component and no hardcoded colors, so that theming stays consistent.

Replace inline status <span> in IssueTable and the detail page with components/StatusBadge.tsx. Replace hardcoded #1d1a16 and #4ade80 in globals.css with tokens. Rename app/page.tsx export from BoardPage to PortfolioPage.

*Acceptance criteria:*
- [ ] No component renders status inline where StatusBadge fits
- [ ] No non-token hex colors remain in component-level CSS
- [ ] Home page export name matches its purpose

Files: `components/IssueTable.tsx`, `app/issues/[id]/page.tsx`, `components/StatusBadge.tsx`, `app/globals.css`, `app/page.tsx`


<a id="p2-e51"></a>
### P2-E51 · Mobile, theme polish, and first-run onboarding
`P2` · effort **L** · theme _Delight_ · source `UX` · 3 stories

**Why this matters:** The tool wraps a 10-item nav on phones, flashes dark for light users, and drops a new operator into empty screens with no guidance. These are the finishing touches that make it feel premium.

**`P2-E51.1` — Mobile nav and responsive pass** _(dev est: M)_
> As an operator on my phone, I want a clean menu and readable screens, so that I can triage on the go.

Replace the wrapping Nav with a collapsible menu/drawer under ~720px; tune detail-grid, agent-cards, and workload-grid for one column; ensure tables scroll within their wrappers.

*Acceptance criteria:*
- [ ] Nav collapses to a menu on small screens
- [ ] No horizontal page overflow on a 375px viewport
- [ ] Detail and agent/workload grids stack cleanly

Files: `components/Nav.tsx`, `app/globals.css`

**`P2-E51.2` — Kill the theme FOUC and honor system preference** _(dev est: M)_
> As a light-theme user, I want no dark flash and a working 'system' option, so that the app respects my OS.

Add a tiny blocking inline script in app/layout.tsx <head> that sets data-theme from localStorage before paint; add @media (prefers-color-scheme) so 'system' resolves correctly; expose the three-state cycle in ThemeToggle.

*Acceptance criteria:*
- [ ] No dark flash on load for light-theme users
- [ ] 'System' follows the OS setting via prefers-color-scheme
- [ ] Toggle cycles dark/light/system with clear labeling

Files: `app/layout.tsx`, `components/ThemeToggle.tsx`, `app/globals.css`

**`P2-E51.3` — First-run empty states and onboarding cues** _(dev est: M)_
> As a new operator, I want guidance when screens are empty, so that I know how to add products, create issues, and assign agents.

Add purposeful empty states to the portfolio home (no products -> link to /products/new), issues, board, roadmap, workload, and agents, each with a primary action. Consider a one-time dismissible tip about C / Cmd+K.

*Acceptance criteria:*
- [ ] Every list/board screen has an actionable empty state
- [ ] Home guides adding the first product
- [ ] A first-run hint surfaces the key shortcuts and is dismissible

Files: `app/page.tsx`, `app/issues/page.tsx`, `app/board/page.tsx`, `app/roadmap/page.tsx`, `app/agents/page.tsx`


<a id="p2-e52"></a>
### P2-E52 · Agent Inbox — agents ask, the operator answers
`P2` · effort **M** · theme _UX_ · source `AGENT` · 2 stories

**Why this matters:** Swarms block on human decisions; without a reply channel they either stall or guess. The inbox is a named requirement of the wedge and the human side of human-in-the-loop: an agent posts a question (with optional choice buttons), the operator answers in one click, the answer flows back to the run. It also becomes the home for budget alerts and pending approvals, making one screen the operator's agent command center.

**`P2-E52.1` — Question channel + operator answer API** _(dev est: M)_
> As an agent, I want to ask the operator a question and receive an answer, so that I can proceed correctly instead of guessing.

Back agent_questions with agentdb. The agent posts via the callback webhook (event:'question', {question, options[]}) creating an open row and setting the run to awaiting_input. Add GET /api/agent-inbox (open questions + budget alerts + pending approvals, merged) and POST /api/agent-inbox/[id]/answer (records answer, answered_by=operator email from context, sets status answered, returns run to running, signals adapter).

*Acceptance criteria:*
- [ ] A question callback creates an open question and pauses the run
- [ ] Answering records the answer and un-pauses the run
- [ ] Answered questions leave the open list
- [ ] The inbox merges questions, budget alerts, and pending approvals in one feed

Files: `app/api/agent-inbox/route.ts`, `app/api/agent-inbox/[id]/answer/route.ts`, `lib/agentdb.ts`  
Depends on: Agent callback webhook /api/webhooks/agent, Human-in-the-loop checkpoints (awaiting_input)

**`P2-E52.2` — Agent inbox UI (rework /inbox or add /agent-inbox)** _(dev est: M)_
> As the operator, I want a single screen of everything agents need from me, so that I can unblock the swarm quickly.

Build an inbox page showing open questions (with one-click option buttons or a free-text answer), budget alerts (80/100%), pending approvals (approve/reject inline), and awaiting_input runs. Add an unresolved-count badge to Nav. Reuse the existing app/inbox/page.tsx surface or add app/agent-inbox/page.tsx and point Nav at it.

*Acceptance criteria:*
- [ ] Open questions render with clickable options that submit an answer
- [ ] Approvals can be approved/rejected inline and the run reacts
- [ ] Budget alerts are dismissible/acknowledged
- [ ] Nav shows a live unresolved count

Files: `app/agent-inbox/page.tsx`, `components/Nav.tsx`  
Depends on: Question channel + operator answer API, Cost-approval gate above a threshold, Budget alerts at 80% and 100%


<a id="p2-e53"></a>
### P2-E53 · Agent Analytics — cost-per-outcome, ROI, cost-effectiveness by task type
`P2` · effort **L** · theme _Portfolio_ · source `AGENT` · 3 stories

**Why this matters:** Once runs and spend are real, the operator can answer the questions no competitor can: which agent delivers a done task cheapest, what a manuscript costs vs a cover-variant set, is swarm worth its premium over alice, and is spend trending up. This turns the ledger into decision support — the reason to keep paying $8-12/user/mo — and rounds out the wedge from 'we track agent cost' to 'we optimize it'.

**`P2-E53.1` — Cost-per-outcome + agent ROI aggregation API** _(dev est: M)_
> As the operator, I want cost-per-completed-task and per-agent efficiency, so that I can choose the cost-effective agent for each kind of work.

Add /api/agents/analytics computing, over a date range: per agent — runs, success rate, total spend, avg cost per succeeded run, avg duration, avg tokens; per task type (derive from product engine_tag and/or issue labels) — avg cost to done; cost trend (spend per day/week). Compute purely by aggregating cost_events + agent_runs (imitate the read-model discipline of the current app/api/agents/route.ts — no denormalized totals).

*Acceptance criteria:*
- [ ] Endpoint returns per-agent success rate and avg cost per succeeded run
- [ ] Cost-per-outcome is grouped by a task-type dimension (engine_tag or label)
- [ ] A daily/weekly spend trend series is returned for a requested window
- [ ] All figures reconcile with raw cost_events

Files: `app/api/agents/analytics/route.ts`, `lib/agentdb.ts`  
Depends on: Cost event ingestion + rolling cost_spent_cents, Run lifecycle API: create/list/get/update-status/cancel

**`P2-E53.2` — Agent analytics UI (extend /analytics)** _(dev est: M)_
> As the operator, I want charts of agent ROI and spend trend, so that cost-effectiveness is visible at a glance.

Add an Agents section to app/analytics/page.tsx: a leaderboard (agent × cost-per-done × success rate), a cost-per-outcome-by-task-type view, and a spend-trend line. Keep charts dependency-free (static/inline SVG or CSS bars) consistent with the repo's static-first, no-heavy-dep posture in PROSPERITY.md.

*Acceptance criteria:*
- [ ] Analytics shows an agent cost-effectiveness leaderboard
- [ ] A spend-trend visual renders for a selectable window
- [ ] Cost-per-outcome by task type is shown
- [ ] No new heavyweight chart dependency is added

Files: `app/analytics/page.tsx`  
Depends on: Cost-per-outcome + agent ROI aggregation API

**`P2-E53.3` — Budget forecast / burn-rate projection** _(dev est: S)_
> As the operator, I want a projection of monthly spend at the current burn rate, so that I can act before I blow the monthly cap.

In the budgets rollup, add a projected end-of-month spend = MTD spend / days-elapsed × days-in-month, flag scopes projected to exceed their monthly cap, and show it on /budgets. No cron — computed on read.

*Acceptance criteria:*
- [ ] /budgets shows projected month-end spend per scope with a monthly cap
- [ ] Scopes projected to exceed cap are visually flagged
- [ ] Projection updates as MTD spend grows

Files: `app/budgets/page.tsx`, `app/api/budgets/route.ts`  
Depends on: Portfolio / product / agent budget rollups + monthly caps, Cost-per-outcome + agent ROI aggregation API


<a id="p2-e54"></a>
### P2-E54 · Bidirectional write-back to GitHub (the known-later ticket)
`P2` · effort **L** · theme _PM-core_ · source `PORT` · 2 stories

**Why this matters:** Read-only mirroring makes Boss PM a viewer, not a controller. Writing status/labels/comments back closes the loop so the operator can drive GitHub from one board — the natural graduation of Claim 3 once the mirror is trustworthy.

**`P2-E54.1` — Push local status changes to GitHub issue state** _(dev est: M)_
> As the operator, I want closing an issue in Boss PM to close it on GitHub, so that the two stay in sync from either side.

On updateIssue status→done/cancelled for a linked issue, PATCH the GitHub issue state via the auth layer. Guard against echo loops using a source marker and the webhook delivery dedup. Queue writes so a GitHub outage doesn't fail the local update.

*Acceptance criteria:*
- [ ] Local done/cancelled closes the linked GitHub issue
- [ ] Reopening locally reopens on GitHub
- [ ] Webhook echo from our own write does not re-trigger a redundant local change
- [ ] Write failures are retried and surfaced, not silently dropped

Files: `lib/github-writeback.ts`, `lib/store.ts`, `app/api/issues/[id]/route.ts`

**`P2-E54.2` — Write labels, assignees, and comments back to GitHub** _(dev est: L)_
> As the operator, I want label/assignee/comment edits to propagate to GitHub, so that agents and collaborators see them where they work.

Extend write-back to labels (map local labels/engine tags), assignees, and issue comments. Respect the App/PAT permission scope; degrade gracefully when the token lacks write scope.

*Acceptance criteria:*
- [ ] Adding a label locally adds it on GitHub when write scope exists
- [ ] A comment posted in Boss PM appears on the GitHub issue
- [ ] Insufficient-scope tokens produce a clear read-only notice, not a 500
- [ ] All write-backs are recorded in the durable activity log

Files: `lib/github-writeback.ts`, `app/api/issues/[id]/comments/route.ts`, `app/api/issues/[id]/labels/route.ts`  
Depends on: Push local status changes to GitHub issue state


<a id="p2-e55"></a>
### P2-E55 · Rights, metadata, ISBN & deliverable-manifest tracking
`P2` · effort **M** · theme _Publishing-domain_ · source `PUB` · 2 stories

**Why this matters:** The thing being shipped is a set of files with specs (KDP EPUB cover size ≠ Apple/Kobo; ACX audio QC; epubcheck; 6.625x10.25 300dpi CMYK print) plus metadata (BISAC, Amazon categories, keywords, blurb, comps) and ISBNs. finisher and comic-book-craft treat these as gate criteria. A publisher needs a single manifest of 'what must exist, to what spec, validated or not' — invisible in any generic tracker.

**`P2-E55.1` — Title metadata + rights + ISBN record** _(dev est: M)_
> As Renee, I want each title's BISAC categories, keywords, blurb, comps, ISBNs, and rights terms in one record, so that pre-publish metadata is not scattered across drafts.

Extend Title with a metadata JSON (bisac[], amazon_categories[], keywords[], blurb, logline, comps[], age_category, heat_level) and rights fields (isbn_print, isbn_epub, isbn_audio, copyright_status, deal_model, rights_note). Render a Metadata tab on the title cockpit editable in place. Draw defaults from the attribute-grid fields the herald/scout skills reference.

*Acceptance criteria:*
- [ ] Title metadata tab edits BISAC, keywords, blurb, comps in place
- [ ] ISBN and rights fields persist per format (print/epub/audio)
- [ ] Metadata persists durably
- [ ] Empty required-for-launch metadata is flagged

Files: `lib/metadata.ts`, `lib/types.ts`, `app/api/titles/[id]/metadata/route.ts`, `app/titles/[slug]/page.tsx`  
Depends on: Add Series, Arc, Volume, and Title types + durable persistence

**`P2-E55.2` — Deliverable manifest with per-platform specs & validation status** _(dev est: M)_
> As Renee, I want a manifest of every deliverable (interior PDF, KDP cover, Apple cover, EPUB, M4B) with its spec and validation state, so that 'ready to publish' is a checklist, not a hope.

Add type Deliverable (id, title_id, kind: 'interior-pdf'|'cover-front'|'cover-kdp'|'cover-apple'|'cover-kobo'|'epub'|'audiobook-m4b'|'logo'|'trade-dress', version, url, spec JSON (trim/dpi/colorspace/dimensions), validated bool, validator: 'epubcheck'|'acx-qc'|'kdp-cover'|'manual', validated_at). Render an Assets tab; a title cannot pass M3/launch gate until required deliverables are validated. Encode the per-platform cover-size differences as spec presets.

*Acceptance criteria:*
- [ ] Assets tab lists required deliverables per title kind with spec presets
- [ ] Each deliverable tracks version + validated + validator
- [ ] Launch gate is blocked while a required deliverable is unvalidated
- [ ] KDP vs Apple cover spec presets differ per the skill

Files: `lib/assets.ts`, `lib/types.ts`, `app/api/titles/[id]/assets/route.ts`, `components/ManifestTable.tsx`, `app/titles/[slug]/page.tsx`  
Depends on: Title metadata + rights + ISBN record, Go/no-go gate objects with sign-off enforcement


<a id="p2-e56"></a>
### P2-E56 · Launch campaigns & stakeholder-channel readiness
`P2` · effort **M** · theme _Publishing-domain_ · source `PUB` · 2 stories

**Why this matters:** A launch is its own tracked object: budget tiers (0/modest/aggressive), BookBub/NetGalley/ARC plan, ad copy tasks, tied to a title's release date and gated behind M2. And Envoy's whole job is keeping channel accounts live before a title needs them. Modeling campaigns + stakeholder readiness closes the loop from production to market inside one tool.

**`P2-E56.1` — Campaign object tied to a title launch** _(dev est: M)_
> As Renee, I want a launch campaign per title with budget tier, channels, and dated tasks, so that Herald's launch plan lives next to the book it sells.

Add type Campaign (id, title_id, name, objective, launch_on, budget_tier: '0'|'modest'|'aggressive', status, channels[] (BookBub/NetGalley/Amazon-Ads/Meta/Goodreads), start_on, end_on) and CampaignTask (links to issues owned by herald). Enforce 'no public launch assets before M2 signed' by blocking campaign activation until the title's M2 gate is passed. Render a Campaign tab on the title cockpit and a pre-launch timeline (4 weeks pre → 2 weeks post).

*Acceptance criteria:*
- [ ] A campaign attaches to a title with budget tier and channel list
- [ ] Campaign cannot activate until M2 gate = passed
- [ ] Campaign tasks appear as herald-owned issues
- [ ] Campaign timeline renders relative to launch_on

Files: `lib/campaigns.ts`, `lib/types.ts`, `app/api/titles/[id]/campaign/route.ts`, `app/titles/[slug]/page.tsx`, `components/CampaignTimeline.tsx`  
Depends on: Go/no-go gate objects with sign-off enforcement, Expand agent registry with domains and skill links

**`P2-E56.2` — Stakeholder account tracker (Envoy) with pipeline gap-check** _(dev est: M)_
> As Renee, I want a Stakeholder Command view of every channel account's status, and a warning when a title's next gate needs an account that isn't live, so that account gaps never block a launch.

Add type StakeholderAccount (id, channel_key, status: 'none'|'applied'|'live'|'stale', last_touched, next_action). Render a Stakeholder Command page (envoy skill's dashboard). Gap-check: for a title approaching Pre-Publish/Launch, list which channel accounts must be live (KDP/IngramSpark/D2D/ACX per finisher) and flag any not-live as a stakeholder gap on the title's channel matrix.

*Acceptance criteria:*
- [ ] Stakeholder page lists every channel account with status + next action
- [ ] A title nearing launch flags missing live accounts as gaps
- [ ] Accounts untouched beyond a threshold render 'stale'
- [ ] Gap flags link from the title channel matrix to the account

Files: `lib/stakeholders.ts`, `lib/types.ts`, `app/stakeholders/page.tsx`, `app/api/stakeholders/route.ts`, `components/StakeholderBoard.tsx`  
Depends on: Channel registry + per-title channel listing/metadata


<a id="p2-e57"></a>
### P2-E57 · Import + interop: CSV/JSON in, GitHub & Linear import, outbound webhooks & API keys
`P1` · effort **L** · theme _Publishing-domain_ · source `PM` · 3 stories

**Why this matters:** There is no way to migrate INTO Boss PM and no third-party API surface — both block adoption and the 'portfolio truth' story. Export already does CSV/JSON, so import is the missing half.

**`P2-E57.1` — CSV/JSON import** _(dev est: M)_
> As a new user, I want to import issues from CSV/JSON, so that I can move in.

Add POST /api/import accepting the export shapes; validate and create issues (respecting agent cap rules); dry-run preview.

*Acceptance criteria:*
- [ ] Round-trips our own export
- [ ] Preview shows counts and errors before commit
- [ ] Agent rows without a cap are rejected

Files: `app/api/import/route.ts`, `app/settings/page.tsx`, `lib/db.ts`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P2-E57.2` — GitHub & Linear issue import** _(dev est: L)_
> As a migrating team, I want to import GitHub issues and a Linear export, so that I can consolidate.

Map GitHub issues (reuse lib/github.ts) and a Linear JSON export into issues+labels; link back to source.

*Acceptance criteria:*
- [ ] GitHub issues import into a chosen product
- [ ] Linear export maps status/priority/labels
- [ ] Source URL preserved on imported issues

Files: `app/api/import/route.ts`, `lib/github.ts`  
Depends on: CSV/JSON import

**`P2-E57.3` — Outbound webhooks + API keys for third parties** _(dev est: L)_
> As an integrator, I want API keys and outbound webhooks on issue events, so that I can build on Boss PM.

Add API-key auth for /api routes and register outbound webhooks fired on create/update/delete; document the API.

*Acceptance criteria:*
- [ ] API key required for write endpoints when enabled
- [ ] Outbound webhook fires on issue events
- [ ] Basic API docs page

Files: `lib/apikeys.ts`, `app/api/webhooks/out/route.ts`, `app/settings/page.tsx`, `docs/API.md`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real


<a id="p2-e58"></a>
### P2-E58 · Importers: GitHub Projects, Linear, Jira, and CSV
`P2` · effort **L** · theme _PM-core_ · source `PORT` · 3 stories

**Why this matters:** Portfolio truth is only true if everything is in it. Teams arrive with work in Projects/Linear/Jira/spreadsheets; frictionless import is table stakes to consolidate onto one board and a concrete adoption lever at the $8-12/user price band.

**`P2-E58.1` — CSV importer with column mapping and dry-run** _(dev est: M)_
> As the operator, I want to upload a CSV of issues and map columns, so that existing backlogs land in Boss PM without retyping.

Add /import route and /api/import/csv: parse CSV, map columns to issue fields (title, body, status, priority, assignee_kind/agent_name/cost_cap_cents, due_on, product), show a dry-run preview with validation (reusing validateCreate — enforces the agent cost-cap rule), then commit.

*Acceptance criteria:*
- [ ] CSV upload previews mapped rows before commit
- [ ] Rows failing validateCreate (e.g. agent without cost_cap) are flagged, not silently dropped
- [ ] Committed rows create issues via the db layer
- [ ] Import summary reports created/skipped counts

Files: `app/import/page.tsx`, `app/api/import/csv/route.ts`, `lib/import.ts`

**`P2-E58.2` — GitHub Projects (v2) importer** _(dev est: L)_
> As the operator, I want to import a GitHub Projects board, so that status columns and custom fields come across in one step.

Use the GraphQL Projects v2 API (via the existing auth layer) to read items, status column, and selected fields, mapping status columns to IssueStatus and linking to already-synced issue_links. Behind the same App/PAT auth.

*Acceptance criteria:*
- [ ] A Projects v2 board's items import as issues with mapped status
- [ ] Items already linked via issue_links are updated, not duplicated
- [ ] Field mapping is previewed before commit
- [ ] Uses the GitHub App token when available

Files: `lib/import-gh-projects.ts`, `app/api/import/gh-projects/route.ts`, `lib/github-auth.ts`  
Depends on: Add GitHub App installation-token auth alongside PAT

**`P2-E58.3` — Linear and Jira importers via export/API** _(dev est: L)_
> As the operator, I want to bring Linear and Jira issues into Boss PM, so that teams migrating off them keep their history.

Add adapters that ingest Linear (API or JSON export) and Jira (REST or CSV export), mapping their status/priority/assignee models to Boss PM fields and to products by repo/team mapping. Reuse the dry-run/preview flow from the CSV importer.

*Acceptance criteria:*
- [ ] Linear issues import with status/priority mapped
- [ ] Jira issues import with status/priority mapped
- [ ] A team/project→product mapping step is offered
- [ ] Both reuse the shared preview/commit pipeline

Files: `lib/import-linear.ts`, `lib/import-jira.ts`, `app/api/import/linear/route.ts`, `app/api/import/jira/route.ts`  
Depends on: CSV importer with column mapping and dry-run


<a id="p2-e59"></a>
### P2-E59 · Close the audit-trail and test gaps around integration
`P1` · effort **M** · theme _Quality_ · source `FEAT` · 2 stories

**Why this matters:** Once features are durable and wired to an event bus, the tests and audit consistency must cover the new cross-feature behavior, and the one untested module (templates) needs coverage — otherwise regressions in the fan-out go unnoticed.

**`P2-E59.1` — Integration tests for the event bus fan-out** _(dev est: M)_
> As a developer, I want tests proving each mutation produces the right side effects so that the fan-out cannot silently regress.

Add tests that POST a comment / toggle a subtask / change status via the route handlers and assert the resulting history, activity, notification, and (for status) SLA records. Extend tests/api.test.ts or add tests/integration.test.ts.

*Acceptance criteria:*
- [ ] Test asserts a comment produces a 'comment' notification + activity entry
- [ ] Test asserts a status change produces history + notification + SLA recompute
- [ ] Test asserts batch and single edits produce equivalent audit records
- [ ] Tests run in `vitest run` without a live Supabase (memory fallback)

Files: `tests/integration.test.ts`, `tests/api.test.ts`  
Depends on: Route every sub-resource mutation through emitEvent

**`P2-E59.2` — Add templates test coverage** _(dev est: S)_
> As a developer, I want templates covered so that the only untested feature module has a safety net.

Add tests/templates.test.ts asserting the shape and cost-cap invariants of TEMPLATES (agent templates carry a positive cost_cap_cents, user templates omit it).

*Acceptance criteria:*
- [ ] Every agent-kind template has a positive cost_cap_cents and an agent_name
- [ ] Every user-kind template has no agent fields
- [ ] GET /api/templates returns all templates

Files: `tests/templates.test.ts`


<a id="p2-e60"></a>
### P2-E60 · Developer experience & documentation accuracy
`P2` · effort **S** · theme _DX_ · source `QUAL` · 2 stories

**Why this matters:** AGENTS.md makes a README that describes a nonexistent feature a defect; the reverse (28 routes, ~9 documented; a UI-advertised webhook secret with no code) also erodes trust and slows contributors. Accurate docs plus a contributing guide keep an agent-built repo coherent.

**`P2-E60.1` — Make README API + setup docs match the code** _(dev est: S)_
> As a contributor, I want docs that match reality, so that I do not follow broken instructions.

Update the README API table to reflect the real routes (or explicitly mark undocumented ones), fix the setup section to reference the authoritative schema, remove/qualify the untested '<80ms' claim or link it to a perf test, and reconcile the settings-page webhook-secret claim with the implemented verification.

*Acceptance criteria:*
- [ ] README API section matches app/api or clearly scopes what it lists
- [ ] Setup no longer points at a broken schema
- [ ] Every security control the UI/README claims exists in app/ (per AGENTS.md rule)

Files: `README.md`, `app/settings/page.tsx`  
Depends on: Verify GitHub webhook signatures, Reconcile SCHEMA.sql and migration into one authoritative schema

**`P2-E60.2` — Add CONTRIBUTING.md and align env docs** _(dev est: S)_
> As a contributor, I want a clear workflow and env reference, so that I can set up and ship correctly.

Write CONTRIBUTING.md (scripts: dev/lint/typecheck/test/build, branch/commit conventions, how CI gates, how to run against Supabase vs memory). Ensure .env.example lists every env var the code reads (GITHUB_WEBHOOK_SECRET, any rate-limit vars, monitoring DSN).

*Acceptance criteria:*
- [ ] CONTRIBUTING.md documents the full local workflow and CI gates
- [ ] .env.example lists every process.env key the code references
- [ ] Referenced scripts all exist in package.json

Files: `CONTRIBUTING.md`, `.env.example`  
Depends on: Add typecheck script (tsc --noEmit)


---

## Phase 3 — Extend outward (Horizon)

> **Goal.** Turn the instant single-player wedge into multiplayer, push portfolio truth beyond the app's walls, and broaden the addressable market with platform-tier polish.

> **Why this order.** These are high-ceiling bets that only pay off once the foundation, the moat, and parity are in place. Live updates/presence/peek panels make 'instant' felt across viewers; Slack/email broadcast and a cross-portfolio roadmap push truth to where the operator already lives; public share links, PWA/offline, i18n, and undo/attachments broaden reach and delight. None is load-bearing for the core thesis, so they are deliberately last.


<a id="p3-e61"></a>
### P3-E61 · Live updates, presence, and peek panels — extend the instant wedge to multiplayer
`P2` · effort **L** · theme _Delight_ · source `PM` · 3 stories

**Why this matters:** Pages fetch once and never update, so two viewers desync, and opening an issue is a full navigation. Live updates + a peek slideover turn the 'instant' promise into felt speed and are strong love-drivers.

**`P3-E61.1` — SSE live updates for issues/board** _(dev est: L)_
> As a viewer, I want the board and list to update when anyone changes an issue, so that I always see truth.

Add an SSE endpoint broadcasting issue mutations (emitted from the write paths) and subscribe from issues/board to patch local state.

*Acceptance criteria:*
- [ ] A change in one tab appears in another within ~1s
- [ ] Optimistic local edits are not clobbered
- [ ] Falls back gracefully if SSE unavailable

Files: `app/api/stream/route.ts`, `app/issues/page.tsx`, `app/board/page.tsx`, `lib/db.ts`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P3-E61.2` — Peek/slideover issue panel** _(dev est: M)_
> As a user, I want to preview an issue in a slideover from the list/board without leaving, so that navigation is instant.

Add a slideover that loads the detail view in place; keep URL syncable for deep links.

*Acceptance criteria:*
- [ ] Clicking a row opens a peek panel
- [ ] Esc closes; full page still works via deep link
- [ ] Edits in the peek reflect in the list

Files: `components/IssuePeek.tsx`, `app/issues/page.tsx`, `app/board/page.tsx`  
Depends on: SSE live updates for issues/board

**`P3-E61.3` — Presence indicators** _(dev est: M)_
> As a collaborator, I want to see who else is viewing an issue, so that we avoid collisions.

Track lightweight presence over the SSE channel and show avatars/initials on the issue.

*Acceptance criteria:*
- [ ] Viewers of the same issue see each other
- [ ] Presence clears on leave

Files: `app/api/stream/route.ts`, `app/issues/[id]/page.tsx`  
Depends on: SSE live updates for issues/board


<a id="p3-e62"></a>
### P3-E62 · Cross-portfolio roadmap: milestones, releases, and cycles spanning repos
`P2` · effort **L** · theme _Portfolio_ · source `PORT` · 2 stories

**Why this matters:** The roadmap today groups only local due_on by week and never reads GitHub. A portfolio needs milestones, releases, and repeating cycles that span repos so the operator can see one timeline across the whole house, not per-repo GitHub milestones in isolation.

**`P3-E62.1` — Sync GitHub milestones and releases into portfolio tables** _(dev est: M)_
> As the operator, I want GitHub milestones and releases pulled into Boss PM, so that the roadmap reflects real ship dates across repos.

Add milestones (id, product_id, gh_number, title, due_on, state, open_issues, closed_issues) and releases (id, product_id, tag, name, published_at, html_url) tables and fetch them in the sync path. Link issues to milestones.

*Acceptance criteria:*
- [ ] Milestones and releases appear per product after sync
- [ ] Issue→milestone links are populated
- [ ] Release list shows latest tag per product (feeds the muster view)
- [ ] Tables persist via db layer with mem fallback

Files: `supabase/migrations/003_portfolio.sql`, `lib/github.ts`, `lib/db.ts`

**`P3-E62.2` — Portfolio cycles and a cross-repo timeline** _(dev est: L)_
> As the operator, I want repeating cycles and a timeline that spans every repo, so that I can plan the portfolio, not just one project.

Add cycles (id, name, starts_on, ends_on, engine_scope) and assign issues to a cycle. Upgrade app/roadmap/page.tsx to a swimlane timeline by product/engine that overlays local due_on, GitHub milestone due dates, and release markers. Keep the existing week grouping as one view mode.

*Acceptance criteria:*
- [ ] Issues can be assigned to a named cycle with a date range
- [ ] Roadmap shows swimlanes per product/engine with milestone and release markers
- [ ] Timeline spans all repos in one view
- [ ] Existing week view remains available

Files: `app/roadmap/page.tsx`, `lib/cycles.ts`, `lib/db.ts`, `supabase/migrations/003_portfolio.sql`  
Depends on: Sync GitHub milestones and releases into portfolio tables


<a id="p3-e63"></a>
### P3-E63 · Portfolio truth broadcast: Slack digests and email
`P3` · effort **M** · theme _Delight_ · source `PORT` · 2 stories

**Why this matters:** Truth that stays in the app doesn't change behavior. A daily/weekly Slack and email digest of portfolio health, CI-red PRs, overdue issues, and agent cap burn pushes the muster view to where the operator already lives and reinforces the product's one-board promise.

**`P3-E63.1` — Scheduled portfolio digest generator** _(dev est: S)_
> As the operator, I want a scheduled digest summarizing portfolio health, so that I get truth without opening the app.

Add lib/digest.ts building a digest from the health rollup, muster data, CI-red PRs, overdue issues, and agent cap burn. Expose /api/cron/digest to generate it on a schedule (Vercel cron).

*Acceptance criteria:*
- [ ] Digest includes per-engine health, red PRs, overdue issues, and cap burn
- [ ] Generatable on demand and on schedule
- [ ] Reuses the health and stats rollups (no duplicate logic)
- [ ] Digest content is deterministic and testable

Files: `lib/digest.ts`, `app/api/cron/digest/route.ts`  
Depends on: Portfolio health scoring per product and per engine

**`P3-E63.2` — Slack and email delivery of the digest** _(dev est: M)_
> As the operator, I want the digest delivered to Slack and email, so that the whole team sees portfolio truth on cadence.

Add optional Slack (incoming webhook) and email (transactional provider) senders behind env config, with a settings panel to set channel/recipients and cadence. Verify any inbound Slack interactivity signatures if actions are added later.

*Acceptance criteria:*
- [ ] Digest posts to a configured Slack channel
- [ ] Digest emails to configured recipients
- [ ] Cadence (daily/weekly) is configurable in settings
- [ ] Delivery is optional and off by default

Files: `lib/notify-slack.ts`, `lib/notify-email.ts`, `app/settings/page.tsx`, `app/api/cron/digest/route.ts`  
Depends on: Scheduled portfolio digest generator


<a id="p3-e64"></a>
### P3-E64 · Undo everywhere + attachments + reactions polish
`P2` · effort **M** · theme _Delight_ · source `PM` · 3 stories

**Why this matters:** Destructive actions use window.confirm with no undo, there are no attachments, and there are no reactions on issues — small touches that competitors use to create love.

**`P3-E64.1` — Undo for destructive and bulk actions** _(dev est: M)_
> As a user, I want an 'Undo' toast after delete/bulk/status changes, so that mistakes are cheap.

Replace confirm() flows with an optimistic action + timed Undo toast that reverses via the API before commit.

*Acceptance criteria:*
- [ ] Delete and bulk actions show an Undo toast
- [ ] Undo restores the prior state
- [ ] Works on issues list and board

Files: `components/Toast.tsx`, `app/issues/page.tsx`, `app/board/page.tsx`, `app/issues/[id]/page.tsx`

**`P3-E64.2` — Attachments / file upload on issues and comments** _(dev est: M)_
> As a writer, I want to attach files/images to issues and comments, so that context lives with the work.

Add attachment storage (Supabase Storage when configured, base64/local fallback) and upload UI on the detail page and comment form.

*Acceptance criteria:*
- [ ] Upload and list attachments on an issue
- [ ] Attachments persist
- [ ] Images preview inline

Files: `lib/attachments.ts`, `app/api/issues/[id]/attachments/route.ts`, `app/issues/[id]/page.tsx`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P3-E64.3` — Issue-level reactions** _(dev est: S)_
> As a collaborator, I want to react to an issue with emoji, so that lightweight signal is easy.

Add reactions on issues (reuse the comment reaction component).

*Acceptance criteria:*
- [ ] Add/remove emoji reactions on an issue
- [ ] Counts render and persist

Files: `app/issues/[id]/page.tsx`, `lib/comments.ts`  
Depends on: @mentions with notification + reactions + edit/delete


<a id="p3-e65"></a>
### P3-E65 · Public share links, PWA/offline, theme depth, and i18n
`P3` · effort **L** · theme _UX_ · source `PM` · 3 stories

**Why this matters:** Lower-priority breadth: read-only share links extend portfolio truth outward; PWA/offline and full theme/i18n round out the polish tier that broadens the addressable market.

**`P3-E65.1` — Public read-only share links** _(dev est: M)_
> As the operator, I want a tokenized read-only link to a board/issue, so that I can share status externally.

Add share tokens that render a read-only view; scope to a product/cycle/issue.

*Acceptance criteria:*
- [ ] A token renders a read-only page
- [ ] Token can be revoked
- [ ] No mutation possible via the token

Files: `lib/share.ts`, `app/share/[token]/page.tsx`, `app/api/share/route.ts`  
Depends on: Persist every feature (Supabase tables + globalThis guards) — make the shallow surface real

**`P3-E65.2` — PWA + offline read cache** _(dev est: L)_
> As a mobile user, I want to install the app and read issues offline, so that it works on the go.

Add a manifest + service worker caching the shell and last-fetched issues; queue writes for retry.

*Acceptance criteria:*
- [ ] App installable with manifest
- [ ] Issues readable offline from cache
- [ ] Writes retry when back online

Files: `public/manifest.json`, `app/sw.ts`, `app/layout.tsx`

**`P3-E65.3` — Theme depth (system preference) + i18n scaffold** _(dev est: M)_
> As a user, I want a true system theme and localized strings, so that the app fits my environment.

Wire ThemeToggle to a real three-state (dark/light/system with prefers-color-scheme) and extract UI strings into a lightweight i18n dictionary.

*Acceptance criteria:*
- [ ] 'system' theme follows prefers-color-scheme
- [ ] Toggle cycles dark/light/system
- [ ] Strings resolve through an i18n lookup with an English default

Files: `components/ThemeToggle.tsx`, `lib/i18n.ts`, `app/layout.tsx`

---

## Appendix A — Proposed target data model

The end-state schema this roadmap builds toward. Everything in Phase 0 lands the **foundation** block; Phases 1–2 add the **moat** blocks. All tables carry `tenant_id` from day one (designed in P0 even before the login UI ships) so auth never forces a re-migration.

### Foundation (Phase 0)

- **`tenants`** — `id`, `name`, `created_at`
- **`users`** — `id`, `tenant_id`, `email`, `name`, `role`, `created_at`
- **`memberships`** — `user_id`, `tenant_id`, `role` (owner/admin/member/viewer)
- **`products`** *(exists)* — + `tenant_id`
- **`issues`** *(exists)* — + `tenant_id`, **+ `priority`** (align SQL to types), **+ `cost_spent_cents`** (see moat), `estimate_points`
- **`issue_links`** *(exists)* — fix `issue_id` association (nullable FK, reconciled on sync), `ON DELETE SET NULL`
- **The 12 feature tables** (today's in-memory arrays → real tables, each FK→`issues(id) ON DELETE CASCADE`):
  `labels`, `issue_labels`, `comments`, `subtasks`, `issue_relations`, `time_entries`, `notifications`, `issue_history`, `activity_events`, `custom_fields`, `custom_field_values`, `saved_views`
- **`webhook_deliveries`** — `id`, `delivery_id` (unique, dedup), `event`, `payload`, `signature_ok`, `processed_at` (durable webhook log)

### Agent-native moat (Phase 1)

- **`agents`** *(registry — replaces the `alice|swarm` enum)* — `id`, `tenant_id`, `slug`, `display_name`, `kind` (named/swarm/human-in-loop), `capabilities[]`, `skill_domains[]`, `dispatch_config` (jsonb), `monthly_cap_cents`, `active`
- **`agent_runs`** — `id`, `issue_id`, `agent_id`, `status` (queued/running/succeeded/failed/killed), `started_at`, `ended_at`, `tokens_in`, `tokens_out`, `duration_ms`, `external_ref` (e.g. Claude Code Remote session), `artifacts[]`, `log_url`
- **`cost_events`** — `id`, `run_id`, `issue_id`, `agent_id`, `cents`, `reason`, `created_at` (the ledger; `issues.cost_spent_cents` is the rollup that the cap hard-stops against)
- **`approvals`** — `id`, `issue_id`/`run_id`, `type` (cost_threshold/stage_gate/human_gate), `state`, `approver_id`, `decided_at`

### Publishing-domain moat (Phase 1)

- **`series`** — `id`, `tenant_id`, `product_id`, `title`, `canon_notes`
- **`titles`** — `id`, `series_id` (nullable), `product_id`, `name`, `kind` (issue/volume/book/audiobook), `arc`, `volume`, `sequence`, `status`, `release_target`
- **`pipeline_stages`** — `id`, `title_id`, `stage` (script/thumbnails/pencils/inks/colors/letters/proof/epub/launch), `owner_kind` (human/agent), `owner_ref`, `state`, `approved_by`, `approved_at`, `refinement_count`, `cap`
- **`contributor_contracts`** — `id`, `tenant_id`, `contributor`, `title_id`, `rate`, `terms`
- **`payment_milestones`** — `id`, `contract_id`, `stage_id`, `amount`, `released_on_approval` (bool), `released_at`, `kill_fee`
- **`revenue_events`** / **`cost_events`** (shared model) — per-`title`/`product`, `channel` (KDP/Apple/ACX/BookBub), `amount`, `at` → powers per-title and cash-engine P&L
- **`deliverable_manifests`** — `id`, `title_id`, `isbn`, `formats[]`, `assets[]`, `specs` (jsonb)

### Portfolio (Phase 1)

- **`pull_requests`** — `id`, `product_id`, `number`, `state`, `checks_state`, `head`, `base`, `url`, `synced_at`
- **`installations`** — GitHub App install/token records per `product`/owner

> Every existing route keeps its shape by routing through a `db-*` wrapper (the `lib/db.ts` pattern) that prefers Supabase and falls back to a `globalThis`-guarded memory store, so local dev with an empty `.env.local` still works.

## Appendix B — New / changed API surface (high level)

- **Aggregate detail endpoint** — collapse the issue detail page's 11-request waterfall into `GET /api/issues/[id]/detail` returning issue + comments + subtasks + relations + time + labels + history + links in one payload.
- **Agent** — `GET/POST /api/agents` (registry CRUD), `GET/POST /api/issues/[id]/runs`, `POST /api/runs/[id]/cost`, `POST /api/runs/[id]/kill`, `GET /api/agents/[id]` (drill-down).
- **Publishing** — `/api/series`, `/api/titles`, `/api/titles/[id]/stages`, `/api/titles/[id]/pnl`, `/api/contracts`, `/api/milestones`.
- **Portfolio** — `/api/products/[id]/prs`, `/api/muster` (portfolio health), `/api/products/[id]/pnl`, GitHub App OAuth callback routes.
- **Platform** — auth routes, `/api/webhooks/github` hardened (HMAC + dedup log), outbound webhooks + API keys, SSE endpoint for live updates.
- **Hardening across all routes** — a shared zod validation layer at the DB boundary, a consistent error envelope `{ error, code, details? }`, and pagination on every list route.

## Appendix C — Methodology

This document was produced by:

1. **A full manual read** of the data layer (`lib/store.ts`, `lib/db.ts`, `lib/types.ts`, `lib/seed.ts`), the core wedge paths (create, agents, GitHub sync, webhook), and the richest UI surfaces (issue detail, issues list, board), with the key architectural claims re-verified against source.
2. **A nine-agent deep-dive workflow** — eight specialist analysts (App/UX, API/Data-layer, Feature-completeness, Quality/DX/Ops, Agent-native, Portfolio/GitHub, PM-parity/Delight, Publishing-domain) each reading their slice of the repo and returning structured epics + findings, followed by a chief-architect synthesis that de-duplicated overlaps and enforced dependency ordering.
3. **Reconciliation** — every "critical" finding in this doc was independently confirmed in the source (e.g. the dead GitHub mirror at `lib/github.ts:34` + `lib/store.ts:171`; the CSV formula-injection gap; the cost-cap not re-validated on PATCH).

Every epic and story below is reproduced from the analysts' structured output, grouped into its synthesis-assigned phase and given a stable ticket ID. Effort estimates are the analysts' developer-time estimates and should be re-checked against team velocity.

*Prepared 2026-08-27.*
