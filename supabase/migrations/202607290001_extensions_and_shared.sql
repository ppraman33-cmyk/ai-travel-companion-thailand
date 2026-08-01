create extension if not exists pgcrypto with schema extensions;

create type public.data_classification as enum ('real', 'synthetic');
create type public.publication_status as enum (
  'draft',
  'evidence_pending',
  'review_pending',
  'approved',
  'published',
  'suppressed',
  'archived'
);
create type public.verification_status as enum (
  'unverified',
  'pending',
  'verified',
  'disputed',
  'expired',
  'rejected',
  'suppressed'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create or replace function public.reject_synthetic_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.data_classification = 'synthetic' and new.publication_status = 'published' then
    raise exception 'synthetic records cannot be published' using errcode = '23514';
  end if;
  return new;
end;
$$;

comment on function public.reject_synthetic_publication is
  'Hard publication boundary shared by publishable roots. Synthetic records can reach approved for testing but never published.';
