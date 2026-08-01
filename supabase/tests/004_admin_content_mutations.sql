begin;

insert into public.admin_users (id, auth_subject, role, active)
values (
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000098',
  'editor',
  true
)
on conflict (id) do update set active = true, role = 'editor';

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000098', true);

do $test$
begin
  begin
    update public.places set publication_status = 'published'
    where id = '40000000-0000-4000-8000-000000000002';
    raise exception 'authenticated editor retained a direct content-write bypass';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.admin_content_mutate(
      '{"action":"transition","kind":"place","id":"40000000-0000-4000-8000-000000000003","target":"evidence_pending"}'::jsonb,
      '90000000-0000-4000-8000-000000000001'
    );
    raise exception 'editor disguised an emergency record as an ordinary place';
  exception when check_violation then null;
  end;

  begin
    perform public.admin_content_mutate(
      '{"action":"transition","kind":"place","id":"40000000-0000-4000-8000-000000000002","target":"published"}'::jsonb,
      '90000000-0000-4000-8000-000000000002'
    );
    raise exception 'draft-to-published lifecycle bypass unexpectedly succeeded';
  exception when check_violation then null;
  end;

  begin
    perform public.admin_content_mutate(
      '{"action":"attach_assertion","kind":"place","id":"40000000-0000-4000-8000-000000000002","referenceId":"50000000-0000-4000-8000-000000000001"}'::jsonb,
      '90000000-0000-4000-8000-000000000003'
    );
    raise exception 'cross-subject assertion attachment unexpectedly succeeded';
  exception when foreign_key_violation then null;
  end;
end;
$test$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000099', true);

do $test$
declare
  result jsonb;
  audit_classification public.data_classification;
begin
  result := public.admin_content_mutate(
    '{
      "action":"create_place_draft",
      "payload":{
        "destinationId":"21000000-0000-4000-8000-000000000001",
        "geographyId":"20000000-0000-4000-8000-000000000002",
        "canonicalThaiName":"สถานที่ทดสอบ RPC",
        "normalizedSearchName":"rpc synthetic place",
        "addressSummary":"TEST DATA ONLY",
        "latitude":13.75,
        "longitude":100.50,
        "placeCategory":"other",
        "dataClassification":"synthetic"
      }
    }'::jsonb,
    '90000000-0000-4000-8000-000000000004'
  );

  select data_classification into audit_classification
  from public.audit_events
  where request_correlation_id = '90000000-0000-4000-8000-000000000004';
  if audit_classification <> 'synthetic' then
    raise exception 'audit classification did not preserve the subject classification';
  end if;
  if result ->> 'action' <> 'create_place_draft' then
    raise exception 'unexpected RPC result';
  end if;
end;
$test$;

rollback;
