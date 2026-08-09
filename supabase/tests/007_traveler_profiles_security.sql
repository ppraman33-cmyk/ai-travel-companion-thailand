begin;

do $test$
declare role_name text;
begin
  foreach role_name in array array['anon', 'authenticated'] loop
    if has_table_privilege(role_name, 'public.traveler_profiles', 'INSERT')
      or has_table_privilege(role_name, 'public.traveler_profiles', 'UPDATE')
      or has_table_privilege(role_name, 'public.traveler_profiles', 'DELETE')
    then
      raise exception '% retains direct traveler profile mutation privilege', role_name;
    end if;
    if has_function_privilege(role_name, 'public.set_active_traveler_profile(uuid,uuid)', 'EXECUTE')
      or has_function_privilege(role_name, 'public.delete_traveler_profile(uuid,uuid,text,uuid)', 'EXECUTE')
    then
      raise exception '% retains profile RPC execution privilege', role_name;
    end if;
  end loop;
end;
$test$;

set local role service_role;

insert into public.traveler_sessions (
  id, session_secret_hash, locale, privacy_consent_state,
  data_classification, expires_at
) values
  ('74000000-0000-4000-8000-000000000001', repeat('d', 64), 'en', '{}', 'synthetic', statement_timestamp() + interval '1 day'),
  ('74000000-0000-4000-8000-000000000002', repeat('e', 64), 'en', '{}', 'synthetic', statement_timestamp() + interval '1 day');

insert into public.traveler_profiles (
  id, traveler_session_id, profile_name, travel_style, companions, is_active
) values
  ('75000000-0000-4000-8000-000000000001', '74000000-0000-4000-8000-000000000001', 'Solo Thailand', 'cultural', 'solo', true),
  ('75000000-0000-4000-8000-000000000002', '74000000-0000-4000-8000-000000000001', 'Family holiday', 'family', 'family', false),
  ('75000000-0000-4000-8000-000000000003', '74000000-0000-4000-8000-000000000002', 'Foreign profile', 'nature', 'solo', true);

insert into public.trips (
  id, traveler_session_id, title, trip_status, timezone,
  traveler_profile_id, data_classification
) values (
  '76000000-0000-4000-8000-000000000001',
  '74000000-0000-4000-8000-000000000001',
  'TEST DATA — stable profile link', 'draft', 'Asia/Bangkok',
  '75000000-0000-4000-8000-000000000001', 'synthetic'
);

do $test$
begin
  begin
    insert into public.traveler_profiles (
      traveler_session_id, profile_name, is_active
    ) values (
      '74000000-0000-4000-8000-000000000001', ' solo thailand ', false
    );
    raise exception 'normalized duplicate profile name unexpectedly succeeded';
  exception when unique_violation then null;
  end;

  begin
    insert into public.trips (
      traveler_session_id, title, traveler_profile_id, data_classification
    ) values (
      '74000000-0000-4000-8000-000000000001',
      'TEST DATA — foreign profile attack',
      '75000000-0000-4000-8000-000000000003', 'synthetic'
    );
    raise exception 'cross-session Trip profile link unexpectedly succeeded';
  exception when foreign_key_violation then null;
  end;
end;
$test$;

select public.set_active_traveler_profile(
  '74000000-0000-4000-8000-000000000001',
  '75000000-0000-4000-8000-000000000002'
);

do $test$
begin
  if (select traveler_profile_id from public.trips where id = '76000000-0000-4000-8000-000000000001')
     <> '75000000-0000-4000-8000-000000000001' then
    raise exception 'active profile change rewrote an existing Trip link';
  end if;
  if (select count(*) from public.traveler_profiles
      where traveler_session_id = '74000000-0000-4000-8000-000000000001'
        and is_active and deleted_at is null) <> 1 then
    raise exception 'session does not have exactly one active profile';
  end if;

  begin
    perform public.set_active_traveler_profile(
      '74000000-0000-4000-8000-000000000001',
      '75000000-0000-4000-8000-000000000003'
    );
    raise exception 'foreign profile activation unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.delete_traveler_profile(
      '74000000-0000-4000-8000-000000000001',
      '75000000-0000-4000-8000-000000000001', 'block', null
    );
    raise exception 'linked profile deletion unexpectedly succeeded';
  exception when foreign_key_violation then null;
  end;
end;
$test$;

do $test$
begin
  begin
    perform public.delete_traveler_profile(
      '74000000-0000-4000-8000-000000000001',
      '75000000-0000-4000-8000-000000000001',
      'reassign',
      '75000000-0000-4000-8000-000000000003'
    );
    raise exception 'foreign replacement profile unexpectedly succeeded';
  exception when invalid_parameter_value then null;
  end;

  if (select traveler_profile_id from public.trips where id = '76000000-0000-4000-8000-000000000001')
     <> '75000000-0000-4000-8000-000000000001' then
    raise exception 'failed reassignment did not roll back';
  end if;
end;
$test$;

select public.delete_traveler_profile(
  '74000000-0000-4000-8000-000000000001',
  '75000000-0000-4000-8000-000000000001',
  'reassign',
  '75000000-0000-4000-8000-000000000002'
);

do $test$
begin
  if (select traveler_profile_id from public.trips where id = '76000000-0000-4000-8000-000000000001')
     <> '75000000-0000-4000-8000-000000000002' then
    raise exception 'Trip profile reassignment was not atomic';
  end if;
end;
$test$;

do $test$
begin
  if not exists (
    select 1 from public.traveler_profiles
    where id = '75000000-0000-4000-8000-000000000001'
      and deleted_at is not null and not is_active
  ) then
    raise exception 'profile safe-delete lifecycle was not persisted';
  end if;
end;
$test$;

do $test$
begin
  begin
    update public.trips
    set traveler_profile_id = '75000000-0000-4000-8000-000000000001'
    where id = '76000000-0000-4000-8000-000000000001';
    raise exception 'soft-deleted profile attachment unexpectedly succeeded';
  exception when foreign_key_violation then null;
  end;
end;
$test$;

-- Audit rows are intentionally not readable by service_role. The SQL test harness
-- returns to its privileged transaction role only to verify immutable evidence.
reset role;

do $test$
begin
  if not exists (
    select 1 from public.audit_events
    where action = 'traveler.profile_activated'
      and subject_id = '75000000-0000-4000-8000-000000000002'
      and request_correlation_id is not null
  ) or not exists (
    select 1 from public.audit_events
    where action = 'traveler.profile_deleted'
      and subject_id = '75000000-0000-4000-8000-000000000001'
      and after_summary ->> 'linked_trip_action' = 'reassign'
  ) then
    raise exception 'profile audit-event integrity was not preserved';
  end if;
end;
$test$;

rollback;
