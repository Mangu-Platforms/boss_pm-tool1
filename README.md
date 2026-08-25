# Boss PM

Operator PM for the Mangu portfolio.

Three claims, each testable. See `docs/PRD.md`.

1. Instant UI — issue row paints before the network returns.
2. Agent-native — Alice or Swarm, with a required cost cap.
3. Portfolio truth — one board, `cash-engine` vs `lab`, GitHub status mirrored.

Linear owns taste. We win only on agent + portfolio. Kill the product if we add twelve modules before sync works. `docs/PROSPERITY.md`.

## Run

```bash
npm i
cp .env.example .env.local
npm run dev
```

Works with an empty `.env`. Seed lives in `lib/seed.ts` (real Mangu repos).

Optional:

- Supabase: apply `docs/SCHEMA.sql`, set URL + keys.
- GitHub one-way read: set `GITHUB_TOKEN` with issues read on `Mangu-Platforms`.

## Golden path

`/` list products → open a product → create an issue (press `C`) → **Sync GitHub issues**.

Deleted from MVP: Gantt, docs suite, chat, time tracking.

## Stack

Next.js 15 + React 19 · optional Supabase · Vercel.

## Agents

Read `AGENTS.md` before writing code. Do not stop at scaffolding. End to end means a running create path and a sync path.
