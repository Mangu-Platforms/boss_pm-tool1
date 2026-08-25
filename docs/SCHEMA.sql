-- Boss PM schema. Postgres / Supabase.
-- Products, issues, GitHub links, human|agent assignees, engine tags.

create extension if not exists "pgcrypto";

do $$ begin
  create type engine_tag as enum ('cash-engine', 'lab');
exception when duplicate_object then null; end $$;

do $$ begin
  create type issue_status as enum ('backlog', 'open', 'doing', 'done', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type assignee_kind as enum ('user', 'agent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type agent_name as enum ('alice', 'swarm');
exception when duplicate_object then null; end $$;

create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  engine_tag    engine_tag not null,
  github_owner  text not null default 'Mangu-Platforms',
  github_repo   text,
  homepage      text,
  money_note    text,
  created_at    timestamptz not null default now()
);

create table if not exists issues (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  title           text not null,
  body            text not null default '',
  status          issue_status not null default 'open',
  assignee_kind   assignee_kind not null default 'user',
  assignee_user   text,
  agent_name      agent_name,
  cost_cap_cents  integer,
  due_on          date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint agent_requires_cap check (
    assignee_kind <> 'agent' or (agent_name is not null and cost_cap_cents is not null and cost_cap_cents >= 0)
  ),
  constraint user_has_name check (
    assignee_kind <> 'user' or assignee_user is not null
  )
);

create table if not exists issue_links (
  id                 uuid primary key default gen_random_uuid(),
  issue_id           uuid references issues(id) on delete cascade,
  product_id         uuid not null references products(id) on delete cascade,
  github_owner       text not null,
  github_repo        text not null,
  github_issue_number integer not null,
  github_issue_id    text,
  github_state       text not null,
  github_title       text not null,
  github_html_url    text not null,
  synced_at          timestamptz not null default now(),
  unique (github_owner, github_repo, github_issue_number)
);

create index if not exists issues_product_idx on issues (product_id, created_at desc);
create index if not exists issues_agent_idx on issues (assignee_kind, agent_name);
create index if not exists products_engine_idx on products (engine_tag);

alter table products enable row level security;
alter table issues enable row level security;
alter table issue_links enable row level security;

drop policy if exists products_all on products;
create policy products_all on products for all using (true) with check (true);

drop policy if exists issues_all on issues;
create policy issues_all on issues for all using (true) with check (true);

drop policy if exists issue_links_all on issue_links;
create policy issue_links_all on issue_links for all using (true) with check (true);
