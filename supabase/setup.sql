-- Vault: run this entire file once in Supabase → SQL Editor → Run

-- 1. categories (required first)
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

-- 2. budgets (depends on categories)
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

-- 3. records (pay income / deductions)
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  amount numeric not null check (amount >= 0),
  type text not null check (type in ('income', 'deduction')),
  category_id uuid references public.categories (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists records_user_id_idx on public.records (user_id);

alter table public.records enable row level security;

drop policy if exists "Users can manage their own records" on public.records;

create policy "Users can manage their own records"
  on public.records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. expenses (lifestyle spending)
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

-- 5. reminders (salary / tax / contribution dates)
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  type text not null check (
    type in ('salary', 'tax', 'contribution', 'bill', 'investment', 'custom')
  ),
  remind_at timestamptz not null,
  is_repeating boolean not null default false,
  repeat_pattern text check (repeat_pattern in ('weekly', 'monthly', 'yearly')),
  repeat_until timestamptz,
  status text not null default 'upcoming' check (
    status in ('upcoming', 'completed', 'dismissed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);

alter table public.reminders enable row level security;

drop policy if exists "Users can manage their own reminders" on public.reminders;

create policy "Users can manage their own reminders"
  on public.reminders
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. profile avatars (Supabase Storage — required for Settings photo upload)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;

create policy "Avatar images are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. investments (portfolio tracking)
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

-- 8. records ↔ investments link (run after investments table exists)
alter table public.records
  add column if not exists investment_id uuid;

alter table public.records
  drop constraint if exists records_investment_id_fkey;

alter table public.records
  add constraint records_investment_id_fkey
  foreign key (investment_id)
  references public.investments (id)
  on delete set null;

create index if not exists records_investment_id_idx on public.records (investment_id);
