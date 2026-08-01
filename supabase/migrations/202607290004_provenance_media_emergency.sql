create table public.licenses (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  rights_holder text not null,
  license_category text not null,
  terms_url text check (terms_url is null or terms_url ~ '^https://'),
  commercial_use_permitted boolean not null default false,
  modification_permitted boolean not null default false,
  storage_permitted boolean not null default false,
  redistribution_permitted boolean not null default false,
  attribution_required boolean not null default true,
  attribution_text text,
  expires_at timestamptz,
  evidence_reference text not null,
  approval_status text not null default 'proposed'
    check (approval_status in ('proposed', 'approved', 'rejected', 'expired', 'takedown')),
  data_classification public.data_classification not null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check (not attribution_required or attribution_text is not null)
);

create table public.sources (
  id uuid primary key default extensions.gen_random_uuid(),
  source_type text not null check (
    source_type in ('official', 'licensed_dataset', 'first_party', 'document', 'provider', 'synthetic_test')
  ),
  owner_name text not null,
  title text not null,
  source_url text,
  document_reference text,
  accessed_at timestamptz not null,
  usage_rights_status text not null default 'pending'
    check (usage_rights_status in ('pending', 'approved', 'restricted', 'rejected', 'expired')),
  license_id uuid references public.licenses(id) on delete restrict,
  evidence_notes text,
  data_classification public.data_classification not null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check (source_url is not null or document_reference is not null),
  check (source_url is null or source_url ~ '^https://')
);

alter table public.destinations
  add constraint destinations_boundary_source_fk
  foreign key (boundary_source_id) references public.sources(id) on delete set null;

create table public.source_assertions (
  id uuid primary key default extensions.gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete restrict,
  subject_kind text not null check (
    subject_kind in (
      'destination', 'place', 'food_specialty', 'event', 'event_occurrence',
      'opening_hours', 'contact', 'emergency_service', 'media_asset'
    )
  ),
  subject_id uuid not null,
  field_key text not null,
  claimed_value jsonb not null,
  verification_status public.verification_status not null default 'pending',
  confidence numeric(4,3) check (confidence between 0 and 1),
  observed_at timestamptz,
  effective_from timestamptz,
  expires_at timestamptz,
  recheck_at timestamptz,
  reviewer_id uuid references public.admin_users(id) on delete set null,
  evidence_notes text,
  created_at timestamptz not null default statement_timestamp(),
  check (expires_at is null or effective_from is null or expires_at >= effective_from)
);

comment on table public.source_assertions is
  'Constrained polymorphic assertion registry. Integrity is reinforced through the typed link tables below; subject_kind is not used alone for publication eligibility.';

create table public.place_assertions (
  place_id uuid not null references public.places(id) on delete cascade,
  assertion_id uuid not null unique references public.source_assertions(id) on delete restrict,
  primary key (place_id, assertion_id)
);

create table public.food_specialty_assertions (
  food_specialty_id uuid not null references public.food_specialties(id) on delete cascade,
  assertion_id uuid not null unique references public.source_assertions(id) on delete restrict,
  primary key (food_specialty_id, assertion_id)
);

create table public.event_assertions (
  event_id uuid not null references public.events(id) on delete cascade,
  assertion_id uuid not null unique references public.source_assertions(id) on delete restrict,
  primary key (event_id, assertion_id)
);

create or replace function public.enforce_publication_evidence()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  has_evidence boolean := false;
begin
  if new.publication_status <> 'published' then
    return new;
  end if;

  if tg_table_name = 'places' then
    select exists (
      select 1
      from public.place_assertions link
      join public.source_assertions assertion on assertion.id = link.assertion_id
      join public.sources source on source.id = assertion.source_id
      where link.place_id = new.id
        and assertion.verification_status = 'verified'
        and (assertion.expires_at is null or assertion.expires_at > statement_timestamp())
        and source.usage_rights_status = 'approved'
    ) into has_evidence;
  elsif tg_table_name = 'food_specialties' then
    select exists (
      select 1
      from public.food_specialty_assertions link
      join public.source_assertions assertion on assertion.id = link.assertion_id
      join public.sources source on source.id = assertion.source_id
      where link.food_specialty_id = new.id
        and assertion.verification_status = 'verified'
        and (assertion.expires_at is null or assertion.expires_at > statement_timestamp())
        and source.usage_rights_status = 'approved'
    ) into has_evidence;
  elsif tg_table_name = 'events' then
    select exists (
      select 1
      from public.event_assertions link
      join public.source_assertions assertion on assertion.id = link.assertion_id
      join public.sources source on source.id = assertion.source_id
      where link.event_id = new.id
        and assertion.verification_status = 'verified'
        and (assertion.expires_at is null or assertion.expires_at > statement_timestamp())
        and source.usage_rights_status = 'approved'
    ) into has_evidence;
  end if;

  if not has_evidence then
    raise exception 'published content requires current verified evidence and approved source rights'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create table public.verifications (
  id uuid primary key default extensions.gen_random_uuid(),
  verification_type text not null,
  status public.verification_status not null default 'pending',
  reviewer_id uuid references public.admin_users(id) on delete restrict,
  verified_at timestamptz,
  next_review_at timestamptz,
  stale_at timestamptz,
  evidence_assertion_id uuid references public.source_assertions(id) on delete restrict,
  notes text,
  created_at timestamptz not null default statement_timestamp(),
  check (status <> 'verified' or (reviewer_id is not null and verified_at is not null)),
  check (stale_at is null or verified_at is null or stale_at >= verified_at)
);

create table public.place_verifications (
  place_id uuid not null references public.places(id) on delete cascade,
  verification_id uuid not null unique references public.verifications(id) on delete restrict,
  primary key (place_id, verification_id)
);

create table public.food_specialty_verifications (
  food_specialty_id uuid not null references public.food_specialties(id) on delete cascade,
  verification_id uuid not null unique references public.verifications(id) on delete restrict,
  primary key (food_specialty_id, verification_id)
);

create table public.event_verifications (
  event_id uuid not null references public.events(id) on delete cascade,
  verification_id uuid not null unique references public.verifications(id) on delete restrict,
  primary key (event_id, verification_id)
);

create table public.contact_methods (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  contact_type text not null check (contact_type in ('phone', 'email', 'website', 'social')),
  display_value text not null,
  normalized_value text not null,
  publication_permitted boolean not null default false,
  verification_status public.verification_status not null default 'unverified',
  source_assertion_id uuid not null references public.source_assertions(id) on delete restrict,
  last_checked_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  unique (place_id, contact_type, normalized_value)
);

create table public.media_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  asset_type text not null check (asset_type in ('image', 'icon', 'illustration')),
  storage_key text not null unique,
  depicts_real_place boolean not null default false,
  creator_name text not null,
  rights_holder text not null,
  license_id uuid not null references public.licenses(id) on delete restrict,
  source_id uuid not null references public.sources(id) on delete restrict,
  acquired_at timestamptz not null,
  expires_at timestamptz,
  publication_status public.publication_status not null default 'draft',
  takedown_status text not null default 'clear' check (takedown_status in ('clear', 'requested', 'removed')),
  data_classification public.data_classification not null,
  ai_generated_decorative boolean not null default false,
  approved_display_contexts text[] not null default '{}',
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check (not (ai_generated_decorative and depicts_real_place)),
  check (not (ai_generated_decorative and 'documentary_gallery' = any(approved_display_contexts)))
);

create table public.place_media (
  place_id uuid not null references public.places(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  display_context text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  primary key (place_id, media_asset_id, display_context)
);

create or replace function public.enforce_media_publication_rights()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  license_valid boolean;
  source_valid boolean;
begin
  if new.publication_status <> 'published' then
    return new;
  end if;

  select (
    approval_status = 'approved'
    and storage_permitted
    and (expires_at is null or expires_at > statement_timestamp())
  ) into license_valid
  from public.licenses where id = new.license_id;

  select usage_rights_status = 'approved' into source_valid
  from public.sources where id = new.source_id;

  if not coalesce(license_valid, false)
     or not coalesce(source_valid, false)
     or new.takedown_status <> 'clear' then
    raise exception 'published media requires current approved source and license rights'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create table public.emergency_service_profiles (
  place_id uuid primary key references public.places(id) on delete cascade,
  official_thai_name text not null,
  reviewed_english_name text not null,
  emergency_category text not null check (
    emergency_category in ('hospital', 'clinic', 'pharmacy', 'rescue', 'police', 'fire', 'tourist_assistance')
  ),
  authoritative_source_id uuid not null references public.sources(id) on delete restrict,
  primary_verification_id uuid not null references public.verifications(id) on delete restrict,
  secondary_verification_id uuid references public.verifications(id) on delete restrict,
  verified_phone_contact_id uuid references public.contact_methods(id) on delete restrict,
  operating_status text not null check (
    operating_status in ('operating', 'temporarily_closed', 'unknown')
  ),
  verified_at timestamptz not null,
  next_verification_at timestamptz not null,
  stale_at timestamptz not null,
  suppression_status text not null default 'not_suppressed'
    check (suppression_status in ('not_suppressed', 'field_suppressed', 'fully_suppressed')),
  suppression_reason text,
  safety_reviewer_id uuid not null references public.admin_users(id) on delete restrict,
  incident_notes text,
  publication_eligible boolean generated always as (
    verified_phone_contact_id is not null
    and operating_status = 'operating'
    and suppression_status = 'not_suppressed'
  ) stored,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check (next_verification_at > verified_at),
  check (stale_at >= verified_at),
  check ((suppression_status = 'not_suppressed') = (suppression_reason is null))
);

create table public.emergency_incidents (
  id uuid primary key default extensions.gen_random_uuid(),
  emergency_place_id uuid not null references public.emergency_service_profiles(place_id) on delete restrict,
  reported_by_admin_id uuid not null references public.admin_users(id) on delete restrict,
  incident_type text not null,
  notes text not null,
  created_at timestamptz not null default statement_timestamp(),
  resolved_at timestamptz
);

create or replace function public.enforce_emergency_safety()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  classification public.data_classification;
  phone_value text;
  phone_verified public.verification_status;
  phone_publishable boolean;
begin
  select data_classification into classification
  from public.places where id = new.place_id;

  if new.verified_phone_contact_id is not null then
    select normalized_value, verification_status, publication_permitted
      into phone_value, phone_verified, phone_publishable
    from public.contact_methods where id = new.verified_phone_contact_id;
  end if;

  if classification = 'synthetic'
     and phone_value is not null
     and phone_value ~ '^[+]?[0-9][0-9 -]{5,}$' then
    raise exception 'synthetic emergency contacts must not be callable' using errcode = '23514';
  end if;

  if new.suppression_status = 'not_suppressed'
     and (new.verified_phone_contact_id is null
       or phone_verified <> 'verified'
       or not coalesce(phone_publishable, false)) then
    raise exception 'unsuppressed emergency services require a verified publishable phone'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger emergency_safety before insert or update on public.emergency_service_profiles
for each row execute function public.enforce_emergency_safety();
create trigger licenses_updated_at before update on public.licenses
for each row execute function public.set_updated_at();
create trigger sources_updated_at before update on public.sources
for each row execute function public.set_updated_at();
create trigger media_assets_updated_at before update on public.media_assets
for each row execute function public.set_updated_at();
create trigger emergency_profiles_updated_at before update on public.emergency_service_profiles
for each row execute function public.set_updated_at();
create trigger media_assets_reject_synthetic_publication before insert or update on public.media_assets
for each row execute function public.reject_synthetic_publication();
create trigger places_require_publication_evidence before insert or update on public.places
for each row execute function public.enforce_publication_evidence();
create trigger food_require_publication_evidence before insert or update on public.food_specialties
for each row execute function public.enforce_publication_evidence();
create trigger events_require_publication_evidence before insert or update on public.events
for each row execute function public.enforce_publication_evidence();
create trigger media_require_publication_rights before insert or update on public.media_assets
for each row execute function public.enforce_media_publication_rights();

alter table public.opening_hour_sets
  add constraint opening_hour_sets_assertion_fk
  foreign key (source_assertion_id) references public.source_assertions(id) on delete restrict;
alter table public.restaurant_food_specialties
  add constraint restaurant_food_specialties_assertion_fk
  foreign key (source_assertion_id) references public.source_assertions(id) on delete restrict;
