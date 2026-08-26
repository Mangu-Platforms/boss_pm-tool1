# Boss PM

Enterprise project management for Mangu Platforms. One board, cost-aware agents, portfolio truth.

## Three testable claims

1. **Instant UI** — issue row paints in < 80 ms, before the network roundtrip.
2. **Agent-native** — assign Alice or Swarm with a required cost cap. API rejects without one (400).
3. **Portfolio truth** — one board for all repos, `cash-engine` vs `lab` filter, GitHub status mirrored.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Works with an empty `.env.local`. Seed data lives in `lib/seed.ts` (real Mangu repos).

## Optional services

- **Supabase**: apply `docs/SCHEMA.sql`, set `NEXT_PUBLIC_SUPABASE_URL` + keys.
- **GitHub sync**: set `GITHUB_TOKEN` with issues read scope on `Mangu-Platforms`.

## Golden path

1. `/` — list all products, filter by cash-engine or lab
2. `/products/[slug]` — product detail, create issues, sync GitHub
3. `/issues` — all issues across the portfolio with filters
4. `/issues/new` — standalone create form

Press `C` anywhere to focus the create form.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/issues` | List issues (optional `?product=id` filter) |
| POST | `/api/issues` | Create issue (agent requires `cost_cap_cents`) |
| GET | `/api/issues/[id]` | Get single issue |
| PATCH | `/api/issues/[id]` | Update issue (status, title, body, due_on) |
| DELETE | `/api/issues/[id]` | Delete issue |
| GET | `/api/sync/github` | Get synced GitHub issue links |
| POST | `/api/sync/github` | Trigger one-way GitHub sync |
| GET | `/api/stats` | Portfolio statistics |
| GET | `/api/health` | Health check |

## Testing

```bash
npm test        # run test suite
npm run build   # production build
npm run lint    # lint check
```

## Stack

Next.js 15 (App Router) + React 19 + Tailwind CSS 4 + Vitest. Optional Supabase. Deploy on Vercel.

## Docs

- `docs/PRD.md` — product requirements and testable claims
- `docs/COMPETITORS.md` — competitive matrix
- `docs/PROSPERITY.md` — pricing and kill criteria
- `docs/SCHEMA.sql` — database schema

## Market position

$8-12/user/month. Wins on speed + agent cost caps + multi-repo portfolio. Linear owns taste; we win on agent + portfolio. See `docs/PROSPERITY.md`.
