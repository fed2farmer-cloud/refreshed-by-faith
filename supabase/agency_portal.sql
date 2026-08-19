-- Refreshed By Faith - Agency Portal
-- Run this entire file in Supabase SQL Editor before using /agency/login.
create extension if not exists pgcrypto;

create table if not exists public.agency_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Agency-created applications do not require a separate applicant login.
alter table public.applications alter column user_id drop not null;
alter table public.applications add column if not exists agency_id uuid references public.agency_accounts(id) on delete set null;
alter table public.applications add column if not exists created_by_agency_user_id uuid references auth.users(id) on delete set null;
alter table public.applications add column if not exists legal_name text;
alter table public.applications add column if not exists preferred_name text;
alter table public.applications add column if not exists current_city text;
alter table public.applications add column if not exists emergency_contact text;
alter table public.applications add column if not exists emergency_phone text;
alter table public.applications add column if not exists referring_party_name text;
alter table public.applications add column if not exists referring_party_relationship text;
alter table public.applications add column if not exists referring_party_phone text;
alter table public.applications add column if not exists referring_party_email text;
alter table public.applications add column if not exists employment_income text;
alter table public.applications add column if not exists recovery_support text;
alter table public.applications add column if not exists medications text;
alter table public.applications add column if not exists accommodations text;
alter table public.applications add column if not exists why_housing text;
alter table public.applications add column if not exists certification_accepted boolean default false;
alter table public.applications add column if not exists submitted_at timestamptz;
alter table public.applications add column if not exists application_fee_cents integer default 3500;
alter table public.applications add column if not exists payment_status text default 'unpaid';

create index if not exists applications_agency_id_idx on public.applications(agency_id);
create index if not exists agency_accounts_owner_idx on public.agency_accounts(owner_user_id);

alter table public.agency_accounts enable row level security;
alter table public.applications enable row level security;

drop policy if exists "Agency owner can view agency" on public.agency_accounts;
drop policy if exists "Agency owner can create agency" on public.agency_accounts;
drop policy if exists "Agency owner can update agency" on public.agency_accounts;
create policy "Agency owner can view agency" on public.agency_accounts for select to authenticated using(auth.uid()=owner_user_id);
create policy "Agency owner can create agency" on public.agency_accounts for insert to authenticated with check(auth.uid()=owner_user_id);
create policy "Agency owner can update agency" on public.agency_accounts for update to authenticated using(auth.uid()=owner_user_id) with check(auth.uid()=owner_user_id);

-- Preserve individual applicant access while allowing an agency to manage only its own clients.
drop policy if exists "Agency can view client applications" on public.applications;
drop policy if exists "Agency can create client applications" on public.applications;
drop policy if exists "Agency can update client applications" on public.applications;
drop policy if exists "Agency can delete draft client applications" on public.applications;
create policy "Agency can view client applications" on public.applications for select to authenticated using(
  agency_id is not null and exists(select 1 from public.agency_accounts a where a.id=applications.agency_id and a.owner_user_id=auth.uid())
);
create policy "Agency can create client applications" on public.applications for insert to authenticated with check(
  user_id is null and agency_id is not null and created_by_agency_user_id=auth.uid() and exists(select 1 from public.agency_accounts a where a.id=applications.agency_id and a.owner_user_id=auth.uid())
);
create policy "Agency can update client applications" on public.applications for update to authenticated using(
  agency_id is not null and exists(select 1 from public.agency_accounts a where a.id=applications.agency_id and a.owner_user_id=auth.uid())
) with check(
  agency_id is not null and exists(select 1 from public.agency_accounts a where a.id=applications.agency_id and a.owner_user_id=auth.uid())
);
create policy "Agency can delete draft client applications" on public.applications for delete to authenticated using(
  status='draft' and agency_id is not null and exists(select 1 from public.agency_accounts a where a.id=applications.agency_id and a.owner_user_id=auth.uid())
);

grant select,insert,update on public.agency_accounts to authenticated;
grant select,insert,update,delete on public.applications to authenticated;
notify pgrst, 'reload schema';
