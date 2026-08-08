begin;

do $test$
declare role_name text;
declare table_name text;
begin
  foreach role_name in array array['anon', 'authenticated'] loop
    foreach table_name in array array[
      'traveler_sessions', 'trips', 'itinerary_days', 'itinerary_items',
      'saved_places', 'incorrect_information_reports'
    ] loop
      if has_table_privilege(role_name, 'public.' || table_name, 'INSERT')
        or has_table_privilege(role_name, 'public.' || table_name, 'UPDATE')
        or has_table_privilege(role_name, 'public.' || table_name, 'DELETE')
      then
        raise exception '% retains direct traveler mutation privilege on %', role_name, table_name;
      end if;
    end loop;
    if has_any_column_privilege(role_name, 'public.traveler_sessions', 'UPDATE') then
      raise exception '% retains direct traveler session column-update privilege', role_name;
    end if;
  end loop;
end;
$test$;

do $test$
begin
  begin
    set local role anon;
    insert into public.traveler_sessions (
      id, session_secret_hash, locale, privacy_consent_state,
      data_classification, expires_at
    ) values (
      '70000000-0000-4000-8000-000000000099', repeat('a', 64), 'en', '{}',
      'synthetic', statement_timestamp() + interval '1 day'
    );
    raise exception 'anon direct session insert unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;
  reset role;

  begin
    set local role authenticated;
    insert into public.traveler_sessions (
      id, session_secret_hash, locale, privacy_consent_state,
      data_classification, expires_at
    ) values (
      '70000000-0000-4000-8000-000000000098', repeat('b', 64), 'en', '{}',
      'synthetic', statement_timestamp() + interval '1 day'
    );
    raise exception 'authenticated direct session insert unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;
  reset role;
end;
$test$;

set local role service_role;

insert into public.traveler_sessions (
  id, session_secret_hash, locale, privacy_consent_state,
  data_classification, expires_at
) values (
  '70000000-0000-4000-8000-000000000099',
  encode(extensions.digest('server-only-high-entropy-test-secret', 'sha256'), 'hex'),
  'en', '{}', 'synthetic', statement_timestamp() + interval '1 day'
);

do $test$
declare stored_hash text;
begin
  select session_secret_hash into stored_hash from public.traveler_sessions
  where id = '70000000-0000-4000-8000-000000000099';
  if stored_hash = 'server-only-high-entropy-test-secret' or length(stored_hash) <> 64 then
    raise exception 'session secret was not stored exclusively as a SHA-256 hash';
  end if;

  begin
    insert into public.traveler_sessions (
      id, session_secret_hash, locale, privacy_consent_state,
      data_classification, expires_at
    ) values (
      '70000000-0000-4000-8000-000000000097', 'plaintext', 'en', '{}',
      'synthetic', statement_timestamp() + interval '1 day'
    );
    raise exception 'invalid session secret hash unexpectedly succeeded';
  exception when check_violation then
    null;
  end;

  begin
    insert into public.traveler_sessions (
      id, session_secret_hash, locale, privacy_consent_state,
      data_classification, expires_at
    ) values (
      '70000000-0000-4000-8000-000000000099', repeat('c', 64), 'en', '{}',
      'synthetic', statement_timestamp() + interval '1 day'
    );
    raise exception 'duplicate session bootstrap unexpectedly succeeded';
  exception when unique_violation then
    null;
  end;
end;
$test$;

insert into public.itinerary_items (
  id, itinerary_day_id, item_order, place_id, notes, item_status,
  ai_generated, data_classification
) values (
  '73000000-0000-4000-8000-000000000002',
  '72000000-0000-4000-8000-000000000001',
  1,
  '40000000-0000-4000-8000-000000000002',
  'TEST DATA — reorder fixture',
  'confirmed',
  false,
  'synthetic'
);

update public.itinerary_items set planned_at = '09:30'::time
where id = '73000000-0000-4000-8000-000000000001';

select public.reorder_itinerary_items(
  '70000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  '72000000-0000-4000-8000-000000000001',
  array[
    '73000000-0000-4000-8000-000000000002',
    '73000000-0000-4000-8000-000000000001'
  ]::uuid[]
);

do $test$
declare first_id uuid;
declare persisted_time time;
begin
  select id into first_id from public.itinerary_items
  where itinerary_day_id = '72000000-0000-4000-8000-000000000001'
  order by item_order limit 1;
  if first_id <> '73000000-0000-4000-8000-000000000002' then
    raise exception 'atomic itinerary reorder was not persisted';
  end if;
  select planned_at into persisted_time from public.itinerary_items
  where id = '73000000-0000-4000-8000-000000000001';
  if persisted_time <> '09:30'::time then
    raise exception 'planned wall-clock time was not persisted';
  end if;
  if not exists (
    select 1 from public.audit_events
    where action = 'traveler.itinerary_reordered'
      and subject_table = 'itinerary_days'
      and subject_id = '72000000-0000-4000-8000-000000000001'
      and data_classification = 'synthetic'
  ) then
    raise exception 'itinerary reorder audit event is missing or inconsistent';
  end if;

  begin
    perform public.reorder_itinerary_items(
      '70000000-0000-4000-8000-000000000002',
      '71000000-0000-4000-8000-000000000001',
      '72000000-0000-4000-8000-000000000001',
      array['73000000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000001']::uuid[]
    );
    raise exception 'foreign session reorder unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.reorder_itinerary_items(
      '70000000-0000-4000-8000-000000000001',
      '71000000-0000-4000-8000-000000000001',
      '72000000-0000-4000-8000-000000000001',
      array['73000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001']::uuid[]
    );
    raise exception 'duplicate reorder unexpectedly succeeded';
  exception when invalid_parameter_value then
    null;
  end;
end;
$test$;

reset role;
rollback;
