begin;

set local role anon;
select set_config(
  'request.headers',
  '{"x-traveler-session-secret":"synthetic-session-secret-alpha"}',
  true
);

do $test$
declare
  own_trips integer;
  other_trips integer;
  own_saved integer;
  own_reports integer;
  public_places integer;
  public_emergencies integer;
begin
  select count(*) into own_trips
  from public.trips
  where traveler_session_id = '70000000-0000-4000-8000-000000000001';
  select count(*) into other_trips
  from public.trips
  where traveler_session_id = '70000000-0000-4000-8000-000000000002';
  select count(*) into own_saved from public.saved_places;
  select count(*) into own_reports from public.incorrect_information_reports;
  select count(*) into public_places from public.places;
  select count(*) into public_emergencies from public.emergency_service_profiles;

  if own_trips <> 1 or other_trips <> 0 then
    raise exception 'anonymous Trip ownership policy failed';
  end if;
  if own_saved <> 1 or own_reports <> 1 then
    raise exception 'anonymous saved-place or report ownership policy failed';
  end if;
  if public_places <> 1 then
    raise exception 'public Place policy did not expose exactly the fictional real-path fixture';
  end if;
  if public_emergencies <> 0 then
    raise exception 'stale synthetic emergency escaped public RLS';
  end if;
end;
$test$;

select set_config(
  'request.headers',
  '{"x-traveler-session-secret":"synthetic-session-secret-beta"}',
  true
);

do $test$
declare
  visible_trips integer;
  visible_saved integer;
  visible_reports integer;
begin
  select count(*) into visible_trips from public.trips;
  select count(*) into visible_saved from public.saved_places;
  select count(*) into visible_reports from public.incorrect_information_reports;
  if visible_trips <> 0 or visible_saved <> 0 or visible_reports <> 0 then
    raise exception 'second anonymous session read first session data';
  end if;
end;
$test$;

reset role;
rollback;
