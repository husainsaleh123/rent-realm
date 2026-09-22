-- Persistent, per-user portfolio data. Run once in the Supabase SQL Editor.
create table if not exists public.portfolios (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"properties":[],"tenants":[],"payments":{}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;

drop policy if exists "Users read their own portfolio" on public.portfolios;
create policy "Users read their own portfolio"
on public.portfolios for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users create their own portfolio" on public.portfolios;
create policy "Users create their own portfolio"
on public.portfolios for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own portfolio" on public.portfolios;
create policy "Users update their own portfolio"
on public.portfolios for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on public.portfolios to authenticated;
