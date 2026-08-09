/*
# Traveler profiles and stable Trip personalization links

- Adds session-owned, soft-deletable traveler profiles.
- Adds an optional profile link to Trips without changing existing Trip rows.
- Keeps all browser roles fail-closed; only the trusted server role may mutate.
- Provides atomic active-profile and safe deletion/reassignment operations.
*/

create table public.traveler_profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  traveler_session_id uuid not null references public.traveler_sessions(id) on delete cascade,
  profile_name text not null check (char_length(profile_name) between 1 and 80),
  description text check (description is null or char_length(description) <= 500),
  transportation text,
  travel_style text,
  companions text,
  activity_level text,
  mobility_needs text check (mobility_needs is null or char_length(mobility_needs) <= 300),
  budget_style text,
  preferred_interests text[] not null default '{}',
  is_active boolean not null default false,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  deleted_at timestamptz,
  correlation_id uuid not null default extensions.gen_random_uuid()
);

create unique index traveler_profiles_unique_name_per_session_idx
  on public.traveler_profiles (traveler_session_id, lower(btrim(profile_name)))
  where deleted_at is null;

create unique index traveler_profiles_one_active_per_session_idx
  on public.traveler_profiles (traveler_session_id)
  where is_active and deleted_at is null;

create index traveler_profiles_session_idx
  on public.traveler_profiles (traveler_session_id, created_at)
  where deleted_at is null;

-- Preserve the pre-profile JSON preferences as one active compatibility profile.
-- The legacy JSON remains untouched so rollback or older readers cannot lose data.
insert into public.traveler_profiles (
  traveler_session_id, profile_name, transportation, travel_style, companions,
  activity_level, budget_style, is_active
)
select
  s.id,
  'Imported preferences',
  nullif(s.traveler_preferences ->> 'transportation', ''),
  nullif(s.traveler_preferences ->> 'travelStyle', ''),
  nullif(s.traveler_preferences ->> 'companions', ''),
  nullif(s.traveler_preferences ->> 'activityLevel', ''),
  nullif(s.traveler_preferences ->> 'budget', ''),
  true
from public.traveler_sessions s
where s.traveler_preferences is not null
  and s.traveler_preferences <> '{}'::jsonb
  and s.deleted_at is null;

create trigger traveler_profiles_updated_at before update on public.traveler_profiles
for each row execute function public.set_updated_at();

alter table public.trips
  add column traveler_profile_id uuid references public.traveler_profiles(id) on delete restrict,
  add column destination text check (destination is null or char_length(destination) <= 160);

create index trips_traveler_profile_idx
  on public.trips (traveler_profile_id)
  where traveler_profile_id is not null and trip_status <> 'deleted';

create or replace function public.enforce_trip_profile_ownership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.traveler_profile_id is not null and not exists (
    select 1 from public.traveler_profiles p
    where p.id = new.traveler_profile_id
      and p.traveler_session_id = new.traveler_session_id
      and p.deleted_at is null
  ) then
    raise exception 'Trip profile is not owned by the traveler session'
      using errcode = '23503';
  end if;
  return new;
end;
$$;

create trigger trips_profile_ownership before insert or update of traveler_profile_id, traveler_session_id
on public.trips for each row execute function public.enforce_trip_profile_ownership();

alter table public.traveler_profiles enable row level security;
revoke all on public.traveler_profiles from public, anon, authenticated;
grant select, insert, update, delete on public.traveler_profiles to service_role;

create or replace function public.set_active_traveler_profile(
  target_session_id uuid,
  target_profile_id uuid
)
returns public.traveler_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_profile public.traveler_profiles;
begin
  select p.* into selected_profile
  from public.traveler_profiles p
  join public.traveler_sessions s on s.id = p.traveler_session_id
  where p.id = target_profile_id
    and p.traveler_session_id = target_session_id
    and p.deleted_at is null
    and s.revoked_at is null
    and s.deleted_at is null
    and s.expires_at > statement_timestamp()
  for update;

  if not found then
    raise exception 'traveler profile was not found' using errcode = '42501';
  end if;

  update public.traveler_profiles
  set is_active = false
  where traveler_session_id = target_session_id
    and deleted_at is null
    and is_active;

  update public.traveler_profiles
  set is_active = true
  where id = target_profile_id
  returning * into selected_profile;

  insert into public.audit_events (
    action, subject_table, subject_id, after_summary, reason,
    request_correlation_id, data_classification
  ) values (
    'traveler.profile_activated', 'traveler_profiles', selected_profile.id,
    jsonb_build_object('traveler_session_id', target_session_id),
    'Server-authenticated traveler profile activation',
    selected_profile.correlation_id, 'real'
  );

  return selected_profile;
end;
$$;

create or replace function public.delete_traveler_profile(
  target_session_id uuid,
  target_profile_id uuid,
  linked_trip_action text default 'block',
  replacement_profile_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile public.traveler_profiles;
begin
  select p.* into target_profile
  from public.traveler_profiles p
  join public.traveler_sessions s on s.id = p.traveler_session_id
  where p.id = target_profile_id
    and p.traveler_session_id = target_session_id
    and p.deleted_at is null
    and s.revoked_at is null
    and s.deleted_at is null
    and s.expires_at > statement_timestamp()
  for update;

  if not found then
    raise exception 'traveler profile was not found' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.trips
    where traveler_session_id = target_session_id
      and traveler_profile_id = target_profile_id
      and trip_status <> 'deleted'
  ) then
    if linked_trip_action = 'reassign' then
      if replacement_profile_id is null or not exists (
        select 1 from public.traveler_profiles
        where id = replacement_profile_id
          and traveler_session_id = target_session_id
          and deleted_at is null
          and id <> target_profile_id
      ) then
        raise exception 'replacement profile is invalid' using errcode = '22023';
      end if;
      update public.trips
      set traveler_profile_id = replacement_profile_id
      where traveler_session_id = target_session_id
        and traveler_profile_id = target_profile_id
        and trip_status <> 'deleted';
    elsif linked_trip_action = 'detach' then
      update public.trips
      set traveler_profile_id = null
      where traveler_session_id = target_session_id
        and traveler_profile_id = target_profile_id
        and trip_status <> 'deleted';
    else
      raise exception 'profile has linked trips' using errcode = '23503';
    end if;
  end if;

  update public.traveler_profiles
  set deleted_at = statement_timestamp(), is_active = false
  where id = target_profile_id;

  insert into public.audit_events (
    action, subject_table, subject_id, after_summary, reason,
    request_correlation_id, data_classification
  ) values (
    'traveler.profile_deleted', 'traveler_profiles', target_profile_id,
    jsonb_build_object('linked_trip_action', linked_trip_action,
      'replacement_profile_id', replacement_profile_id),
    'Server-authenticated traveler profile deletion',
    target_profile.correlation_id, 'real'
  );
end;
$$;

revoke all on function public.set_active_traveler_profile(uuid, uuid) from public, anon, authenticated;
revoke all on function public.delete_traveler_profile(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.set_active_traveler_profile(uuid, uuid) to service_role;
grant execute on function public.delete_traveler_profile(uuid, uuid, text, uuid) to service_role;

comment on table public.traveler_profiles is
  'Anonymous-session-owned travel preferences. Never used as a source of real-world facts.';
comment on column public.trips.traveler_profile_id is
  'Stable optional personalization context; changing the active profile does not rewrite this link.';
