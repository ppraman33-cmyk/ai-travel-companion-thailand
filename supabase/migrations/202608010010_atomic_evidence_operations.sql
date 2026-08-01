alter table public.sources
  add column ownership_status text not null default 'unclear'
    check (ownership_status in ('owned', 'licensed', 'permission_granted', 'unclear', 'prohibited')),
  add column provenance_verification_status public.verification_status not null default 'pending',
  add column provenance_verified_at timestamptz,
  add column provenance_verifier_id uuid references public.admin_users(id) on delete restrict,
  add column evidence_locator text;

alter table public.sources add constraint sources_verified_provenance_check check (
  provenance_verification_status <> 'verified'
  or (provenance_verified_at is not null and provenance_verifier_id is not null)
);

-- Compatibility correction for the audited media attachment command introduced
-- in migration 009. No production data exists at this stage.
alter table public.place_media rename column sort_order to display_order;
alter table public.place_media alter column display_context set default 'category';

create or replace function public.admin_evidence_mutate(
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
  v_subject_id uuid;
  v_subject_classification public.data_classification;
  v_is_emergency boolean := false;
  v_source_id uuid;
  v_license_id uuid;
  v_assertion_id uuid;
  v_reference_id uuid;
  v_result_id uuid;
  v_status public.verification_status;
  v_now timestamptz := statement_timestamp();
begin
  select * into v_admin from public.admin_users
  where auth_subject = auth.uid() and active;
  if not found then raise exception 'active admin required' using errcode = '42501'; end if;
  if p_correlation_id is null then raise exception 'correlation id required' using errcode = '22023'; end if;

  if v_action = 'create_source' then
    if v_admin.role <> 'founder' then raise exception 'founder required for provenance rights' using errcode = '42501'; end if;
    if (p_command #>> '{payload,sourceUrl}') !~ '^https://' or (p_command #>> '{payload,license,termsUrl}') !~ '^https://' then
      raise exception 'https provenance URLs required' using errcode = '23514';
    end if;
    if p_command #>> '{payload,rightsStatus}' = 'approved' and (
      p_command #>> '{payload,ownershipStatus}' in ('unclear', 'prohibited')
      or p_command #>> '{payload,license,approvalStatus}' <> 'approved'
    ) then raise exception 'approved rights require clear ownership and approved license' using errcode = '23514'; end if;
    if p_command #>> '{payload,verificationStatus}' = 'verified' and p_command #>> '{payload,verifiedAt}' is null then
      raise exception 'verified provenance requires verification date' using errcode = '23514';
    end if;
    if (p_command #>> '{payload,verifiedAt}')::timestamptz > v_now
      or (p_command #>> '{payload,retrievedAt}')::timestamptz > v_now
    then raise exception 'provenance dates cannot be in the future' using errcode = '23514'; end if;

    insert into public.licenses (
      name, rights_holder, license_category, terms_url, commercial_use_permitted,
      modification_permitted, storage_permitted, redistribution_permitted,
      attribution_required, attribution_text, expires_at, evidence_reference,
      approval_status, data_classification
    ) values (
      p_command #>> '{payload,license,name}', p_command #>> '{payload,license,rightsHolder}',
      p_command #>> '{payload,license,category}', p_command #>> '{payload,license,termsUrl}',
      (p_command #>> '{payload,license,commercialUsePermitted}')::boolean,
      (p_command #>> '{payload,license,modificationPermitted}')::boolean,
      (p_command #>> '{payload,license,storagePermitted}')::boolean,
      (p_command #>> '{payload,license,redistributionPermitted}')::boolean,
      (p_command #>> '{payload,license,attributionRequired}')::boolean,
      p_command #>> '{payload,license,attributionText}',
      (p_command #>> '{payload,license,expiresAt}')::timestamptz,
      p_command #>> '{payload,evidenceLocator}', p_command #>> '{payload,license,approvalStatus}',
      (p_command #>> '{payload,dataClassification}')::public.data_classification
    ) returning id into v_license_id;

    insert into public.sources (
      source_type, owner_name, title, source_url, accessed_at, usage_rights_status,
      license_id, evidence_notes, data_classification, ownership_status,
      provenance_verification_status, provenance_verified_at,
      provenance_verifier_id, evidence_locator
    ) values (
      p_command #>> '{payload,sourceType}', p_command #>> '{payload,publisher}',
      p_command #>> '{payload,title}', p_command #>> '{payload,sourceUrl}',
      (p_command #>> '{payload,retrievedAt}')::timestamptz,
      p_command #>> '{payload,rightsStatus}', v_license_id,
      p_command #>> '{payload,notes}',
      (p_command #>> '{payload,dataClassification}')::public.data_classification,
      p_command #>> '{payload,ownershipStatus}',
      (p_command #>> '{payload,verificationStatus}')::public.verification_status,
      (p_command #>> '{payload,verifiedAt}')::timestamptz,
      case when p_command #>> '{payload,verificationStatus}' = 'verified' then v_admin.id else null end,
      p_command #>> '{payload,evidenceLocator}'
    ) returning id, data_classification into v_result_id, v_subject_classification;

  else
    v_subject_id := (p_command ->> 'id')::uuid;
    if v_kind in ('place', 'emergency_service') then
      select p.data_classification, p.place_category = 'emergency_service'
      into v_subject_classification, v_is_emergency from public.places p where p.id = v_subject_id;
      if not found then raise exception 'subject not found' using errcode = 'P0002'; end if;
      if (v_kind = 'emergency_service') <> v_is_emergency then raise exception 'subject kind mismatch' using errcode = '23514'; end if;
    elsif v_kind = 'food_specialty' then
      select data_classification into v_subject_classification from public.food_specialties where id = v_subject_id;
      if not found then raise exception 'subject not found' using errcode = 'P0002'; end if;
    elsif v_kind = 'event' then
      select data_classification into v_subject_classification from public.events where id = v_subject_id;
      if not found then raise exception 'subject not found' using errcode = 'P0002'; end if;
    else raise exception 'unsupported subject kind' using errcode = '22023'; end if;
    if v_is_emergency and v_admin.role <> 'founder' then raise exception 'founder required for emergency evidence' using errcode = '42501'; end if;

    if v_action = 'create_assertion' then
      v_source_id := (p_command #>> '{payload,sourceId}')::uuid;
      if not exists (
        select 1 from public.sources s where s.id = v_source_id
          and s.data_classification = v_subject_classification
          and s.ownership_status <> 'prohibited'
          and s.usage_rights_status not in ('rejected', 'expired')
      ) then raise exception 'valid matching provenance source required' using errcode = '23503'; end if;
      v_status := (p_command #>> '{payload,verificationStatus}')::public.verification_status;
      if v_status = 'verified' and not exists (
        select 1 from public.sources s where s.id = v_source_id
          and s.usage_rights_status = 'approved'
          and s.provenance_verification_status = 'verified'
      ) then raise exception 'verified assertion requires approved verified provenance' using errcode = '23514'; end if;
      insert into public.source_assertions (
        source_id, subject_kind, subject_id, field_key, claimed_value,
        verification_status, confidence, observed_at, effective_from, expires_at,
        recheck_at, reviewer_id, evidence_notes
      ) values (
        v_source_id, v_kind, v_subject_id, p_command #>> '{payload,fieldKey}',
        p_command #> '{payload,claimedValue}', v_status,
        (p_command #>> '{payload,confidence}')::numeric,
        (p_command #>> '{payload,observedAt}')::timestamptz,
        (p_command #>> '{payload,effectiveFrom}')::timestamptz,
        (p_command #>> '{payload,expiresAt}')::timestamptz,
        (p_command #>> '{payload,recheckAt}')::timestamptz,
        case when v_status = 'verified' then v_admin.id else null end,
        p_command #>> '{payload,notes}'
      ) returning id into v_result_id;
      if v_kind in ('place', 'emergency_service') then insert into public.place_assertions values (v_subject_id, v_result_id);
      elsif v_kind = 'food_specialty' then insert into public.food_specialty_assertions values (v_subject_id, v_result_id);
      else insert into public.event_assertions values (v_subject_id, v_result_id); end if;

    elsif v_action = 'create_translation' then
      if p_command #>> '{payload,locale}' not in ('en','th','zh-CN','ja','ko','fr','de','es','ru')
        or p_command #>> '{payload,sourceLocale}' not in ('en','th','zh-CN','ja','ko','fr','de','es','ru')
      then raise exception 'unsupported locale' using errcode = '23514'; end if;
      if v_kind in ('place', 'emergency_service') then
        insert into public.place_translations (place_id, language_code, name, short_description, long_description, instructions, warnings, accessibility_information, source_language_code, machine_generated, translation_status, publication_status, reviewer_id, reviewed_at)
        values (v_subject_id, p_command #>> '{payload,locale}', p_command #>> '{payload,name}', p_command #>> '{payload,shortDescription}', p_command #>> '{payload,longDescription}', p_command #>> '{payload,instructions}', p_command #>> '{payload,warnings}', p_command #>> '{payload,accessibilityInformation}', p_command #>> '{payload,sourceLocale}', (p_command #>> '{payload,machineGenerated}')::boolean, p_command #>> '{payload,reviewStatus}', 'draft', case when p_command #>> '{payload,reviewStatus}' = 'reviewed' then v_admin.id else null end, case when p_command #>> '{payload,reviewStatus}' = 'reviewed' then v_now else null end) returning id into v_result_id;
      elsif v_kind = 'food_specialty' then
        insert into public.food_specialty_translations (food_specialty_id, language_code, name, short_description, long_description, instructions, warnings, accessibility_information, source_language_code, machine_generated, translation_status, publication_status, reviewer_id, reviewed_at)
        values (v_subject_id, p_command #>> '{payload,locale}', p_command #>> '{payload,name}', p_command #>> '{payload,shortDescription}', p_command #>> '{payload,longDescription}', p_command #>> '{payload,instructions}', p_command #>> '{payload,warnings}', p_command #>> '{payload,accessibilityInformation}', p_command #>> '{payload,sourceLocale}', (p_command #>> '{payload,machineGenerated}')::boolean, p_command #>> '{payload,reviewStatus}', 'draft', case when p_command #>> '{payload,reviewStatus}' = 'reviewed' then v_admin.id else null end, case when p_command #>> '{payload,reviewStatus}' = 'reviewed' then v_now else null end) returning id into v_result_id;
      else
        insert into public.event_translations (event_id, language_code, name, short_description, long_description, instructions, warnings, accessibility_information, source_language_code, machine_generated, translation_status, publication_status, reviewer_id, reviewed_at)
        values (v_subject_id, p_command #>> '{payload,locale}', p_command #>> '{payload,name}', p_command #>> '{payload,shortDescription}', p_command #>> '{payload,longDescription}', p_command #>> '{payload,instructions}', p_command #>> '{payload,warnings}', p_command #>> '{payload,accessibilityInformation}', p_command #>> '{payload,sourceLocale}', (p_command #>> '{payload,machineGenerated}')::boolean, p_command #>> '{payload,reviewStatus}', 'draft', case when p_command #>> '{payload,reviewStatus}' = 'reviewed' then v_admin.id else null end, case when p_command #>> '{payload,reviewStatus}' = 'reviewed' then v_now else null end) returning id into v_result_id;
      end if;

    elsif v_action = 'create_media' then
      if v_admin.role <> 'founder' then raise exception 'founder required for media rights' using errcode = '42501'; end if;
      if p_command #>> '{payload,dataClassification}' <> 'synthetic' then raise exception 'real-place media intake is disabled' using errcode = '23514'; end if;
      if (p_command #>> '{payload,aiGeneratedDecorative}')::boolean and ((p_command #>> '{payload,depictsRealPlace}')::boolean or p_command #>> '{payload,displayContext}' = 'documentary_gallery') then raise exception 'AI media cannot represent a real place' using errcode = '23514'; end if;
      v_source_id := (p_command #>> '{payload,sourceId}')::uuid;
      v_license_id := (p_command #>> '{payload,licenseId}')::uuid;
      if not exists (
        select 1 from public.sources s join public.licenses l on l.id = s.license_id
        where s.id = v_source_id and l.id = v_license_id
          and s.source_url = p_command #>> '{payload,sourceUrl}'
          and s.owner_name = p_command #>> '{payload,rightsHolder}'
          and l.rights_holder = p_command #>> '{payload,rightsHolder}'
          and l.license_category = p_command #>> '{payload,licenseType}'
          and l.terms_url = p_command #>> '{payload,licenseUrl}'
          and l.attribution_text = p_command #>> '{payload,attribution}'
          and s.usage_rights_status = 'approved' and s.ownership_status <> 'unclear'
          and s.provenance_verification_status = 'verified'
          and l.approval_status = 'approved' and l.storage_permitted
          and (l.expires_at is null or l.expires_at > v_now)
      ) then raise exception 'approved verified media rights required' using errcode = '23514'; end if;
      if p_command #>> '{payload,rightsStatus}' <> 'approved' then raise exception 'unclear media rights cannot enter the asset catalog' using errcode = '23514'; end if;
      insert into public.media_assets (asset_type, storage_key, depicts_real_place, creator_name, rights_holder, license_id, source_id, acquired_at, publication_status, data_classification, ai_generated_decorative, approved_display_contexts)
      values (p_command #>> '{payload,assetType}', p_command #>> '{payload,storageKey}', (p_command #>> '{payload,depictsRealPlace}')::boolean, p_command #>> '{payload,creatorName}', p_command #>> '{payload,rightsHolder}', v_license_id, v_source_id, (p_command #>> '{payload,verifiedAt}')::timestamptz, 'draft', 'synthetic', (p_command #>> '{payload,aiGeneratedDecorative}')::boolean, array[p_command #>> '{payload,displayContext}']) returning id into v_result_id;
      insert into public.place_media (place_id, media_asset_id, display_context, display_order) values (v_subject_id, v_result_id, p_command #>> '{payload,displayContext}', 0);

    elsif v_action = 'create_verification' then
      v_assertion_id := (p_command #>> '{payload,assertionId}')::uuid;
      if not exists (select 1 from public.source_assertions a where a.id = v_assertion_id and a.subject_id = v_subject_id and a.subject_kind = v_kind)
      then raise exception 'verification assertion does not belong to subject' using errcode = '23503'; end if;
      v_status := (p_command #>> '{payload,status}')::public.verification_status;
      if v_status = 'verified' and p_command #>> '{payload,verifiedAt}' is null then raise exception 'verified status requires verification date' using errcode = '23514'; end if;
      if (p_command #>> '{payload,verifiedAt}')::timestamptz > v_now then raise exception 'verification date cannot be in the future' using errcode = '23514'; end if;
      if v_is_emergency and (p_command #>> '{payload,staleAt}' is null or (p_command #>> '{payload,staleAt}')::timestamptz <= v_now)
      then raise exception 'emergency verification requires future freshness boundary' using errcode = '23514'; end if;
      insert into public.verifications (verification_type, status, reviewer_id, verified_at, next_review_at, stale_at, evidence_assertion_id, notes)
      values (p_command #>> '{payload,verificationType}', v_status, v_admin.id, (p_command #>> '{payload,verifiedAt}')::timestamptz, (p_command #>> '{payload,nextReviewAt}')::timestamptz, (p_command #>> '{payload,staleAt}')::timestamptz, v_assertion_id, p_command #>> '{payload,notes}') returning id into v_result_id;
      if v_kind in ('place', 'emergency_service') then insert into public.place_verifications values (v_subject_id, v_result_id);
      elsif v_kind = 'food_specialty' then insert into public.food_specialty_verifications values (v_subject_id, v_result_id);
      else insert into public.event_verifications values (v_subject_id, v_result_id); end if;
      if v_status = 'verified' then
        if v_kind in ('place', 'emergency_service') then update public.places set verification_status = 'verified' where id = v_subject_id;
        elsif v_kind = 'food_specialty' then update public.food_specialties set verification_status = 'verified' where id = v_subject_id;
        else update public.events set verification_status = 'verified' where id = v_subject_id; end if;
      end if;
    else raise exception 'unsupported evidence action' using errcode = '22023'; end if;
  end if;

  insert into public.audit_events (actor_admin_id, action, subject_table, subject_id, after_summary, request_correlation_id, data_classification)
  values (v_admin.id, 'evidence.' || v_action, coalesce(v_kind, 'source'), coalesce(v_subject_id, v_result_id), jsonb_build_object('resultId', v_result_id, 'status', coalesce(p_command #>> '{payload,status}', p_command #>> '{payload,verificationStatus}', p_command #>> '{payload,reviewStatus}', 'created')), p_correlation_id, v_subject_classification);
  return jsonb_build_object('id', v_result_id, 'action', v_action, 'kind', coalesce(v_kind, 'source'));
end;
$$;

revoke all on function public.admin_evidence_mutate(jsonb, uuid) from public, anon;
grant execute on function public.admin_evidence_mutate(jsonb, uuid) to authenticated;

comment on function public.admin_evidence_mutate is
  'Atomic M1 provenance, assertion, translation, media-rights, and verification mutations. Client identities and roles are never authoritative.';
