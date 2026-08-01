create table public.geographies (
  id uuid primary key default extensions.gen_random_uuid(),
  parent_id uuid references public.geographies(id) on delete restrict,
  geography_type text not null check (geography_type in ('country', 'province', 'district', 'subdistrict', 'locality')),
  country_code char(2) not null default 'TH' check (country_code ~ '^[A-Z]{2}$'),
  canonical_thai_name text not null,
  default_english_name text,
  normalized_name text not null,
  timezone text not null default 'Asia/Bangkok',
  data_classification public.data_classification not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  archived_at timestamptz,
  unique nulls not distinct (parent_id, geography_type, normalized_name, data_classification)
);

create table public.destinations (
  id uuid primary key default extensions.gen_random_uuid(),
  geography_id uuid not null references public.geographies(id) on delete restrict,
  name text not null,
  normalized_name text not null,
  activation_status text not null default 'draft'
    check (activation_status in ('draft', 'evidence_pending', 'ready', 'active', 'paused', 'archived')),
  boundary_geojson jsonb,
  boundary_source_id uuid,
  data_classification public.data_classification not null,
  activated_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  archived_at timestamptz,
  check (boundary_geojson is null or jsonb_typeof(boundary_geojson) in ('object', 'array')),
  check (not (data_classification = 'synthetic' and activation_status = 'active')),
  unique (geography_id, normalized_name, data_classification)
);

create table public.admin_users (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_subject uuid not null unique,
  role text not null check (role in ('founder', 'editor')),
  active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  last_access_at timestamptz
);

create table public.places (
  id uuid primary key default extensions.gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete restrict,
  geography_id uuid not null references public.geographies(id) on delete restrict,
  canonical_thai_name text not null,
  default_english_name text,
  normalized_search_name text not null,
  address_summary text not null,
  latitude numeric(9,6) not null check (latitude between -90 and 90),
  longitude numeric(9,6) not null check (longitude between -180 and 180),
  place_category text not null check (
    place_category in ('restaurant', 'attraction', 'emergency_service', 'market', 'walking_street', 'other')
  ),
  operating_status text not null default 'unknown'
    check (operating_status in ('unknown', 'operating', 'temporarily_closed', 'permanently_closed')),
  publication_status public.publication_status not null default 'draft',
  verification_status public.verification_status not null default 'unverified',
  data_classification public.data_classification not null,
  last_checked_at timestamptz,
  stale_at timestamptz,
  suppressed_at timestamptz,
  suppression_reason text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  archived_at timestamptz,
  check ((publication_status <> 'suppressed') or suppressed_at is not null),
  check ((suppressed_at is null) = (suppression_reason is null))
);

create unique index places_duplicate_candidate_idx
  on public.places (destination_id, normalized_search_name, round(latitude, 3), round(longitude, 3))
  where archived_at is null;

create table public.place_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  language_code text not null check (language_code ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  name text not null,
  short_description text,
  long_description text,
  instructions text,
  warnings text,
  accessibility_information text,
  source_language_code text not null,
  machine_generated boolean not null default false,
  translation_status text not null default 'draft'
    check (translation_status in ('draft', 'machine_draft', 'review_pending', 'reviewed', 'rejected')),
  publication_status public.publication_status not null default 'draft',
  reviewer_id uuid references public.admin_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  unique (place_id, language_code)
);

create table public.external_references (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid references public.places(id) on delete cascade,
  reference_type text not null check (
    reference_type in ('external_map', 'official_source', 'provider', 'social')
  ),
  provider_name text,
  external_identifier text,
  reference_url text check (reference_url is null or reference_url ~ '^https://'),
  restrictions text,
  active boolean not null default true,
  retrieved_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  unique nulls not distinct (reference_type, provider_name, external_identifier)
);

create trigger geographies_updated_at before update on public.geographies
for each row execute function public.set_updated_at();
create trigger destinations_updated_at before update on public.destinations
for each row execute function public.set_updated_at();
create trigger admin_users_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();
create trigger places_updated_at before update on public.places
for each row execute function public.set_updated_at();
create trigger place_translations_updated_at before update on public.place_translations
for each row execute function public.set_updated_at();
create trigger places_reject_synthetic_publication before insert or update on public.places
for each row execute function public.reject_synthetic_publication();
comment on column public.destinations.boundary_geojson is
  'Optional verified GeoJSON metadata; no real launch polygon is seeded and PostGIS is intentionally deferred.';
