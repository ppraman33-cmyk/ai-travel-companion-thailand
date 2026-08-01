revoke all on all tables in schema public from anon, authenticated;

grant select on public.geographies to anon, authenticated;
grant select on public.destinations to anon, authenticated;
grant select on public.places to anon, authenticated;
grant select on public.place_translations to anon, authenticated;
grant select on public.restaurant_profiles to anon, authenticated;
grant select on public.attraction_profiles to anon, authenticated;
grant select on public.food_specialties to anon, authenticated;
grant select on public.food_specialty_translations to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.event_translations to anon, authenticated;
grant select on public.event_occurrences to anon, authenticated;
grant select on public.emergency_service_profiles to anon, authenticated;
grant select on public.media_assets to anon, authenticated;

grant select on public.traveler_sessions to anon, authenticated;
grant update (locale, destination_id, privacy_consent_state, last_activity_at, revoked_at)
  on public.traveler_sessions to anon, authenticated;
grant select, insert, update, delete on public.trips to anon, authenticated;
grant select, insert, update, delete on public.itinerary_days to anon, authenticated;
grant select, insert, update, delete on public.itinerary_items to anon, authenticated;
grant select, insert, update, delete on public.saved_places to anon, authenticated;
grant select on public.ai_usage_records to anon, authenticated;
grant select, insert, update on public.incorrect_information_reports to anon, authenticated;

grant select, insert, update on public.places to authenticated;
grant select, insert, update on public.geographies to authenticated;
grant select, insert, update on public.destinations to authenticated;
grant select, insert, update on public.place_translations to authenticated;
grant select, insert, update on public.restaurant_profiles to authenticated;
grant select, insert, update on public.attraction_profiles to authenticated;
grant select, insert, update on public.food_specialties to authenticated;
grant select, insert, update on public.food_specialty_translations to authenticated;
grant select, insert, update on public.events to authenticated;
grant select, insert, update on public.event_translations to authenticated;
grant select, insert, update on public.event_occurrences to authenticated;
grant select, insert, update on public.sources to authenticated;
grant select, insert, update on public.source_assertions to authenticated;
grant select, insert, update on public.licenses to authenticated;
grant select, insert, update on public.verifications to authenticated;
grant select, insert, update on public.contact_methods to authenticated;
grant select, insert, update on public.media_assets to authenticated;
grant select, insert, update on public.emergency_service_profiles to authenticated;
grant select on public.admin_users to authenticated;
grant select on public.audit_events to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;

comment on schema public is
  'Client roles receive explicit least-privilege grants plus RLS. Service-role access is reserved for trusted server operations and is never a browser credential.';
