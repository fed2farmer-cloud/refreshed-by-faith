-- Refreshed By Faith - Applications schema
create extension if not exists pgcrypto;

create table if not exists public.applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    first_name text,
    last_name text,
    email text,
    phone text,
    date_of_birth date,
    current_address text,
    city text,
    state text,
    zip_code text,
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relationship text,
    desired_move_in_date date,
    referral_source text,
    referral_agency text,
    case_manager_name text,
    case_manager_phone text,
    case_manager_email text,
    funding_source text,
    funding_agency text,
    sobriety_date date,
    substance_history text,
    treatment_history text,
    current_program text,
    employment_status text,
    income_source text,
    monthly_income numeric(12,2),
    accommodation_needs text,
    reason_for_housing text,
    certification_accepted boolean not null default false,
    status text not null default 'draft'
        check (status in ('draft','pending_payment','submitted','under_review','approved','denied','waitlisted','withdrawn')),
    application_fee numeric(10,2) not null default 35.00,
    payment_status text not null default 'unpaid'
        check (payment_status in ('unpaid','pending','paid','failed','refunded','waived')),
    payment_provider text,
    payment_transaction_id text,
    payment_date timestamptz,
    admin_notes text,
    reviewed_by uuid references auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    submitted_at timestamptz
);

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_email_idx on public.applications(email);
create index if not exists applications_created_at_idx on public.applications(created_at desc);

create or replace function public.set_updated_at()
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
for each row execute function public.set_updated_at();

alter table public.applications enable row level security;

drop policy if exists "Applicants can create applications" on public.applications;
drop policy if exists "Applicants can view own applications" on public.applications;
drop policy if exists "Applicants can update own applications" on public.applications;
drop policy if exists "Applicants can delete own drafts" on public.applications;

create policy "Applicants can create applications"
on public.applications for insert to authenticated
with check (auth.uid() = user_id);

create policy "Applicants can view own applications"
on public.applications for select to authenticated
using (auth.uid() = user_id);

create policy "Applicants can update own applications"
on public.applications for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Applicants can delete own drafts"
on public.applications for delete to authenticated
using (auth.uid() = user_id and status = 'draft');

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.applications to authenticated;

notify pgrst, 'reload schema';

select table_schema, table_name
from information_schema.tables
where table_schema = 'public' and table_name = 'applications';
