/*
# Secure traveler session bootstrap and atomic itinerary reorder

- Removes the misleading browser-role INSERT grant added by migration 012.
- Keeps traveler session creation behind the server-only service-role boundary.
- Adds a narrowly granted, atomic reorder operation for itinerary items.
- The ordered array must contain every item in exactly one owned itinerary day.
*/

revoke insert on public.traveler_sessions from anon, authenticated;

alter table public.itinerary_items
  drop constraint itinerary_items_itinerary_day_id_item_order_key;

alter table public.itinerary_items
  add constraint itinerary_items_itinerary_day_id_item_order_key
  unique (itinerary_day_id, item_order)
  deferrable initially immediate;

create or replace function public.reorder_itinerary_items(
  target_session_id uuid,
  target_trip_id uuid,
  target_day_id uuid,
  ordered_item_ids uuid[]
)
returns setof public.itinerary_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected_count integer;
  target_classification public.data_classification;
begin
  if ordered_item_ids is null or cardinality(ordered_item_ids) = 0 then
    raise exception 'ordered itinerary items are required' using errcode = '22023';
  end if;

  if exists (
    select 1 from unnest(ordered_item_ids) item_id
    group by item_id having count(*) > 1
  ) then
    raise exception 'duplicate itinerary item' using errcode = '22023';
  end if;

  select t.data_classification into target_classification
    from public.itinerary_days d
    join public.trips t on t.id = d.trip_id
    join public.traveler_sessions s on s.id = t.traveler_session_id
    where d.id = target_day_id
      and t.id = target_trip_id
      and t.traveler_session_id = target_session_id
      and t.trip_status <> 'deleted'
      and s.revoked_at is null
      and s.deleted_at is null
      and s.expires_at > statement_timestamp();
  if not found then
    raise exception 'itinerary day was not found' using errcode = '42501';
  end if;

  select count(*) into expected_count
  from public.itinerary_items
  where itinerary_day_id = target_day_id and item_status <> 'deleted';

  if expected_count <> cardinality(ordered_item_ids)
     or exists (
       select 1 from unnest(ordered_item_ids) item_id
       where not exists (
         select 1 from public.itinerary_items i
         where i.id = item_id
           and i.itinerary_day_id = target_day_id
           and i.item_status <> 'deleted'
       )
     ) then
    raise exception 'ordered items do not match itinerary day' using errcode = '22023';
  end if;

  set constraints itinerary_items_itinerary_day_id_item_order_key deferred;

  update public.itinerary_items i
  set item_order = requested.item_order,
      traveler_modified_at = statement_timestamp()
  from (
    select item_id, ordinality - 1 as item_order
    from unnest(ordered_item_ids) with ordinality as requested(item_id, ordinality)
  ) requested
  where i.id = requested.item_id and i.itinerary_day_id = target_day_id;

  insert into public.audit_events (
    actor_admin_id,
    action,
    subject_table,
    subject_id,
    after_summary,
    reason,
    request_correlation_id,
    data_classification
  ) values (
    null,
    'traveler.itinerary_reordered',
    'itinerary_days',
    target_day_id,
    jsonb_build_object('ordered_item_ids', ordered_item_ids),
    'Server-authenticated traveler itinerary reorder',
    extensions.gen_random_uuid(),
    target_classification
  );

  return query
  select i.* from public.itinerary_items i
  where i.itinerary_day_id = target_day_id and i.item_status <> 'deleted'
  order by i.item_order;
end;
$$;

revoke all on function public.reorder_itinerary_items(uuid, uuid, uuid, uuid[]) from public;
revoke all on function public.reorder_itinerary_items(uuid, uuid, uuid, uuid[]) from anon, authenticated;
grant execute on function public.reorder_itinerary_items(uuid, uuid, uuid, uuid[]) to service_role;

comment on function public.reorder_itinerary_items(uuid, uuid, uuid, uuid[]) is
  'Server-only atomic reorder. Validates active session, Trip ownership, day membership, completeness, and duplicates.';
