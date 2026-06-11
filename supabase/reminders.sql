-- Reminders for salary, tax, and contribution dates.

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
create index if not exists reminders_user_status_idx on public.reminders (user_id, status);

alter table public.reminders enable row level security;

drop policy if exists "Users can manage their own reminders" on public.reminders;

create policy "Users can manage their own reminders"
  on public.reminders
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
