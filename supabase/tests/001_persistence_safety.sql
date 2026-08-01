begin;

do $test$
begin
  begin
    insert into public.food_specialties (
      canonical_thai_name,
      normalized_name,
      category,
      publication_status,
      verification_status,
      data_classification
    )
    values (
      'ทดสอบเท่านั้น',
      'test only synthetic publish rejection',
      'test',
      'published',
      'verified',
      'synthetic'
    );
    raise exception 'expected synthetic publication rejection';
  exception
    when check_violation then null;
  end;
end;
$test$;

do $test$
declare
  place_count integer;
begin
  select count(*) into place_count
  from public.places
  where id in (
    '41000000-0000-4000-8000-000000000001',
    '42000000-0000-4000-8000-000000000001'
  );
  if place_count <> 0 then
    raise exception 'food specialties and events must not be Place rows';
  end if;
end;
$test$;

do $test$
begin
  begin
    update public.emergency_service_profiles
    set suppression_status = 'not_suppressed',
        suppression_reason = null,
        operating_status = 'operating'
    where place_id = '40000000-0000-4000-8000-000000000003';
    raise exception 'expected unsafe synthetic emergency rejection';
  exception
    when check_violation then null;
  end;
end;
$test$;

do $test$
declare
  published_synthetic integer;
  callable_synthetic_emergency integer;
begin
  select count(*) into published_synthetic
  from public.places
  where data_classification = 'synthetic' and publication_status = 'published';
  if published_synthetic <> 0 then
    raise exception 'synthetic Place escaped publication isolation';
  end if;

  select count(*) into callable_synthetic_emergency
  from public.emergency_service_profiles esp
  join public.places p on p.id = esp.place_id
  join public.contact_methods cm on cm.id = esp.verified_phone_contact_id
  where p.data_classification = 'synthetic'
    and cm.normalized_value ~ '^[+]?[0-9][0-9 -]{5,}$';
  if callable_synthetic_emergency <> 0 then
    raise exception 'synthetic emergency contact is callable';
  end if;
end;
$test$;

do $test$
declare
  first_session uuid;
  second_session uuid;
begin
  perform set_config(
    'request.headers',
    '{"x-traveler-session-secret":"synthetic-session-secret-alpha"}',
    true
  );
  select public.current_traveler_session_id() into first_session;
  if first_session <> '70000000-0000-4000-8000-000000000001'::uuid then
    raise exception 'server-issued session secret did not resolve expected owner';
  end if;

  perform set_config(
    'request.headers',
    '{"x-traveler-session-secret":"synthetic-session-secret-beta"}',
    true
  );
  select public.current_traveler_session_id() into second_session;
  if second_session = first_session then
    raise exception 'distinct session secrets resolved to the same owner';
  end if;
end;
$test$;

do $test$
declare
  expired_media integer;
  cancelled_occurrence integer;
begin
  select count(*) into expired_media
  from public.media_assets ma
  join public.licenses l on l.id = ma.license_id
  where l.approval_status = 'expired'
    and ma.publication_status = 'published';
  if expired_media <> 0 then
    raise exception 'expired media license remained published';
  end if;

  select count(*) into cancelled_occurrence
  from public.event_occurrences
  where occurrence_status = 'cancelled' and cancellation_reason is not null;
  if cancelled_occurrence = 0 then
    raise exception 'cancelled occurrence fixture is missing';
  end if;
end;
$test$;

rollback;
