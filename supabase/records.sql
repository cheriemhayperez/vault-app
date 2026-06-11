-- Income and payroll deductions.
-- category_id is nullable so deleting a category never deletes pay records.
-- ON DELETE SET NULL keeps financial logs; the app shows "Uncategorized".

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

alter table public.records
  alter column category_id drop not null;

alter table public.records
  drop constraint if exists records_category_id_fkey;

alter table public.records
  add constraint records_category_id_fkey
  foreign key (category_id)
  references public.categories (id)
  on delete set null;

create index if not exists records_user_id_idx on public.records (user_id);

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

alter table public.records enable row level security;

drop policy if exists "Users can manage their own records" on public.records;

create policy "Users can manage their own records"
  on public.records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
