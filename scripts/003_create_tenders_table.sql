-- Create tenders table with user_id for per-user data isolation
create table if not exists public.tenders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tender_name text not null,
  organization text,
  tender_value numeric not null default 0,
  deadline timestamp with time zone,
  financial_risks jsonb not null default '{}',
  legal_risks jsonb not null default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.tenders enable row level security;

create policy "Allow users to view their own tenders" on public.tenders for select using (auth.uid() = user_id);
create policy "Allow users to insert their own tenders" on public.tenders for insert with check (auth.uid() = user_id);
create policy "Allow users to update their own tenders" on public.tenders for update using (auth.uid() = user_id);
create policy "Allow users to delete their own tenders" on public.tenders for delete using (auth.uid() = user_id);

-- Create index for faster queries
create index tenders_user_id_idx on public.tenders(user_id);
