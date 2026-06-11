-- Monthly budget allocations.
-- monthly_period uses YYYY-MM (e.g. 2026-06). Legacy rows may use 'default'.

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  allocated_amount numeric not null check (allocated_amount >= 0),
  monthly_period text not null default 'default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, monthly_period)
);

create index if not exists budgets_user_id_idx on public.budgets (user_id);

alter table public.budgets enable row level security;

drop policy if exists "Users can manage their own budgets" on public.budgets;

create policy "Users can manage their own budgets"
  on public.budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
