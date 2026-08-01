-- Phase 3B synthetic/local test data only.
-- "real" classification rows below exercise production-safe filters while remaining explicitly
-- fictional. They are not verified facts and must never be copied into a public environment.

insert into public.admin_users (id, auth_subject, role, active)
values (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000099',
  'founder',
  true
)
on conflict (id) do nothing;

insert into public.geographies (
  id, parent_id, geography_type, canonical_thai_name, default_english_name,
  normalized_name, data_classification, status
)
values
  (
    '20000000-0000-4000-8000-000000000001', null, 'country',
    'ประเทศทดสอบเท่านั้น', 'Test-Only Fictional Thailand',
    'test only fictional thailand', 'synthetic', 'draft'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'province', 'จังหวัดสมมติสำหรับทดสอบ', 'Clearly Fictional Test Province',
    'clearly fictional test province', 'synthetic', 'draft'
  ),
  (
    '20000000-0000-4000-8000-000000000003', null, 'country',
    'ประเทศทดสอบเส้นทางจริง', 'Test-Only Real-Path Country',
    'test only real path country', 'real', 'draft'
  )
on conflict (id) do nothing;

insert into public.destinations (
  id, geography_id, name, normalized_name, activation_status, data_classification
)
values
  (
    '21000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'TEST DATA — Fictional Lantern Valley',
    'test data fictional lantern valley',
    'ready',
    'synthetic'
  ),
  (
    '21000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000003',
    'TEST DATA — Real-Classification Path',
    'test data real classification path',
    'ready',
    'real'
  )
on conflict (id) do nothing;

insert into public.licenses (
  id, name, rights_holder, license_category, terms_url, commercial_use_permitted,
  modification_permitted, storage_permitted, redistribution_permitted,
  attribution_required, attribution_text, expires_at, evidence_reference,
  approval_status, data_classification
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    'TEST DATA — Synthetic Internal License',
    'Fictional Test Rights Holder',
    'internal_test',
    'https://license.example.test/terms',
    false, true, true, false, true,
    'TEST DATA — Not for public use',
    null,
    'https://license.example.test/evidence',
    'approved',
    'synthetic'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'TEST DATA — Expired Image License',
    'Fictional Expired Rights Holder',
    'internal_test',
    'https://expired-license.example.test/terms',
    false, false, true, false, true,
    'TEST DATA — Expired',
    '2020-01-01T00:00:00Z',
    'https://expired-license.example.test/evidence',
    'expired',
    'synthetic'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'TEST DATA — Real-Path Rights',
    'Fictional Real-Path Rights Holder',
    'internal_test',
    'https://real-path-license.example.test/terms',
    true, false, true, false, true,
    'TEST DATA — Fictional real-classification test only',
    null,
    'https://real-path-license.example.test/evidence',
    'approved',
    'real'
  )
on conflict (id) do nothing;

insert into public.sources (
  id, source_type, owner_name, title, source_url, accessed_at,
  usage_rights_status, license_id, evidence_notes, data_classification
)
values
  (
    '31000000-0000-4000-8000-000000000001',
    'synthetic_test',
    'Fictional Test Source Owner',
    'TEST DATA — Synthetic Catalog Source',
    'https://catalog.example.test/source',
    '2026-01-01T00:00:00Z',
    'approved',
    '30000000-0000-4000-8000-000000000001',
    'Invented solely for repeatable local tests.',
    'synthetic'
  ),
  (
    '31000000-0000-4000-8000-000000000002',
    'first_party',
    'Fictional Real-Path Source Owner',
    'TEST DATA — Real Classification Filter Source',
    'https://real-path.example.test/source',
    '2026-01-01T00:00:00Z',
    'approved',
    '30000000-0000-4000-8000-000000000003',
    'Fictional record exercising the real-classification path.',
    'real'
  )
on conflict (id) do nothing;

insert into public.places (
  id, destination_id, geography_id, canonical_thai_name, default_english_name,
  normalized_search_name, address_summary, latitude, longitude, place_category,
  operating_status, publication_status, verification_status, data_classification,
  last_checked_at, stale_at, suppressed_at, suppression_reason
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '21000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'ร้านอาหารสมมติ ห้ามเผยแพร่',
    'TEST DATA — Fictional Tamarind Table',
    'test data fictional tamarind table',
    'TEST DATA, Example Lane, Fictional Province',
    0.100001, 0.100001, 'restaurant', 'operating',
    'approved', 'verified', 'synthetic',
    '2026-01-01T00:00:00Z', '2099-01-01T00:00:00Z', null, null
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '21000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'สถานที่สมมติ ห้ามเผยแพร่',
    'TEST DATA — Imaginary Paper Garden',
    'test data imaginary paper garden',
    'TEST DATA, Invalid Road, Fictional Province',
    0.200001, 0.200001, 'attraction', 'operating',
    'draft', 'pending', 'synthetic',
    null, null, null, null
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    '21000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'ศูนย์ช่วยเหลือสมมติ ห้ามโทร',
    'TEST DATA — Non-Callable Assistance Point',
    'test data non callable assistance point',
    'TEST DATA, Nowhere Avenue, Fictional Province',
    0.300001, 0.300001, 'emergency_service', 'unknown',
    'suppressed', 'suppressed', 'synthetic',
    '2020-01-01T00:00:00Z', '2020-01-02T00:00:00Z',
    '2020-01-02T00:00:00Z', 'TEST DATA — stale and intentionally suppressed'
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    '21000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000003',
    'สถานที่ทดสอบเส้นทางจริง',
    'TEST DATA — Fictional Real-Classification Place',
    'test data fictional real classification place',
    'TEST DATA, Reserved Example Address',
    0.400001, 0.400001, 'attraction', 'operating',
    'approved', 'verified', 'real',
    '2026-01-01T00:00:00Z', '2099-01-01T00:00:00Z', null, null
  )
on conflict (id) do nothing;

insert into public.restaurant_profiles (
  place_id, cuisine_categories, price_range, dietary_information, service_modes, reservation_requirement
)
values (
  '40000000-0000-4000-8000-000000000001',
  array['fictional_test_cuisine'], 1, array['TEST DATA'], array['dine_in'], 'not_required'
)
on conflict (place_id) do nothing;

insert into public.attraction_profiles (place_id, attraction_categories, recommended_visit_minutes)
values
  ('40000000-0000-4000-8000-000000000002', array['fictional_test'], 30),
  ('40000000-0000-4000-8000-000000000004', array['fictional_real_path_test'], 15)
on conflict (place_id) do nothing;

insert into public.food_specialties (
  id, canonical_thai_name, normalized_name, category, dietary_notes, allergen_notes,
  publication_status, verification_status, data_classification
)
values (
  '41000000-0000-4000-8000-000000000001',
  'อาหารสมมติสำหรับทดสอบ',
  'test data fictional cloud noodles',
  'fictional_test',
  'TEST DATA only',
  'No real allergen claim',
  'approved',
  'verified',
  'synthetic'
)
on conflict (id) do nothing;

insert into public.restaurant_food_specialties (restaurant_place_id, food_specialty_id)
values (
  '40000000-0000-4000-8000-000000000001',
  '41000000-0000-4000-8000-000000000001'
)
on conflict do nothing;

insert into public.events (
  id, destination_id, canonical_thai_name, normalized_name, event_category,
  publication_status, verification_status, data_classification
)
values (
  '42000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  'งานสมมติสำหรับทดสอบ',
  'test data fictional folded paper festival',
  'fictional_test',
  'approved',
  'verified',
  'synthetic'
)
on conflict (id) do nothing;

insert into public.event_occurrences (
  id, event_id, destination_id, venue_place_id, starts_at, ends_at,
  occurrence_status, cancellation_reason, publication_status, verification_status
)
values (
  '42100000-0000-4000-8000-000000000001',
  '42000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '2030-01-01T10:00:00Z',
  '2030-01-01T12:00:00Z',
  'cancelled',
  'TEST DATA — cancellation fixture',
  'approved',
  'verified'
)
on conflict (id) do nothing;

insert into public.source_assertions (
  id, source_id, subject_kind, subject_id, field_key, claimed_value,
  verification_status, confidence, observed_at, expires_at, reviewer_id, evidence_notes
)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000002',
    'place',
    '40000000-0000-4000-8000-000000000004',
    'identity',
    '{"test_data": true, "claim": "fictional real-path identity"}',
    'verified',
    1,
    '2026-01-01T00:00:00Z',
    '2099-01-01T00:00:00Z',
    '10000000-0000-4000-8000-000000000001',
    'TEST DATA only'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '31000000-0000-4000-8000-000000000001',
    'emergency_service',
    '40000000-0000-4000-8000-000000000003',
    'contact',
    '{"value": "NOT-CALLABLE-TEST"}',
    'expired',
    0,
    '2020-01-01T00:00:00Z',
    '2020-01-02T00:00:00Z',
    '10000000-0000-4000-8000-000000000001',
    'Deliberately stale and non-callable.'
  )
on conflict (id) do nothing;

insert into public.place_assertions (place_id, assertion_id)
values (
  '40000000-0000-4000-8000-000000000004',
  '50000000-0000-4000-8000-000000000001'
)
on conflict do nothing;

insert into public.verifications (
  id, verification_type, status, reviewer_id, verified_at, next_review_at,
  stale_at, evidence_assertion_id, notes
)
values (
  '51000000-0000-4000-8000-000000000003',
  'fictional_real_path_place',
  'verified',
  '10000000-0000-4000-8000-000000000001',
  '2026-01-01T00:00:00Z',
  '2098-01-01T00:00:00Z',
  '2099-01-01T00:00:00Z',
  '50000000-0000-4000-8000-000000000001',
  'TEST DATA — real-classification path only'
)
on conflict (id) do nothing;

insert into public.place_verifications (place_id, verification_id)
values (
  '40000000-0000-4000-8000-000000000004',
  '51000000-0000-4000-8000-000000000003'
)
on conflict do nothing;

update public.places
set publication_status = 'published'
where id = '40000000-0000-4000-8000-000000000004'
  and publication_status <> 'published';

insert into public.verifications (
  id, verification_type, status, reviewer_id, verified_at, next_review_at,
  stale_at, evidence_assertion_id, notes
)
values
  (
    '51000000-0000-4000-8000-000000000001',
    'synthetic_emergency_primary',
    'verified',
    '10000000-0000-4000-8000-000000000001',
    '2020-01-01T00:00:00Z',
    '2020-01-02T00:00:00Z',
    '2020-01-02T00:00:00Z',
    '50000000-0000-4000-8000-000000000002',
    'TEST DATA — stale verification'
  ),
  (
    '51000000-0000-4000-8000-000000000002',
    'synthetic_emergency_secondary',
    'verified',
    '10000000-0000-4000-8000-000000000001',
    '2020-01-01T00:00:00Z',
    '2020-01-02T00:00:00Z',
    '2020-01-02T00:00:00Z',
    '50000000-0000-4000-8000-000000000002',
    'TEST DATA — secondary stale verification'
  )
on conflict (id) do nothing;

insert into public.contact_methods (
  id, place_id, contact_type, display_value, normalized_value,
  publication_permitted, verification_status, source_assertion_id, last_checked_at
)
values (
  '52000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000003',
  'phone',
  'NOT-CALLABLE-TEST',
  'not-callable-test',
  false,
  'expired',
  '50000000-0000-4000-8000-000000000002',
  '2020-01-01T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.emergency_service_profiles (
  place_id, official_thai_name, reviewed_english_name, emergency_category,
  authoritative_source_id, primary_verification_id, secondary_verification_id,
  verified_phone_contact_id, operating_status, verified_at, next_verification_at,
  stale_at, suppression_status, suppression_reason, safety_reviewer_id, incident_notes
)
values (
  '40000000-0000-4000-8000-000000000003',
  'ศูนย์ช่วยเหลือสมมติ ห้ามโทร',
  'TEST DATA — Non-Callable Assistance Point',
  'tourist_assistance',
  '31000000-0000-4000-8000-000000000001',
  '51000000-0000-4000-8000-000000000001',
  '51000000-0000-4000-8000-000000000002',
  '52000000-0000-4000-8000-000000000001',
  'unknown',
  '2020-01-01T00:00:00Z',
  '2020-01-02T00:00:00Z',
  '2020-01-02T00:00:00Z',
  'fully_suppressed',
  'TEST DATA — stale and non-callable',
  '10000000-0000-4000-8000-000000000001',
  'TEST DATA only'
)
on conflict (place_id) do nothing;

insert into public.media_assets (
  id, asset_type, storage_key, depicts_real_place, creator_name, rights_holder,
  license_id, source_id, acquired_at, expires_at, publication_status,
  takedown_status, data_classification, ai_generated_decorative, approved_display_contexts
)
values (
  '60000000-0000-4000-8000-000000000001',
  'illustration',
  'synthetic/test-expired-decoration.png',
  false,
  'Fictional Test Creator',
  'Fictional Expired Rights Holder',
  '30000000-0000-4000-8000-000000000002',
  '31000000-0000-4000-8000-000000000001',
  '2019-01-01T00:00:00Z',
  '2020-01-01T00:00:00Z',
  'suppressed',
  'removed',
  'synthetic',
  true,
  array['decorative']
)
on conflict (id) do nothing;

insert into public.traveler_sessions (
  id, session_secret_hash, locale, destination_id, privacy_consent_state,
  data_classification, created_at, last_activity_at, expires_at
)
values
  (
    '70000000-0000-4000-8000-000000000001',
    encode(extensions.digest('synthetic-session-secret-alpha', 'sha256'), 'hex'),
    'en',
    '21000000-0000-4000-8000-000000000001',
    '{"analytics": false}',
    'synthetic',
    '2026-01-01T00:00:00Z',
    '2026-01-01T00:00:00Z',
    '2099-01-01T00:00:00Z'
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    encode(extensions.digest('synthetic-session-secret-beta', 'sha256'), 'hex'),
    'th',
    '21000000-0000-4000-8000-000000000001',
    '{"analytics": false}',
    'synthetic',
    '2026-01-01T00:00:00Z',
    '2026-01-01T00:00:00Z',
    '2099-01-01T00:00:00Z'
  )
on conflict (id) do nothing;

insert into public.trips (
  id, traveler_session_id, title, start_date, end_date, notes, data_classification
)
values (
  '71000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  'TEST DATA — Fictional Solo Trip',
  '2030-01-01',
  '2030-01-02',
  'Synthetic ownership fixture',
  'synthetic'
)
on conflict (id) do nothing;

insert into public.itinerary_days (id, trip_id, planned_date, day_order, notes)
values (
  '72000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  '2030-01-01',
  0,
  'TEST DATA'
)
on conflict (id) do nothing;

insert into public.itinerary_items (
  id, itinerary_day_id, item_order, place_id, notes, item_status,
  ai_generated, traveler_modified_at, data_classification
)
values (
  '73000000-0000-4000-8000-000000000001',
  '72000000-0000-4000-8000-000000000001',
  0,
  '40000000-0000-4000-8000-000000000001',
  'TEST DATA',
  'confirmed',
  true,
  '2026-01-01T00:00:00Z',
  'synthetic'
)
on conflict (id) do nothing;

insert into public.saved_places (id, traveler_session_id, place_id, trip_id, note)
values (
  '74000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  'TEST DATA'
)
on conflict (id) do nothing;

insert into public.ai_usage_records (
  id, traveler_session_id, trip_id, request_category, model_identifier,
  requested_at, status, input_unit_estimate, output_unit_estimate,
  estimated_cost, quota_bucket, retention_expires_at, data_classification
)
values (
  '75000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  'itinerary_test',
  'provider-neutral-test-model',
  '2026-01-01T00:00:00Z',
  'completed',
  100,
  50,
  0.001,
  'synthetic-daily',
  '2026-02-01T00:00:00Z',
  'synthetic'
)
on conflict (id) do nothing;

insert into public.incorrect_information_reports (
  id, reporter_session_id, place_id, category, description,
  report_status, priority, data_classification
)
values (
  '76000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  'synthetic_test',
  'TEST DATA — invented correction report',
  'open',
  'normal',
  'synthetic'
)
on conflict (id) do nothing;
