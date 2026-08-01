create or replace function public.current_traveler_session_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.traveler_sessions
  where session_secret_hash = encode(
    extensions.digest(
      coalesce(current_setting('request.headers', true), '{}')::jsonb ->> 'x-traveler-session-secret',
      'sha256'
    ),
    'hex'
  )
    and revoked_at is null
    and deleted_at is null
    and expires_at > statement_timestamp()
  limit 1;
$$;

revoke all on function public.current_traveler_session_id() from public;
grant execute on function public.current_traveler_session_id() to anon, authenticated;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where auth_subject = auth.uid() and active
  );
$$;

create or replace function public.is_founder()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where auth_subject = auth.uid() and active and role = 'founder'
  );
$$;

revoke all on function public.is_active_admin() from public;
revoke all on function public.is_founder() from public;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.is_founder() to authenticated;

create or replace function public.place_has_current_evidence(target_place_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.place_assertions pa
    join public.source_assertions sa on sa.id = pa.assertion_id
    join public.sources s on s.id = sa.source_id
    where pa.place_id = target_place_id
      and sa.verification_status = 'verified'
      and (sa.expires_at is null or sa.expires_at > statement_timestamp())
      and s.usage_rights_status = 'approved'
  );
$$;

create or replace function public.media_has_current_rights(target_media_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.media_assets ma
    join public.licenses l on l.id = ma.license_id
    join public.sources s on s.id = ma.source_id
    where ma.id = target_media_id
      and l.approval_status = 'approved'
      and l.storage_permitted
      and (l.expires_at is null or l.expires_at > statement_timestamp())
      and s.usage_rights_status = 'approved'
  );
$$;

revoke all on function public.place_has_current_evidence(uuid) from public;
revoke all on function public.media_has_current_rights(uuid) from public;
grant execute on function public.place_has_current_evidence(uuid) to anon, authenticated;
grant execute on function public.media_has_current_rights(uuid) to anon, authenticated;

alter table public.geographies enable row level security;
alter table public.destinations enable row level security;
alter table public.places enable row level security;
alter table public.place_translations enable row level security;
alter table public.restaurant_profiles enable row level security;
alter table public.attraction_profiles enable row level security;
alter table public.food_specialties enable row level security;
alter table public.food_specialty_translations enable row level security;
alter table public.events enable row level security;
alter table public.event_translations enable row level security;
alter table public.event_occurrences enable row level security;
alter table public.emergency_service_profiles enable row level security;
alter table public.media_assets enable row level security;
alter table public.sources enable row level security;
alter table public.source_assertions enable row level security;
alter table public.licenses enable row level security;
alter table public.verifications enable row level security;
alter table public.contact_methods enable row level security;
alter table public.traveler_sessions enable row level security;
alter table public.trips enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.saved_places enable row level security;
alter table public.ai_usage_records enable row level security;
alter table public.incorrect_information_reports enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_events enable row level security;

create policy public_real_places on public.places for select to anon, authenticated
using (
  data_classification = 'real'
  and publication_status = 'published'
  and verification_status = 'verified'
  and suppressed_at is null
  and (stale_at is null or stale_at > statement_timestamp())
  and public.place_has_current_evidence(id)
);

create policy public_active_geographies on public.geographies for select to anon, authenticated
using (data_classification = 'real' and status = 'active');
create policy public_active_destinations on public.destinations for select to anon, authenticated
using (data_classification = 'real' and activation_status = 'active');

create policy public_place_translations on public.place_translations for select to anon, authenticated
using (
  publication_status = 'published'
  and translation_status = 'reviewed'
  and exists (
    select 1 from public.places p
    where p.id = place_translations.place_id
      and p.data_classification = 'real'
      and p.publication_status = 'published'
  )
);
create policy public_restaurant_profiles on public.restaurant_profiles for select to anon, authenticated
using (exists (select 1 from public.places p where p.id = restaurant_profiles.place_id));
create policy public_attraction_profiles on public.attraction_profiles for select to anon, authenticated
using (exists (select 1 from public.places p where p.id = attraction_profiles.place_id));

create policy public_real_food on public.food_specialties for select to anon, authenticated
using (
  data_classification = 'real'
  and publication_status = 'published'
  and verification_status = 'verified'
);
create policy public_food_translations on public.food_specialty_translations for select to anon, authenticated
using (
  publication_status = 'published'
  and translation_status = 'reviewed'
  and exists (
    select 1 from public.food_specialties f
    where f.id = food_specialty_translations.food_specialty_id
      and f.data_classification = 'real'
      and f.publication_status = 'published'
  )
);

create policy public_real_events on public.events for select to anon, authenticated
using (
  data_classification = 'real'
  and publication_status = 'published'
  and verification_status = 'verified'
  and (stale_at is null or stale_at > statement_timestamp())
);
create policy public_event_translations on public.event_translations for select to anon, authenticated
using (
  publication_status = 'published'
  and translation_status = 'reviewed'
  and exists (
    select 1 from public.events e
    where e.id = event_translations.event_id
      and e.data_classification = 'real'
      and e.publication_status = 'published'
  )
);

create policy public_active_occurrences on public.event_occurrences for select to anon, authenticated
using (
  publication_status = 'published'
  and verification_status = 'verified'
  and occurrence_status in ('scheduled', 'rescheduled')
  and coalesce(ends_at, starts_at) >= statement_timestamp()
  and exists (
    select 1 from public.events e
    where e.id = event_occurrences.event_id
      and e.data_classification = 'real'
      and e.publication_status = 'published'
  )
);

create policy public_safe_emergency on public.emergency_service_profiles for select to anon, authenticated
using (
  publication_eligible
  and stale_at > statement_timestamp()
  and exists (
    select 1 from public.places p
    where p.id = emergency_service_profiles.place_id
      and p.data_classification = 'real'
      and p.publication_status = 'published'
      and p.verification_status = 'verified'
      and p.suppressed_at is null
  )
);

create policy public_safe_media on public.media_assets for select to anon, authenticated
using (
  data_classification = 'real'
  and publication_status = 'published'
  and takedown_status = 'clear'
  and public.media_has_current_rights(id)
);

create policy own_session_read on public.traveler_sessions for select to anon, authenticated
using (id = public.current_traveler_session_id());
create policy own_session_update on public.traveler_sessions for update to anon, authenticated
using (id = public.current_traveler_session_id())
with check (id = public.current_traveler_session_id());

create policy own_trips_all on public.trips for all to anon, authenticated
using (traveler_session_id = public.current_traveler_session_id())
with check (traveler_session_id = public.current_traveler_session_id());
create policy own_saved_places_all on public.saved_places for all to anon, authenticated
using (traveler_session_id = public.current_traveler_session_id())
with check (traveler_session_id = public.current_traveler_session_id());
create policy own_reports_all on public.incorrect_information_reports for all to anon, authenticated
using (reporter_session_id = public.current_traveler_session_id())
with check (reporter_session_id = public.current_traveler_session_id());
create policy own_ai_usage_read on public.ai_usage_records for select to anon, authenticated
using (traveler_session_id = public.current_traveler_session_id());

create policy own_itinerary_days_all on public.itinerary_days for all to anon, authenticated
using (
  exists (
    select 1 from public.trips t
    where t.id = itinerary_days.trip_id
      and t.traveler_session_id = public.current_traveler_session_id()
  )
)
with check (
  exists (
    select 1 from public.trips t
    where t.id = itinerary_days.trip_id
      and t.traveler_session_id = public.current_traveler_session_id()
  )
);

create policy own_itinerary_items_all on public.itinerary_items for all to anon, authenticated
using (
  exists (
    select 1 from public.itinerary_days d
    join public.trips t on t.id = d.trip_id
    where d.id = itinerary_items.itinerary_day_id
      and t.traveler_session_id = public.current_traveler_session_id()
  )
)
with check (
  exists (
    select 1 from public.itinerary_days d
    join public.trips t on t.id = d.trip_id
    where d.id = itinerary_items.itinerary_day_id
      and t.traveler_session_id = public.current_traveler_session_id()
  )
);

create policy active_admin_places on public.places for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_geographies on public.geographies for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_destinations on public.destinations for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_place_translations on public.place_translations for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_restaurant_profiles on public.restaurant_profiles for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_attraction_profiles on public.attraction_profiles for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_content on public.food_specialties for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_food_translations on public.food_specialty_translations for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_events on public.events for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_event_translations on public.event_translations for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_occurrences on public.event_occurrences for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_sources on public.sources for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_assertions on public.source_assertions for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy founder_licenses on public.licenses for all to authenticated
using (public.is_founder()) with check (public.is_founder());
create policy active_admin_verifications on public.verifications for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy active_admin_contacts on public.contact_methods for all to authenticated
using (public.is_active_admin()) with check (public.is_active_admin());
create policy founder_media_write on public.media_assets for all to authenticated
using (public.is_founder()) with check (public.is_founder());
create policy founder_emergency_write on public.emergency_service_profiles for all to authenticated
using (public.is_founder()) with check (public.is_founder());
create policy active_admin_self_read on public.admin_users for select to authenticated
using (auth_subject = auth.uid() or public.is_founder());
create policy founder_audit_read on public.audit_events for select to authenticated
using (public.is_founder());

create index geographies_parent_type_idx on public.geographies(parent_id, geography_type);
create index destinations_activation_idx on public.destinations(activation_status, geography_id);
create index places_destination_publication_idx on public.places(destination_id, publication_status);
create index places_category_idx on public.places(place_category, publication_status);
create index places_normalized_name_idx on public.places(normalized_search_name);
create index places_coordinates_idx on public.places(latitude, longitude);
create index places_freshness_idx on public.places(stale_at) where publication_status = 'published';
create index event_occurrences_active_idx on public.event_occurrences(destination_id, starts_at, occurrence_status);
create index emergency_category_stale_idx on public.emergency_service_profiles(emergency_category, stale_at);
create index assertions_subject_idx on public.source_assertions(subject_kind, subject_id, field_key);
create index assertions_recheck_idx on public.source_assertions(recheck_at, verification_status);
create index media_expiry_idx on public.media_assets(expires_at, publication_status);
create index sessions_expiry_idx on public.traveler_sessions(expires_at) where revoked_at is null;
create index trips_session_status_idx on public.trips(traveler_session_id, trip_status);
create index itinerary_items_order_idx on public.itinerary_items(itinerary_day_id, item_order);
create index reports_workflow_idx on public.incorrect_information_reports(report_status, priority, created_at);
create index audit_subject_time_idx on public.audit_events(subject_table, subject_id, occurred_at desc);
create index ai_usage_session_time_idx on public.ai_usage_records(traveler_session_id, requested_at desc);

comment on function public.current_traveler_session_id is
  'Ownership requires a high-entropy server-issued secret presented through a trusted request header. Client-supplied session UUIDs are never authoritative.';
comment on table public.audit_events is
  'Service-role operations bypass RLS by design and must remain server-only. No service-role credential may be used in browser code.';
