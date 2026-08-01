create or replace function public.admin_content_mutate(
  p_command jsonb,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.admin_users%rowtype;
  v_action text := p_command ->> 'action';
  v_kind text := p_command ->> 'kind';
  v_id uuid;
  v_reference_id uuid;
  v_target public.publication_status;
  v_current_status public.publication_status;
  v_classification public.data_classification;
  v_is_emergency boolean := false;
  v_before jsonb;
  v_after jsonb;
begin
  select * into v_admin from public.admin_users
  where auth_subject = auth.uid() and active;
  if not found then raise exception 'active admin required' using errcode = '42501'; end if;
  if p_correlation_id is null then raise exception 'correlation id required' using errcode = '22023'; end if;

  if v_action = 'create_place_draft' then
    if p_command #>> '{payload,dataClassification}' <> 'synthetic' then
      raise exception 'real content requires atomic provenance intake' using errcode = '23514';
    end if;
    if p_command #>> '{payload,placeCategory}' = 'emergency_service' and v_admin.role <> 'founder' then
      raise exception 'founder required for emergency content' using errcode = '42501';
    end if;
    insert into public.places (
      destination_id, geography_id, canonical_thai_name, default_english_name,
      normalized_search_name, address_summary, latitude, longitude,
      place_category, data_classification, publication_status
    ) values (
      (p_command #>> '{payload,destinationId}')::uuid,
      (p_command #>> '{payload,geographyId}')::uuid,
      p_command #>> '{payload,canonicalThaiName}', p_command #>> '{payload,defaultEnglishName}',
      p_command #>> '{payload,normalizedSearchName}', p_command #>> '{payload,addressSummary}',
      (p_command #>> '{payload,latitude}')::numeric, (p_command #>> '{payload,longitude}')::numeric,
      p_command #>> '{payload,placeCategory}',
      (p_command #>> '{payload,dataClassification}')::public.data_classification, 'draft'
    ) returning id, to_jsonb(public.places.*) into v_id, v_after;
    v_kind := case when p_command #>> '{payload,placeCategory}' = 'emergency_service'
      then 'emergency_service' else 'place' end;
    v_classification := (p_command #>> '{payload,dataClassification}')::public.data_classification;
  elsif v_action = 'update_place_draft' then
    v_id := (p_command ->> 'id')::uuid;
    select to_jsonb(p) into v_before from public.places p where p.id = v_id for update;
    if v_before is null then raise exception 'content not found' using errcode = 'P0002'; end if;
    if v_before ->> 'publication_status' not in ('draft', 'evidence_pending', 'review_pending') then
      raise exception 'only editable workflow states can be updated' using errcode = '23514';
    end if;
    if v_before ->> 'place_category' = 'emergency_service' and v_admin.role <> 'founder' then
      raise exception 'founder required for emergency content' using errcode = '42501';
    end if;
    update public.places set
      canonical_thai_name = coalesce(p_command #>> '{payload,canonicalThaiName}', canonical_thai_name),
      default_english_name = case when (p_command #> '{payload}') ? 'defaultEnglishName' then p_command #>> '{payload,defaultEnglishName}' else default_english_name end,
      address_summary = coalesce(p_command #>> '{payload,addressSummary}', address_summary),
      latitude = coalesce((p_command #>> '{payload,latitude}')::numeric, latitude),
      longitude = coalesce((p_command #>> '{payload,longitude}')::numeric, longitude)
    where id = v_id returning to_jsonb(public.places.*) into v_after;
    v_kind := case when v_before ->> 'place_category' = 'emergency_service'
      then 'emergency_service' else 'place' end;
    v_classification := (v_before ->> 'data_classification')::public.data_classification;
  else
    v_id := (p_command ->> 'id')::uuid;
    if v_kind not in ('place', 'food_specialty', 'event', 'emergency_service') then
      raise exception 'unsupported content kind' using errcode = '22023';
    end if;
    if v_kind in ('place', 'emergency_service') then
      select to_jsonb(p), p.publication_status, p.data_classification,
        p.place_category = 'emergency_service'
      into v_before, v_current_status, v_classification, v_is_emergency
      from public.places p where p.id = v_id for update;
      if v_before is null then raise exception 'content not found' using errcode = 'P0002'; end if;
      if (v_kind = 'emergency_service') <> v_is_emergency then
        raise exception 'content kind does not match persisted subtype' using errcode = '23514';
      end if;
    elsif v_kind = 'food_specialty' then
      select to_jsonb(f), f.publication_status, f.data_classification
      into v_before, v_current_status, v_classification
      from public.food_specialties f where f.id = v_id for update;
    else
      select to_jsonb(e), e.publication_status, e.data_classification
      into v_before, v_current_status, v_classification
      from public.events e where e.id = v_id for update;
    end if;
    if v_before is null then raise exception 'content not found' using errcode = 'P0002'; end if;
    if (v_is_emergency or v_action = 'attach_media') and v_admin.role <> 'founder' then
      raise exception 'founder required for protected content' using errcode = '42501';
    end if;

    if v_action = 'transition' then
      v_target := (p_command ->> 'target')::public.publication_status;
      if not (
        (v_current_status = 'draft' and v_target in ('evidence_pending', 'review_pending', 'archived'))
        or (v_current_status = 'evidence_pending' and v_target in ('draft', 'review_pending', 'archived'))
        or (v_current_status = 'review_pending' and v_target in ('draft', 'evidence_pending', 'approved', 'archived'))
        or (v_current_status = 'approved' and v_target in ('published', 'review_pending', 'archived'))
        or (v_current_status = 'published' and v_target in ('suppressed', 'archived'))
        or (v_current_status = 'suppressed' and v_target in ('review_pending', 'approved', 'archived'))
        or (v_current_status = 'archived' and v_target = 'draft')
      ) then raise exception 'publication lifecycle transition is not permitted' using errcode = '23514';
      end if;

      if v_target = 'published' then
        if v_classification <> 'real' then raise exception 'synthetic content cannot be published' using errcode = '23514'; end if;
        if v_kind in ('place', 'emergency_service') and not exists (
          select 1 from public.places p join public.destinations d on d.id = p.destination_id
          where p.id = v_id and p.verification_status = 'verified'
            and d.activation_status = 'active'
            and exists (select 1 from public.place_translations t where t.place_id = p.id and t.translation_status = 'reviewed' and t.publication_status = 'published')
            and exists (select 1 from public.place_verifications pv join public.verifications v on v.id = pv.verification_id where pv.place_id = p.id and v.status = 'verified' and (v.stale_at is null or v.stale_at > statement_timestamp()))
        ) then raise exception 'place publication eligibility requirements are not met' using errcode = '23514';
        elsif v_kind = 'food_specialty' and not exists (
          select 1 from public.food_specialties f where f.id = v_id and f.verification_status = 'verified'
            and exists (select 1 from public.food_specialty_translations t where t.food_specialty_id = f.id and t.translation_status = 'reviewed' and t.publication_status = 'published')
            and exists (select 1 from public.food_specialty_verifications fv join public.verifications v on v.id = fv.verification_id where fv.food_specialty_id = f.id and v.status = 'verified' and (v.stale_at is null or v.stale_at > statement_timestamp()))
        ) then raise exception 'food publication eligibility requirements are not met' using errcode = '23514';
        elsif v_kind = 'event' and not exists (
          select 1 from public.events e join public.destinations d on d.id = e.destination_id
          where e.id = v_id and e.verification_status = 'verified' and d.activation_status = 'active'
            and (e.stale_at is null or e.stale_at > statement_timestamp())
            and exists (select 1 from public.event_translations t where t.event_id = e.id and t.translation_status = 'reviewed' and t.publication_status = 'published')
            and exists (select 1 from public.event_verifications ev join public.verifications v on v.id = ev.verification_id where ev.event_id = e.id and v.status = 'verified' and (v.stale_at is null or v.stale_at > statement_timestamp()))
        ) then raise exception 'event publication eligibility requirements are not met' using errcode = '23514';
        end if;
        if v_is_emergency and not exists (
          select 1 from public.emergency_service_profiles ep where ep.place_id = v_id
            and ep.publication_eligible and ep.stale_at > statement_timestamp()
        ) then raise exception 'emergency publication eligibility requirements are not met' using errcode = '23514';
        end if;
      end if;
      if v_kind in ('place', 'emergency_service') then
        update public.places set publication_status = v_target,
          suppressed_at = case when v_target = 'suppressed' then statement_timestamp() else null end,
          suppression_reason = case when v_target = 'suppressed' then coalesce(p_command ->> 'reason', 'admin suppression') else null end
        where id = v_id returning to_jsonb(public.places.*) into v_after;
      elsif v_kind = 'food_specialty' then
        update public.food_specialties set publication_status = v_target where id = v_id returning to_jsonb(public.food_specialties.*) into v_after;
      else
        update public.events set publication_status = v_target where id = v_id returning to_jsonb(public.events.*) into v_after;
      end if;
      if v_after is null then raise exception 'content not found' using errcode = 'P0002'; end if;
    else
      v_reference_id := (p_command ->> 'referenceId')::uuid;
      if v_action = 'attach_assertion' then
        if not exists (
          select 1 from public.source_assertions a where a.id = v_reference_id
            and a.subject_id = v_id
            and a.subject_kind = case when v_kind = 'emergency_service' then 'emergency_service' else v_kind end
        ) then raise exception 'assertion does not belong to content' using errcode = '23503'; end if;
        if v_kind in ('place', 'emergency_service') then insert into public.place_assertions values (v_id, v_reference_id);
        elsif v_kind = 'food_specialty' then insert into public.food_specialty_assertions values (v_id, v_reference_id);
        else insert into public.event_assertions values (v_id, v_reference_id); end if;
      elsif v_action = 'attach_verification' then
        if not exists (
          select 1 from public.verifications v join public.source_assertions a on a.id = v.evidence_assertion_id
          where v.id = v_reference_id and a.subject_id = v_id
            and a.subject_kind = case when v_kind = 'emergency_service' then 'emergency_service' else v_kind end
        ) then raise exception 'verification evidence does not belong to content' using errcode = '23503'; end if;
        if v_kind in ('place', 'emergency_service') then insert into public.place_verifications values (v_id, v_reference_id);
        elsif v_kind = 'food_specialty' then insert into public.food_specialty_verifications values (v_id, v_reference_id);
        else insert into public.event_verifications values (v_id, v_reference_id); end if;
      elsif v_action = 'attach_media' then
        if v_kind not in ('place', 'emergency_service') then raise exception 'media attachment supports places only' using errcode = '22023'; end if;
        insert into public.place_media (place_id, media_asset_id, display_order) values (v_id, v_reference_id, 0);
      elsif v_action = 'attach_translation' then
        if v_kind in ('place', 'emergency_service') and not exists (select 1 from public.place_translations where id = v_reference_id and place_id = v_id) then raise exception 'translation does not belong to content' using errcode = '23503';
        elsif v_kind = 'food_specialty' and not exists (select 1 from public.food_specialty_translations where id = v_reference_id and food_specialty_id = v_id) then raise exception 'translation does not belong to content' using errcode = '23503';
        elsif v_kind = 'event' and not exists (select 1 from public.event_translations where id = v_reference_id and event_id = v_id) then raise exception 'translation does not belong to content' using errcode = '23503'; end if;
      else raise exception 'unsupported action' using errcode = '22023'; end if;
      v_after := jsonb_build_object('referenceId', v_reference_id);
    end if;
  end if;

  insert into public.audit_events (actor_admin_id, action, subject_table, subject_id, before_summary, after_summary, reason, request_correlation_id, data_classification)
  values (v_admin.id, 'content.' || v_action, v_kind, v_id, v_before, v_after, p_command ->> 'reason', p_correlation_id, v_classification);
  return jsonb_build_object('id', v_id, 'action', v_action, 'kind', v_kind);
end;
$$;

revoke all on function public.admin_content_mutate(jsonb, uuid) from public, anon;
grant execute on function public.admin_content_mutate(jsonb, uuid) to authenticated;

-- RLS establishes who is an admin, but it does not enforce workflow transitions.
-- Remove the earlier direct-write grants so every supported content mutation must
-- pass through an audited server-side RPC (or a separately reviewed future RPC).
revoke insert, update on public.places, public.geographies, public.destinations,
  public.place_translations, public.restaurant_profiles, public.attraction_profiles,
  public.food_specialties, public.food_specialty_translations, public.events,
  public.event_translations, public.event_occurrences, public.sources,
  public.source_assertions, public.licenses, public.verifications,
  public.contact_methods, public.media_assets, public.emergency_service_profiles,
  public.food_specialty_destinations, public.content_internal_notes
from authenticated;

comment on function public.admin_content_mutate is
  'Atomic, authenticated CMS mutation boundary. Server-side gates and table triggers remain authoritative.';
