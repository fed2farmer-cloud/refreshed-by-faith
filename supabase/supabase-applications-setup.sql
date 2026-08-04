-- Refreshed By Faith
-- Supabase applications table setup
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  legal_name text,
  preferred_name text,
  phone text,
  date_of_birth date,
  current_city text,

  emergency_contact text,
  emergency_phone text,

  sobriety_date date,
  referral_source text,
  referring_party_name text,
  referring_party_relationship text,
  referring_party_phone text,
  referring_party_email text,

  employment_income text,
  recovery_support text,
  medications text,
  accommodations text,
  why_housing text,

  status text not null default 'draft',
  application_fee_cents integer not null default 3500,
  payment_status text not null default 'unpaid',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add any missing columns if an older applications table already exists.
alter table public.applications add column if not exists legal_name text;
alter table public.applications add column if not exists preferred_name text;
alter table public.applications add column if not exists phone text;
alter table public.applications add column if not exists date_of_birth date;
alter table public.applications add column if not exists current_city text;
alter table public.applications add column if not exists emergency_contact text;
alter table public.applications add column if not exists emergency_phone text;
alter table public.applications add column if not exists sobriety_date date;
alter table public.applications add column if not exists referral_source text;
alter table public.applications add column if not exists referring_party_name text;
alter table public.applications add column if not exists referring_party_relationship text;
alter table public.applications add column if not exists referring_party_phone text;
alter table public.applications add column if not exists referring_party_email text;
alter table public.applications add column if not exists employment_income text;
alter table public.applications add column if not exists recovery_support text;
alter table public.applications add column if not exists medications text;
alter table public.applications add column if not exists accommodations text;
alter table public.applications add column if not exists why_housing text;
alter table public.applications add column if not exists status text default 'draft';
alter table public.applications add column if not exists application_fee_cents integer default 3500;
alter table public.applications add column if not exists payment_status text default 'unpaid';
alter table public.applications add column if not exists created_at timestamptz default now();
alter table public.applications add column if not exists updated_at timestamptz default now();

create index if not exists applications_user_id_idx
  on public.applications(user_id);

create index if not exists applications_created_at_idx
  on public.applications(created_at desc);

-- Automatically maintain updated_at.
create or replace function public.set_applications_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;

create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_applications_updated_at();

-- Enable Row Level Security.
alter table public.applications enable row level security;

-- Re-create policies so this script can safely be run again.
drop policy if exists "Applicants can view own applications" on public.applications;
drop policy if exists "Applicants can create own applications" on public.applications;
drop policy if exists "Applicants can update own applications" on public.applications;
drop policy if exists "Applicants can delete own draft applications" on public.applications;

create policy "Applicants can view own applications"
on public.applications
for select
to authenticated
using (auth.uid() = user_id);

create policy "Applicants can create own applications"
on public.applications
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Applicants can update own applications"
on public.applications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Applicants can delete own draft applications"
on public.applications
for delete
to authenticated
using (auth.uid() = user_id and status = 'draft');

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.applications to authenticated;

-- Ask PostgREST to refresh its schema cache immediately.
notify pgrst, 'reload schema';

-- Verification query: this should return the applications table.
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'applications';
