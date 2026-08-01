create table public.restaurant_profiles (
  place_id uuid primary key references public.places(id) on delete cascade,
  cuisine_categories text[] not null default '{}',
  price_range smallint check (price_range between 1 and 4),
  dietary_information text[] not null default '{}',
  service_modes text[] not null default '{}',
  reservation_requirement text check (
    reservation_requirement in ('unknown', 'not_required', 'recommended', 'required')
  ),
  operating_notes text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table public.attraction_profiles (
  place_id uuid primary key references public.places(id) on delete cascade,
  attraction_categories text[] not null default '{}',
  admission_information text,
  recommended_visit_minutes integer check (recommended_visit_minutes between 1 and 1440),
  accessibility_notes text,
  visitor_restrictions text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table public.food_specialties (
  id uuid primary key default extensions.gen_random_uuid(),
  canonical_thai_name text not null,
  normalized_name text not null,
  category text not null,
  dietary_notes text,
  allergen_notes text,
  publication_status public.publication_status not null default 'draft',
  verification_status public.verification_status not null default 'unverified',
  data_classification public.data_classification not null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  archived_at timestamptz
);

create table public.food_specialty_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  food_specialty_id uuid not null references public.food_specialties(id) on delete cascade,
  language_code text not null,
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
  unique (food_specialty_id, language_code)
);

create table public.food_specialty_destinations (
  food_specialty_id uuid not null references public.food_specialties(id) on delete cascade,
  destination_id uuid not null references public.destinations(id) on delete cascade,
  primary key (food_specialty_id, destination_id)
);

create table public.restaurant_food_specialties (
  restaurant_place_id uuid not null references public.restaurant_profiles(place_id) on delete cascade,
  food_specialty_id uuid not null references public.food_specialties(id) on delete cascade,
  source_assertion_id uuid,
  primary key (restaurant_place_id, food_specialty_id)
);

create table public.events (
  id uuid primary key default extensions.gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete restrict,
  canonical_thai_name text not null,
  normalized_name text not null,
  event_category text not null,
  host_place_id uuid references public.places(id) on delete set null,
  recurrence_source_metadata jsonb,
  publication_status public.publication_status not null default 'draft',
  verification_status public.verification_status not null default 'unverified',
  data_classification public.data_classification not null,
  last_checked_at timestamptz,
  stale_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  archived_at timestamptz
);

create table public.event_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  language_code text not null,
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
  unique (event_id, language_code)
);

create table public.event_occurrences (
  id uuid primary key default extensions.gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  destination_id uuid not null references public.destinations(id) on delete restrict,
  venue_place_id uuid references public.places(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Asia/Bangkok',
  occurrence_status text not null default 'scheduled'
    check (occurrence_status in ('scheduled', 'rescheduled', 'cancelled', 'completed', 'expired', 'suppressed')),
  cancellation_reason text,
  publication_status public.publication_status not null default 'draft',
  verification_status public.verification_status not null default 'unverified',
  last_checked_at timestamptz,
  stale_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check (ends_at is null or ends_at >= starts_at),
  check ((occurrence_status = 'cancelled') = (cancellation_reason is not null)),
  unique (event_id, starts_at, venue_place_id)
);

create table public.opening_hour_sets (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  timezone text not null default 'Asia/Bangkok',
  valid_from date,
  valid_until date,
  temporarily_closed boolean not null default false,
  source_assertion_id uuid,
  verified_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  check (valid_until is null or valid_from is null or valid_until >= valid_from)
);

create table public.opening_hour_rules (
  id uuid primary key default extensions.gen_random_uuid(),
  opening_hour_set_id uuid not null references public.opening_hour_sets(id) on delete cascade,
  day_of_week smallint check (day_of_week between 0 and 6),
  specific_date date,
  opens_at time,
  closes_at time,
  overnight boolean not null default false,
  closed boolean not null default false,
  appointment_only boolean not null default false,
  open_24_hours boolean not null default false,
  check ((day_of_week is null) <> (specific_date is null)),
  check (
    (open_24_hours and opens_at is null and closes_at is null and not closed)
    or (closed and opens_at is null and closes_at is null and not open_24_hours)
    or (not closed and not open_24_hours and opens_at is not null and closes_at is not null)
  )
);

create trigger restaurant_profiles_updated_at before update on public.restaurant_profiles
for each row execute function public.set_updated_at();
create trigger attraction_profiles_updated_at before update on public.attraction_profiles
for each row execute function public.set_updated_at();
create trigger food_specialties_updated_at before update on public.food_specialties
for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events
for each row execute function public.set_updated_at();
create trigger event_occurrences_updated_at before update on public.event_occurrences
for each row execute function public.set_updated_at();
create trigger food_specialties_reject_synthetic_publication before insert or update on public.food_specialties
for each row execute function public.reject_synthetic_publication();
create trigger events_reject_synthetic_publication before insert or update on public.events
for each row execute function public.reject_synthetic_publication();
