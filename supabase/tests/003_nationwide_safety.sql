-- Explicit test-only load of the quarantined nationwide fixture. Production reset does not load it.
\ir ../nationwide-draft-seed.sql

begin;

do $$
declare
  province_count integer;
begin
  select count(*) into province_count
  from public.geographies
  where geography_type = 'province' and official_code like 'TH-%';
  if province_count <> 77 then
    raise exception 'expected 77 province identities, found %', province_count;
  end if;
end;
$$;

do $$
declare
  target_id uuid;
begin
  select id into target_id from public.destinations
  where activation_status = 'evidence_pending' and data_classification = 'real'
  order by id limit 1;
  begin
    update public.destinations
    set activation_status = 'active'
    where id = target_id;
    raise exception 'unverified province activation unexpectedly succeeded';
  exception when check_violation then
    null;
  end;
end;
$$;

set local role anon;

do $$
declare
  visible_drafts integer;
begin
  select count(*) into visible_drafts from public.destinations;
  if visible_drafts <> 0 then
    raise exception 'anonymous role can see unpublished province drafts';
  end if;

  perform count(*) from public.public_food_specialty_catalog;
  perform count(*) from public.public_emergency_catalog;

  begin
    perform profile_source_id from public.destinations limit 1;
    raise exception 'anonymous role unexpectedly read province provenance';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform incident_notes from public.emergency_service_profiles limit 1;
    raise exception 'anonymous role unexpectedly read emergency internal notes';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

rollback;
