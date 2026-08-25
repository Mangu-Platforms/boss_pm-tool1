# Boss PM — Product Requirements

Operator PM for the Mangu portfolio. One board. Cash engines and labs. Humans and agents.

Status: MVP seed. Not a Jira clone.

## Why this exists

Linear owns taste. Jira owns enterprise process. ClickUp owns feature count. None of them treat an agent swarm as a first-class assignee with a dollar cap, and none of them show every Mangu repo on one board with an engine tag.

We win only if three claims are true. Kill the product if we add twelve modules before GitHub sync works.

## Three testable claims

### 1. Instant UI

A new issue appears in the list in under 80ms of the keypress that creates it, before the network round-trip finishes.

How to test:

1. Open `/issues` on a laptop with CPU throttled 4x (Chrome DevTools).
2. Press `C`, type a title, press Enter.
3. Measure time from Enter to first paint of the new row (`performance.mark` in `IssueCreate`).
4. Pass: median < 80ms across 20 creates. Fail: spinner-gated create.

Implementation contract: Chambers tokens, static-first App Router pages, optimistic local store, no Gantt/docs/chat JS on the critical path.

### 2. Agent-native

A task can be assigned to a swarm with a cost cap. The cap is stored, displayed, and enforced as a hard field — not a comment.

How to test:

1. Create issue "Draft chapter 4 synopsis".
2. Assignee type = `agent`, agent = `swarm`, cost cap = `$4.00`.
3. Persist and reload. Cap and agent survive.
4. Attempt create with agent assignee and empty cap → rejected (`400`).
5. Pass: agent + cap are first-class columns. Fail: assignee is a free-text GitHub username only.

### 3. Portfolio truth

One board lists every tagged Mangu product. Filter `engine=cash-engine` and `engine=lab` without leaving the page.

How to test:

1. Open `/`.
2. Count product cards. Must include at least the seed set in `lib/seed.ts`.
3. Toggle Engine filter. Cash engines and labs partition with no orphans.
4. Open a product. Issues for that product only. Status on a linked issue mirrors the GitHub issue state after sync.
5. Pass: one board, two tags, GitHub status is source for `gh_*` fields. Fail: one-repo Jira project metaphor.

## Golden path

1. List products (`/`).
2. Open a product (`/products/[slug]`).
3. Create an issue with human or agent assignee.
4. If the product has a GitHub repo, one-way read syncs GitHub issues into `issue_links`.
5. Local status displays GitHub state when a link exists.

Out of MVP: Gantt, docs suite, chat, time tracking, two-way write to GitHub, roadmaps, dashboards with 12 widgets.

## Actors

- Operator (human)
- Alice (named agent)
- Swarm (multi-agent with cost cap)

## Non-goals this week

Do not clone Jira. Do not add a wiki. Do not add sprint poker. Do not add a second database before the first sync job returns a row.
