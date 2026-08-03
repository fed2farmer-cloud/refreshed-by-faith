alter table public.applications
  add column if not exists referring_party_name text,
  add column if not exists referring_party_relationship text,
  add column if not exists referring_party_phone text,
  add column if not exists referring_party_email text;
