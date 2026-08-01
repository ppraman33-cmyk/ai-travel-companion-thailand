create table public.traveler_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  session_secret_hash text not null unique check (length(session_secret_hash) = 64),
  locale text not null default 'en',
  destination_id uuid references public.destinations(id) on delete set null,
  privacy_consent_state jsonb not null default '{}',
  data_classification public.data_classification not null,
  created_at timestamptz not null default statement_timestamp(),
  last_activity_at timestamptz not null default statement_timestamp(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  deleted_at timestamptz,
  check (expires_at > created_at)
);

comment on column public.traveler_sessions.session_secret_hash is
  'SHA-256 hash of a high-entropy server-issued secret. The clear secret is never stored.';

create table public.trips (
  id uuid primary key default extensions.gen_random_uuid(),
  traveler_session_id uuid not null references public.traveler_sessions(id) on delete cascade,
  title text not null,
  start_date date,
  end_date date,
  timezone text not null default 'Asia/Bangkok',
  trip_status text not null default 'draft'
    check (trip_status in ('draft', 'active', 'completed', 'deleted')),
  notes text,
  data_classification public.data_classification not null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  deleted_at timestamptz,
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.itinerary_days (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  planned_date date not null,
  day_order integer not null check (day_order >= 0),
  notes text,
  unique (trip_id, planned_date),
  unique (trip_id, day_order)
);

create table public.itinerary_items (
  id uuid primary key default extensions.gen_random_uuid(),
  itinerary_day_id uuid not null references public.itinerary_days(id) on delete cascade,
  item_order integer not null check (item_order >= 0),
  place_id uuid references public.places(id) on delete restrict,
  event_occurrence_id uuid references public.event_occurrences(id) on delete restrict,
  planned_at time,
  external_navigation_label text,
  external_navigation_latitude numeric(9,6),
  external_navigation_longitude numeric(9,6),
  notes text,
  item_status text not null default 'proposed'
    check (item_status in ('proposed', 'confirmed', 'skipped', 'deleted')),
  ai_generated boolean not null default false,
  traveler_modified_at timestamptz,
  data_classification public.data_classification not null,
  unique (itinerary_day_id, item_order),
  check ((place_id is not null)::integer + (event_occurrence_id is not null)::integer = 1),
  check (
    (external_navigation_latitude is null and external_navigation_longitude is null)
    or (
      external_navigation_latitude between -90 and 90
      and external_navigation_longitude between -180 and 180
    )
  )
);

create table public.saved_places (
  id uuid primary key default extensions.gen_random_uuid(),
  traveler_session_id uuid not null references public.traveler_sessions(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  note text,
  saved_at timestamptz not null default statement_timestamp()
);

create unique index saved_places_unique_context_idx
  on public.saved_places (traveler_session_id, place_id, coalesce(trip_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table public.ai_usage_records (
  id uuid primary key default extensions.gen_random_uuid(),
  traveler_session_id uuid not null references public.traveler_sessions(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  request_category text not null,
  model_identifier text not null,
  requested_at timestamptz not null default statement_timestamp(),
  status text not null check (status in ('accepted', 'completed', 'failed', 'refused', 'rate_limited')),
  input_unit_estimate integer not null default 0 check (input_unit_estimate >= 0),
  output_unit_estimate integer not null default 0 check (output_unit_estimate >= 0),
  estimated_cost numeric(12,6) not null default 0 check (estimated_cost >= 0),
  currency_code char(3) not null default 'USD',
  quota_bucket text not null,
  failure_category text,
  retention_expires_at timestamptz not null,
  data_classification public.data_classification not null,
  correlation_id uuid not null default extensions.gen_random_uuid()
);

comment on table public.ai_usage_records is
  'Provider-neutral accounting only. Full prompt and response content are intentionally excluded.';

create table public.incorrect_information_reports (
  id uuid primary key default extensions.gen_random_uuid(),
  reporter_session_id uuid not null references public.traveler_sessions(id) on delete cascade,
  place_id uuid references public.places(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  food_specialty_id uuid references public.food_specialties(id) on delete set null,
  category text not null,
  description text not null check (length(description) between 1 and 4000),
  report_status text not null default 'open'
    check (report_status in ('open', 'triaged', 'investigating', 'resolved', 'rejected')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'critical')),
  assigned_admin_id uuid references public.admin_users(id) on delete set null,
  resolution text,
  data_classification public.data_classification not null,
  created_at timestamptz not null default statement_timestamp(),
  resolved_at timestamptz,
  check (
    (place_id is not null)::integer
    + (event_id is not null)::integer
    + (food_specialty_id is not null)::integer = 1
  )
);

create table public.audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_admin_id uuid references public.admin_users(id) on delete restrict,
  action text not null,
  subject_table text not null,
  subject_id uuid not null,
  before_summary jsonb,
  after_summary jsonb,
  reason text,
  occurred_at timestamptz not null default statement_timestamp(),
  request_correlation_id uuid not null,
  data_classification public.data_classification not null
);

create or replace function public.audit_emergency_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events (
    actor_admin_id,
    action,
    subject_table,
    subject_id,
    before_summary,
    after_summary,
    reason,
    request_correlation_id,
    data_classification
  )
  select
    nullif(current_setting('app.admin_id', true), '')::uuid,
    case when tg_op = 'INSERT' then 'emergency.created' else 'emergency.updated' end,
    'emergency_service_profiles',
    new.place_id,
    case when tg_op = 'UPDATE' then
      jsonb_build_object(
        'suppression_status', old.suppression_status,
        'verified_at', old.verified_at,
        'stale_at', old.stale_at
      )
    end,
    jsonb_build_object(
      'suppression_status', new.suppression_status,
      'verified_at', new.verified_at,
      'stale_at', new.stale_at
    ),
    new.suppression_reason,
    coalesce(nullif(current_setting('app.correlation_id', true), '')::uuid, extensions.gen_random_uuid()),
    p.data_classification
  from public.places p where p.id = new.place_id;
  return new;
end;
$$;

create trigger emergency_audit after insert or update on public.emergency_service_profiles
for each row execute function public.audit_emergency_change();
create trigger trips_updated_at before update on public.trips
for each row execute function public.set_updated_at();
