-- Custom user categories.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default 'green',
  icon text,
  type text not null check (
    type in ('income', 'expense', 'deduction')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories (user_id);

alter table public.categories enable row level security;

drop policy if exists "Users can manage their own categories" on public.categories;

create policy "Users can manage their own categories"
  on public.categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
