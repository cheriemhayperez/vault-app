-- Investments portfolio
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null,
  transaction_type text not null,
  amount numeric not null check (amount >= 0),
  transaction_date date not null,
  started_date date,
  notes text,
  parent_id uuid references public.investments (id) on delete set null,
  recurring_reminder boolean not null default false,
  reminder_duration text,
  returns jsonb not null default '[]'::jsonb,
  initial_amount numeric not null default 0 check (initial_amount >= 0),
  total_payouts numeric not null default 0 check (total_payouts >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.investments
  add column if not exists initial_amount numeric not null default 0 check (initial_amount >= 0);

alter table public.investments
  add column if not exists total_payouts numeric not null default 0 check (total_payouts >= 0);

create index if not exists investments_user_id_idx on public.investments (user_id);
create index if not exists investments_parent_id_idx on public.investments (parent_id);

alter table public.investments enable row level security;

drop policy if exists "Users can manage their own investments" on public.investments;

create policy "Users can manage their own investments"
  on public.investments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
