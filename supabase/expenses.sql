-- Lifestyle spending. 

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  amount numeric not null check (amount >= 0),
  category_id uuid references public.categories (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_user_id_idx on public.expenses (user_id);

alter table public.expenses enable row level security;

drop policy if exists "Users can manage their own expenses" on public.expenses;

create policy "Users can manage their own expenses"
  on public.expenses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
