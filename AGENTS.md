# Agents and coders — operating doctrine

You are implementing Boss PM. This is a coding project. Build actual code. Do not stop at a plan.

## Setup

Target repo: `https://github.com/Mangu-Platforms/boss_pm-tool1.git`

If the tree is empty, seed it. Do not clone Jira. Do not invent a docs suite.

## Win condition

Only three claims. Each must stay testable.

1. Instant UI: Chambers tokens, static-first, optimistic create, cheaper laptop than Linear still feels instant.
2. Agent-native: a task can be assigned to Alice or a swarm with a cost cap. Cap is a column, not a comment.
3. Portfolio truth: one board of Mangu products tagged `cash-engine` or `lab`. GitHub issue state mirrors when linked.

## Hard rules

- Delete Gantt, docs, chat, time tracking from every MVP branch.
- Prefer `lib/store.ts` memory until Supabase env exists. Do not block `npm run dev` on secrets.
- GitHub sync is one-way read. Write-back is a later ticket.
- Agent create without `cost_cap_cents` returns 400.
- Push working files. A README that describes a feature that is not in `app/` is a defect.

## Where to work

- Claims: `docs/PRD.md`
- Market: `docs/COMPETITORS.md`
- Schema: `docs/SCHEMA.sql`
- Money rules: `docs/PROSPERITY.md`
- Seed products: `lib/seed.ts`
- Create path: `components/IssueCreate.tsx` + `app/api/issues/route.ts`
- Sync path: `lib/github.ts` + `app/api/sync/github/route.ts`

## Loop

1. Run the golden path locally.
2. If create does not appear in the list, fix the store before adding UI chrome.
3. If sync 401s without a token, show the error. Do not fake GitHub rows.
4. Commit. Push. Continue with the next failing claim.

Do not stop coding at scaffolding. A to Z is: board, create, persist, sync, mirror status.
