-- Additive Phase 4 nationwide content foundation. Existing publication and RLS gates remain authoritative.

alter table public.geographies
  add column official_code text,
  add column slug text,
  add column region_code text check (
    region_code is null or region_code in ('central', 'northern', 'northeastern', 'eastern', 'western', 'southern')
  ),
  add column region_name text,
  add column centroid_latitude numeric(9,6) check (centroid_latitude between -90 and 90),
  add column centroid_longitude numeric(9,6) check (centroid_longitude between -180 and 180);

create unique index geographies_official_code_idx
  on public.geographies (country_code, official_code)
  where official_code is not null;
create unique index geographies_slug_idx
  on public.geographies (country_code, geography_type, slug)
  where slug is not null;

alter table public.destinations
  add column slug text,
  add column capital_district_thai_name text,
  add column capital_district_english_name text,
  add column history_summary text,
  add column traveler_description text,
  add column geography_summary text,
  add column climate_summary text,
  add column area_square_km numeric(12,2) check (area_square_km > 0),
  add column population integer check (population >= 0),
  add column province_motto text,
  add column latitude numeric(9,6) check (latitude between -90 and 90),
  add column longitude numeric(9,6) check (longitude between -180 and 180),
  add column seo_title text,
  add column seo_description text,
  add column tags text[] not null default '{}',
  add column hero_media_id uuid references public.media_assets(id) on delete set null,
  add column profile_source_id uuid references public.sources(id) on delete restrict,
  add column profile_verification_status public.verification_status not null default 'unverified',
  add column profile_verified_at timestamptz,
  add column profile_last_checked_at timestamptz,
  add column profile_confidence numeric(4,3) check (profile_confidence between 0 and 1),
  add column future_map_configuration jsonb not null default '{"status":"coming_soon"}'::jsonb
    check (jsonb_typeof(future_map_configuration) = 'object');

create unique index destinations_slug_idx on public.destinations(slug)
  where slug is not null and archived_at is null;
create index destinations_tags_idx on public.destinations using gin(tags);
create index destinations_search_idx on public.destinations(normalized_name, activation_status);

alter table public.places
  add column district_geography_id uuid references public.geographies(id) on delete restrict,
  add column history_summary text,
  add column highlights text[] not null default '{}',
  add column website_url text check (website_url is null or website_url ~ '^https://'),
  add column tags text[] not null default '{}',
  add column confidence_score numeric(4,3) check (confidence_score between 0 and 1);

create index places_district_idx on public.places(district_geography_id, publication_status);
create index places_tags_idx on public.places using gin(tags);

alter table public.restaurant_profiles
  add column recommended_menu text[] not null default '{}';

alter table public.attraction_profiles
  add column entrance_fee_information text;

alter table public.food_specialties
  add column history_summary text,
  add column traveler_description text,
  add column production_area text,
  add column authentic_production_area text,
  add column community_enterprise text,
  add column local_producer text,
  add column tags text[] not null default '{}',
  add column last_checked_at timestamptz,
  add column confidence_score numeric(4,3) check (confidence_score between 0 and 1);

create index food_specialties_search_idx
  on public.food_specialties(normalized_name, publication_status);
create index food_specialties_tags_idx on public.food_specialties using gin(tags);

alter table public.events
  add column history_summary text,
  add column tags text[] not null default '{}',
  add column confidence_score numeric(4,3) check (confidence_score between 0 and 1);

create index events_search_idx on public.events(normalized_name, publication_status);
create index events_tags_idx on public.events using gin(tags);

create table public.content_internal_notes (
  id uuid primary key default extensions.gen_random_uuid(),
  entity_kind text not null check (
    entity_kind in ('geography', 'destination', 'place', 'food_specialty', 'event', 'event_occurrence', 'emergency_service')
  ),
  entity_id uuid not null,
  note text not null check (length(note) between 1 and 10000),
  created_by uuid not null references public.admin_users(id) on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  archived_at timestamptz
);
alter table public.content_internal_notes enable row level security;
create policy active_admin_internal_notes on public.content_internal_notes
for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
grant select, insert, update on public.content_internal_notes to authenticated;
create index content_internal_notes_entity_idx
  on public.content_internal_notes(entity_kind, entity_id, created_at desc);

alter table public.food_specialty_destinations enable row level security;
create policy public_food_specialty_destinations
on public.food_specialty_destinations for select to anon, authenticated
using (
  exists (
    select 1 from public.food_specialties food
    where food.id = food_specialty_destinations.food_specialty_id
  )
  and exists (
    select 1 from public.destinations destination
    where destination.id = food_specialty_destinations.destination_id
  )
);
create policy active_admin_food_specialty_destinations
on public.food_specialty_destinations for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
grant select on public.food_specialty_destinations to anon, authenticated;
grant select, insert, update, delete on public.food_specialty_destinations to authenticated;

create view public.public_food_specialty_catalog
with (security_invoker = true)
as
select
  f.id,
  link.destination_id,
  f.canonical_thai_name,
  f.normalized_name,
  f.category,
  f.traveler_description,
  f.last_checked_at
from public.food_specialties f
join public.food_specialty_destinations link on link.food_specialty_id = f.id;

grant select on public.public_food_specialty_catalog to anon, authenticated;

create view public.public_emergency_catalog
with (security_invoker = true)
as
select
  profile.place_id,
  place.destination_id,
  place.address_summary,
  place.latitude,
  place.longitude,
  profile.official_thai_name,
  profile.reviewed_english_name,
  profile.emergency_category,
  profile.verified_at,
  profile.stale_at
from public.emergency_service_profiles profile
join public.places place on place.id = profile.place_id;

grant select on public.public_emergency_catalog to anon, authenticated;

-- Province profiles are public only after destination activation and verified evidence.
create or replace function public.destination_profile_has_approved_source(target_destination_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.destinations destination
    join public.sources source on source.id = destination.profile_source_id
    where destination.id = target_destination_id
      and source.usage_rights_status = 'approved'
  );
$$;
revoke all on function public.destination_profile_has_approved_source(uuid) from public;
grant execute on function public.destination_profile_has_approved_source(uuid) to anon, authenticated;

drop policy public_active_destinations on public.destinations;
create policy public_active_destinations on public.destinations for select to anon, authenticated
using (
  data_classification = 'real'
  and activation_status = 'active'
  and profile_verification_status = 'verified'
  and profile_source_id is not null
  and profile_last_checked_at is not null
  and public.destination_profile_has_approved_source(id)
);

create or replace function public.enforce_destination_activation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  approved_source boolean := false;
begin
  if new.activation_status <> 'active' then
    return new;
  end if;
  if new.data_classification = 'synthetic' then
    raise exception 'synthetic destinations cannot be activated' using errcode = '23514';
  end if;
  select usage_rights_status = 'approved' into approved_source
  from public.sources where id = new.profile_source_id;
  if new.profile_verification_status <> 'verified'
     or new.profile_last_checked_at is null
     or not coalesce(approved_source, false) then
    raise exception 'active destinations require verified profiles and approved source rights'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger destinations_require_activation_evidence
before insert or update on public.destinations
for each row execute function public.enforce_destination_activation();

comment on column public.destinations.future_map_configuration is
  'Reserved provider-neutral metadata for a future illustrated province map. Phase 4 renders only a Coming Soon placeholder.';
comment on table public.content_internal_notes is
  'Private CMS notes isolated from publicly selectable content tables. Never expose through public catalog contracts.';

-- Replace broad Phase 3 catalog grants with explicit traveler-safe columns. Admin mutations
-- continue through the server boundary; authenticated browser roles do not receive private fields.
revoke select on public.destinations, public.places, public.place_translations,
  public.food_specialties, public.food_specialty_translations, public.events,
  public.event_translations, public.event_occurrences, public.emergency_service_profiles,
  public.media_assets from anon, authenticated;

grant select (
  id, geography_id, name, normalized_name, activation_status, data_classification,
  updated_at, slug, capital_district_thai_name, capital_district_english_name,
  history_summary, traveler_description, geography_summary, climate_summary,
  area_square_km, population, province_motto, latitude, longitude, seo_title,
  seo_description, tags, hero_media_id, profile_verification_status,
  profile_verified_at, profile_last_checked_at, profile_confidence,
  future_map_configuration
) on public.destinations to anon, authenticated;

grant select (
  id, destination_id, geography_id, canonical_thai_name, default_english_name,
  normalized_search_name, address_summary, latitude, longitude, place_category,
  operating_status, publication_status, verification_status, data_classification,
  last_checked_at, stale_at, suppressed_at, updated_at, district_geography_id, history_summary,
  highlights, website_url, tags, confidence_score
) on public.places to anon, authenticated;

grant select (
  id, place_id, language_code, name, short_description, long_description,
  instructions, warnings, accessibility_information, source_language_code,
  machine_generated, translation_status, publication_status, reviewed_at
) on public.place_translations to anon, authenticated;

grant select (
  id, canonical_thai_name, normalized_name, category, dietary_notes, allergen_notes,
  publication_status, verification_status, data_classification, updated_at,
  history_summary, traveler_description, production_area,
  authentic_production_area, community_enterprise, local_producer, tags,
  last_checked_at, confidence_score
) on public.food_specialties to anon, authenticated;

grant select (
  id, food_specialty_id, language_code, name, short_description, long_description,
  instructions, warnings, accessibility_information, source_language_code,
  machine_generated, translation_status, publication_status, reviewed_at
) on public.food_specialty_translations to anon, authenticated;

grant select (
  id, destination_id, canonical_thai_name, normalized_name, event_category,
  host_place_id, publication_status, verification_status, data_classification,
  last_checked_at, stale_at, updated_at, history_summary, tags, confidence_score
) on public.events to anon, authenticated;

grant select (
  id, event_id, language_code, name, short_description, long_description,
  instructions, warnings, accessibility_information, source_language_code,
  machine_generated, translation_status, publication_status, reviewed_at
) on public.event_translations to anon, authenticated;

grant select (
  id, event_id, destination_id, venue_place_id, starts_at, ends_at, timezone,
  occurrence_status, publication_status, verification_status, last_checked_at,
  stale_at, updated_at
) on public.event_occurrences to anon, authenticated;

grant select (
  place_id, official_thai_name, reviewed_english_name, emergency_category,
  operating_status, verified_at, next_verification_at, stale_at,
  suppression_status, publication_eligible, updated_at
) on public.emergency_service_profiles to anon, authenticated;

grant select (
  id, asset_type, storage_key, depicts_real_place, creator_name, rights_holder,
  expires_at, publication_status, takedown_status, data_classification,
  ai_generated_decorative, approved_display_contexts, updated_at
) on public.media_assets to anon, authenticated;
