-- Run in Supabase SQL editor

create extension if not exists "uuid-ossp";

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  github_username text,
  github_avatar_url text,
  plan text not null default 'free' check (plan in ('free','pro','team','enterprise')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- GitHub App installations
create table public.github_installations (
  id bigint primary key,
  user_id text not null,           -- github login or uuid after linking
  account_login text not null,
  account_type text not null,
  account_avatar_url text,
  suspended boolean not null default false,
  installed_at timestamptz not null default now()
);

-- Monitored repositories
create table public.monitored_repos (
  id uuid primary key default uuid_generate_v4(),
  installation_id bigint references public.github_installations(id) on delete cascade,
  user_id text not null,
  repo_full_name text not null unique,
  repo_id bigint not null unique,
  enabled boolean not null default true,
  block_on_error boolean not null default false,
  created_at timestamptz not null default now()
);

-- PR check log
create table public.pr_checks (
  id uuid primary key default uuid_generate_v4(),
  repo_full_name text not null,
  pr_number int not null,
  pr_title text,
  sha text not null,
  branch text not null,
  status text not null check (status in ('passed','warned','failed','no_file')),
  errors int not null default 0,
  warnings int not null default 0,
  comment_url text,
  checked_at timestamptz not null default now()
);

-- Indexes
create index on public.pr_checks (repo_full_name, checked_at desc);
create index on public.monitored_repos (user_id);
create index on public.github_installations (user_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.github_installations enable row level security;
alter table public.monitored_repos enable row level security;
alter table public.pr_checks enable row level security;

create policy "Own profile" on public.profiles for all using (auth.uid() = id);
-- Installations + repos use service role in webhook (bypasses RLS)
-- Dashboard reads use service role too
create policy "Service role all" on public.github_installations for all using (true);
create policy "Service role all" on public.monitored_repos for all using (true);
create policy "Service role all" on public.pr_checks for all using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
