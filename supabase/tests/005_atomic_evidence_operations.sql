begin;

insert into public.admin_users (id, auth_subject, role, active) values
  ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000098','editor',true),
  ('10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000097','editor',false)
on conflict (id) do update set active = excluded.active, role = excluded.role;

set local role authenticated;

do $test$
begin
  begin
    perform public.admin_evidence_mutate('{"action":"unsupported"}'::jsonb, '91000000-0000-4000-8000-000000000001');
    raise exception 'unauthorized evidence mutation succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$test$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000097', true);
do $test$
begin
  begin
    perform public.admin_evidence_mutate('{"action":"unsupported"}'::jsonb, '91000000-0000-4000-8000-000000000002');
    raise exception 'inactive admin evidence mutation succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$test$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000098', true);
do $test$
begin
  begin
    perform public.admin_evidence_mutate('{"action":"create_source","payload":{}}'::jsonb, '91000000-0000-4000-8000-000000000003');
    raise exception 'editor created founder-only provenance rights';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.sources set title = 'bypass' where id = '31000000-0000-4000-8000-000000000001';
    raise exception 'direct source write privilege was restored';
  exception when insufficient_privilege then null;
  end;
end;
$test$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000099', true);

do $test$
declare result jsonb; source_id uuid; assertion_id uuid; verification_id uuid; reviewer uuid; audit_actor uuid; audit_class public.data_classification;
  license_count integer;
begin
  result := public.admin_evidence_mutate(
    '{"action":"create_source","payload":{"sourceType":"synthetic_test","publisher":"Fictional Closure Publisher","title":"TEST M1 Closure Source","sourceUrl":"https://closure.example.test/source","retrievedAt":"2026-08-01T00:00:00Z","ownershipStatus":"owned","rightsStatus":"approved","verificationStatus":"verified","verifiedAt":"2026-08-01T00:00:00Z","evidenceLocator":"TEST-CLOSURE-EVIDENCE","notes":"synthetic only","dataClassification":"synthetic","license":{"name":"Closure Test License","rightsHolder":"Fictional Closure Publisher","category":"internal_test","termsUrl":"https://closure.example.test/terms","commercialUsePermitted":false,"modificationPermitted":true,"storagePermitted":true,"redistributionPermitted":false,"attributionRequired":true,"attributionText":"TEST ONLY","approvalStatus":"approved"}}}'::jsonb,
    '91000000-0000-4000-8000-000000000004'
  );
  source_id := (result ->> 'id')::uuid;

  result := public.admin_evidence_mutate(
    jsonb_build_object('action','create_assertion','kind','place','id','40000000-0000-4000-8000-000000000001','payload',jsonb_build_object('sourceId',source_id,'fieldKey','identity','claimedValue',jsonb_build_object('test',true),'verificationStatus','verified')),
    '91000000-0000-4000-8000-000000000005'
  );
  assertion_id := (result ->> 'id')::uuid;

  result := public.admin_evidence_mutate(
    jsonb_build_object('action','create_verification','kind','place','id','40000000-0000-4000-8000-000000000001','payload',jsonb_build_object('assertionId',assertion_id,'verificationType','identity','status','verified','verifiedAt','2026-08-01T00:00:00Z','staleAt','2099-01-01T00:00:00Z','reviewerId','00000000-0000-0000-0000-000000000000')),
    '91000000-0000-4000-8000-000000000006'
  );
  verification_id := (result ->> 'id')::uuid;
  select reviewer_id into reviewer from public.verifications where id = verification_id;
  if reviewer <> '10000000-0000-4000-8000-000000000001' then raise exception 'client spoofed verifier identity'; end if;

  select actor_admin_id, data_classification into audit_actor, audit_class from public.audit_events
  where request_correlation_id = '91000000-0000-4000-8000-000000000006';
  if audit_actor <> reviewer or audit_class <> 'synthetic' then raise exception 'evidence audit identity or classification is incorrect'; end if;

  begin
    perform public.admin_evidence_mutate(
      jsonb_build_object('action','create_verification','kind','event','id','42000000-0000-4000-8000-000000000001','payload',jsonb_build_object('assertionId',assertion_id,'verificationType','identity','status','pending')),
      '91000000-0000-4000-8000-000000000007'
    );
    raise exception 'mismatched or cross-subject workflow unexpectedly succeeded';
  exception when foreign_key_violation then null;
  end;

  begin
    perform public.admin_evidence_mutate(
      jsonb_build_object('action','create_media','kind','place','id','40000000-0000-4000-8000-000000000001','payload',jsonb_build_object('sourceId',source_id,'licenseId',(select license_id from public.sources where id=source_id),'rightsStatus','unclear','dataClassification','synthetic')),
      '91000000-0000-4000-8000-000000000008'
    );
    raise exception 'unclear media rights unexpectedly succeeded';
  exception when check_violation then null;
  end;
  if exists (select 1 from public.audit_events where request_correlation_id = '91000000-0000-4000-8000-000000000008') then raise exception 'failed media mutation committed an audit event'; end if;

  begin
    perform public.admin_evidence_mutate(
      jsonb_build_object('action','create_assertion','kind','place','id','40000000-0000-4000-8000-000000000001','payload',jsonb_build_object('sourceId','00000000-0000-4000-8000-000000000404','fieldKey','identity','claimedValue','{}'::jsonb,'verificationStatus','pending')),
      '91000000-0000-4000-8000-000000000009'
    );
    raise exception 'assertion without provenance unexpectedly succeeded';
  exception when foreign_key_violation then null;
  end;

  select count(*) into license_count from public.licenses;
  begin
    perform public.admin_evidence_mutate(
      '{"action":"create_source","payload":{"sourceType":"invalid_after_license_insert","publisher":"Rollback Publisher","title":"Rollback Source","sourceUrl":"https://rollback.example.test/source","retrievedAt":"2026-08-01T00:00:00Z","ownershipStatus":"owned","rightsStatus":"pending","verificationStatus":"pending","evidenceLocator":"ROLLBACK","dataClassification":"synthetic","license":{"name":"Rollback License","rightsHolder":"Rollback Publisher","category":"internal_test","termsUrl":"https://rollback.example.test/terms","commercialUsePermitted":false,"modificationPermitted":false,"storagePermitted":true,"redistributionPermitted":false,"attributionRequired":false,"approvalStatus":"proposed"}}}'::jsonb,
      '91000000-0000-4000-8000-000000000010'
    );
    raise exception 'invalid source unexpectedly succeeded';
  exception when check_violation then null;
  end;
  if (select count(*) from public.licenses) <> license_count then raise exception 'failed source mutation did not roll back license insert'; end if;
  if exists (select 1 from public.audit_events where request_correlation_id = '91000000-0000-4000-8000-000000000010') then raise exception 'failed source mutation committed an audit event'; end if;
end;
$test$;

rollback;
