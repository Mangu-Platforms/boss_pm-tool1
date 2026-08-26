-- Boss PM initial schema
-- Run against your Supabase project to enable persistent storage

create extension if not exists "uuid-ossp";

-- Products table
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  engine_tag text not null check (engine_tag in ('cash-engine', 'lab')),
  github_owner text not null default 'Mangu-Platforms',
  github_repo text,
  homepage text,
  money_note text,
  created_at timestamptz not null default now()
);

-- Issues table
create table if not exists issues (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  title text not null,
  body text not null default '',
  status text not null default 'open' check (status in ('backlog', 'open', 'doing', 'done', 'cancelled')),
  priority text not null default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  assignee_kind text not null check (assignee_kind in ('user', 'agent')),
  assignee_user text,
  agent_name text check (agent_name is null or agent_name in ('alice', 'swarm')),
  cost_cap_cents integer,
  due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enforce: agent assignments must have agent_name and cost_cap
alter table issues add constraint agent_requires_cap
  check (assignee_kind != 'agent' or (agent_name is not null and cost_cap_cents is not null and cost_cap_cents >= 0));

-- Enforce: user assignments must have assignee_user
alter table issues add constraint user_requires_name
  check (assignee_kind != 'user' or assignee_user is not null);

-- GitHub issue links
create table if not exists issue_links (
  id uuid primary key default uuid_generate_v4(),
  issue_id uuid references issues(id) on delete set null,
  product_id uuid not null references products(id) on delete cascade,
  github_owner text not null,
  github_repo text not null,
  github_issue_number integer not null,
  github_issue_id text,
  github_state text not null default 'open',
  github_title text not null default '',
  github_html_url text not null default '',
  synced_at timestamptz not null default now(),
  unique (github_owner, github_repo, github_issue_number)
);

-- Indexes for common queries
create index if not exists idx_issues_product on issues(product_id);
create index if not exists idx_issues_status on issues(status);
create index if not exists idx_issues_priority on issues(priority);
create index if not exists idx_issues_assignee on issues(assignee_kind);
create index if not exists idx_issue_links_product on issue_links(product_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger issues_updated_at
  before update on issues
  for each row
  execute function update_updated_at();

-- Row-level security (enable when auth is set up)
-- alter table products enable row level security;
-- alter table issues enable row level security;
-- alter table issue_links enable row level security;
