-- QUARANTINED EVIDENCE-PENDING FIXTURE — NOT A PRODUCTION-READY SEED.
-- Phase 4 controlled draft import: standardized identities for Thailand's 77 provinces.
-- These are real-world names but deliberately remain unpublished and unverified.
-- Run only after all migrations. Content activation requires approved sources, assertions,
-- translations, and verification through the Admin workflow.
-- This file is intentionally excluded from supabase/config.toml. It may be loaded only by
-- explicit non-production verification until an approved provenance package is attached.

insert into public.geographies (
  id, parent_id, geography_type, country_code, canonical_thai_name,
  default_english_name, normalized_name, official_code, slug, region_code,
  region_name, data_classification, status
)
values (
  '66000000-0000-4000-8000-000000000001', null, 'country', 'TH', 'ประเทศไทย',
  'Thailand', 'thailand', 'TH', 'thailand', null, null, 'real', 'draft'
)
on conflict (id) do update set
  canonical_thai_name = excluded.canonical_thai_name,
  default_english_name = excluded.default_english_name,
  normalized_name = excluded.normalized_name,
  official_code = excluded.official_code,
  slug = excluded.slug,
  updated_at = statement_timestamp();

with province(code, thai_name, english_name, slug, region_code, region_name) as (
  values
    ('TH-10','กรุงเทพมหานคร','Bangkok','bangkok','central','Central Thailand'),
    ('TH-11','สมุทรปราการ','Samut Prakan','samut-prakan','central','Central Thailand'),
    ('TH-12','นนทบุรี','Nonthaburi','nonthaburi','central','Central Thailand'),
    ('TH-13','ปทุมธานี','Pathum Thani','pathum-thani','central','Central Thailand'),
    ('TH-14','พระนครศรีอยุธยา','Phra Nakhon Si Ayutthaya','phra-nakhon-si-ayutthaya','central','Central Thailand'),
    ('TH-15','อ่างทอง','Ang Thong','ang-thong','central','Central Thailand'),
    ('TH-16','ลพบุรี','Lop Buri','lop-buri','central','Central Thailand'),
    ('TH-17','สิงห์บุรี','Sing Buri','sing-buri','central','Central Thailand'),
    ('TH-18','ชัยนาท','Chai Nat','chai-nat','central','Central Thailand'),
    ('TH-19','สระบุรี','Saraburi','saraburi','central','Central Thailand'),
    ('TH-20','ชลบุรี','Chon Buri','chon-buri','eastern','Eastern Thailand'),
    ('TH-21','ระยอง','Rayong','rayong','eastern','Eastern Thailand'),
    ('TH-22','จันทบุรี','Chanthaburi','chanthaburi','eastern','Eastern Thailand'),
    ('TH-23','ตราด','Trat','trat','eastern','Eastern Thailand'),
    ('TH-24','ฉะเชิงเทรา','Chachoengsao','chachoengsao','eastern','Eastern Thailand'),
    ('TH-25','ปราจีนบุรี','Prachin Buri','prachin-buri','eastern','Eastern Thailand'),
    ('TH-26','นครนายก','Nakhon Nayok','nakhon-nayok','eastern','Eastern Thailand'),
    ('TH-27','สระแก้ว','Sa Kaeo','sa-kaeo','eastern','Eastern Thailand'),
    ('TH-30','นครราชสีมา','Nakhon Ratchasima','nakhon-ratchasima','northeastern','Northeastern Thailand'),
    ('TH-31','บุรีรัมย์','Buri Ram','buri-ram','northeastern','Northeastern Thailand'),
    ('TH-32','สุรินทร์','Surin','surin','northeastern','Northeastern Thailand'),
    ('TH-33','ศรีสะเกษ','Si Sa Ket','si-sa-ket','northeastern','Northeastern Thailand'),
    ('TH-34','อุบลราชธานี','Ubon Ratchathani','ubon-ratchathani','northeastern','Northeastern Thailand'),
    ('TH-35','ยโสธร','Yasothon','yasothon','northeastern','Northeastern Thailand'),
    ('TH-36','ชัยภูมิ','Chaiyaphum','chaiyaphum','northeastern','Northeastern Thailand'),
    ('TH-37','อำนาจเจริญ','Amnat Charoen','amnat-charoen','northeastern','Northeastern Thailand'),
    ('TH-38','บึงกาฬ','Bueng Kan','bueng-kan','northeastern','Northeastern Thailand'),
    ('TH-39','หนองบัวลำภู','Nong Bua Lam Phu','nong-bua-lam-phu','northeastern','Northeastern Thailand'),
    ('TH-40','ขอนแก่น','Khon Kaen','khon-kaen','northeastern','Northeastern Thailand'),
    ('TH-41','อุดรธานี','Udon Thani','udon-thani','northeastern','Northeastern Thailand'),
    ('TH-42','เลย','Loei','loei','northeastern','Northeastern Thailand'),
    ('TH-43','หนองคาย','Nong Khai','nong-khai','northeastern','Northeastern Thailand'),
    ('TH-44','มหาสารคาม','Maha Sarakham','maha-sarakham','northeastern','Northeastern Thailand'),
    ('TH-45','ร้อยเอ็ด','Roi Et','roi-et','northeastern','Northeastern Thailand'),
    ('TH-46','กาฬสินธุ์','Kalasin','kalasin','northeastern','Northeastern Thailand'),
    ('TH-47','สกลนคร','Sakon Nakhon','sakon-nakhon','northeastern','Northeastern Thailand'),
    ('TH-48','นครพนม','Nakhon Phanom','nakhon-phanom','northeastern','Northeastern Thailand'),
    ('TH-49','มุกดาหาร','Mukdahan','mukdahan','northeastern','Northeastern Thailand'),
    ('TH-50','เชียงใหม่','Chiang Mai','chiang-mai','northern','Northern Thailand'),
    ('TH-51','ลำพูน','Lamphun','lamphun','northern','Northern Thailand'),
    ('TH-52','ลำปาง','Lampang','lampang','northern','Northern Thailand'),
    ('TH-53','อุตรดิตถ์','Uttaradit','uttaradit','northern','Northern Thailand'),
    ('TH-54','แพร่','Phrae','phrae','northern','Northern Thailand'),
    ('TH-55','น่าน','Nan','nan','northern','Northern Thailand'),
    ('TH-56','พะเยา','Phayao','phayao','northern','Northern Thailand'),
    ('TH-57','เชียงราย','Chiang Rai','chiang-rai','northern','Northern Thailand'),
    ('TH-58','แม่ฮ่องสอน','Mae Hong Son','mae-hong-son','northern','Northern Thailand'),
    ('TH-60','นครสวรรค์','Nakhon Sawan','nakhon-sawan','northern','Northern Thailand'),
    ('TH-61','อุทัยธานี','Uthai Thani','uthai-thani','northern','Northern Thailand'),
    ('TH-62','กำแพงเพชร','Kamphaeng Phet','kamphaeng-phet','northern','Northern Thailand'),
    ('TH-63','ตาก','Tak','tak','western','Western Thailand'),
    ('TH-64','สุโขทัย','Sukhothai','sukhothai','northern','Northern Thailand'),
    ('TH-65','พิษณุโลก','Phitsanulok','phitsanulok','northern','Northern Thailand'),
    ('TH-66','พิจิตร','Phichit','phichit','northern','Northern Thailand'),
    ('TH-67','เพชรบูรณ์','Phetchabun','phetchabun','northern','Northern Thailand'),
    ('TH-70','ราชบุรี','Ratchaburi','ratchaburi','western','Western Thailand'),
    ('TH-71','กาญจนบุรี','Kanchanaburi','kanchanaburi','western','Western Thailand'),
    ('TH-72','สุพรรณบุรี','Suphan Buri','suphan-buri','central','Central Thailand'),
    ('TH-73','นครปฐม','Nakhon Pathom','nakhon-pathom','central','Central Thailand'),
    ('TH-74','สมุทรสาคร','Samut Sakhon','samut-sakhon','central','Central Thailand'),
    ('TH-75','สมุทรสงคราม','Samut Songkhram','samut-songkhram','central','Central Thailand'),
    ('TH-76','เพชรบุรี','Phetchaburi','phetchaburi','western','Western Thailand'),
    ('TH-77','ประจวบคีรีขันธ์','Prachuap Khiri Khan','prachuap-khiri-khan','western','Western Thailand'),
    ('TH-80','นครศรีธรรมราช','Nakhon Si Thammarat','nakhon-si-thammarat','southern','Southern Thailand'),
    ('TH-81','กระบี่','Krabi','krabi','southern','Southern Thailand'),
    ('TH-82','พังงา','Phang Nga','phang-nga','southern','Southern Thailand'),
    ('TH-83','ภูเก็ต','Phuket','phuket','southern','Southern Thailand'),
    ('TH-84','สุราษฎร์ธานี','Surat Thani','surat-thani','southern','Southern Thailand'),
    ('TH-85','ระนอง','Ranong','ranong','southern','Southern Thailand'),
    ('TH-86','ชุมพร','Chumphon','chumphon','southern','Southern Thailand'),
    ('TH-90','สงขลา','Songkhla','songkhla','southern','Southern Thailand'),
    ('TH-91','สตูล','Satun','satun','southern','Southern Thailand'),
    ('TH-92','ตรัง','Trang','trang','southern','Southern Thailand'),
    ('TH-93','พัทลุง','Phatthalung','phatthalung','southern','Southern Thailand'),
    ('TH-94','ปัตตานี','Pattani','pattani','southern','Southern Thailand'),
    ('TH-95','ยะลา','Yala','yala','southern','Southern Thailand'),
    ('TH-96','นราธิวาส','Narathiwat','narathiwat','southern','Southern Thailand')
), inserted_geographies as (
  insert into public.geographies (
    id, parent_id, geography_type, country_code, canonical_thai_name,
    default_english_name, normalized_name, official_code, slug, region_code,
    region_name, data_classification, status
  )
  select
    md5('phase4-geography:' || code)::uuid,
    '66000000-0000-4000-8000-000000000001'::uuid,
    'province', 'TH', thai_name, english_name, lower(english_name), code, slug,
    region_code, region_name, 'real'::public.data_classification, 'draft'
  from province
  on conflict (country_code, official_code) where official_code is not null
  do update set
    canonical_thai_name = excluded.canonical_thai_name,
    default_english_name = excluded.default_english_name,
    normalized_name = excluded.normalized_name,
    slug = excluded.slug,
    region_code = excluded.region_code,
    region_name = excluded.region_name,
    updated_at = statement_timestamp()
  returning id, official_code, default_english_name, normalized_name, slug
)
insert into public.destinations (
  id, geography_id, name, normalized_name, slug, activation_status,
  data_classification, profile_verification_status,
  future_map_configuration
)
select
  md5('phase4-destination:' || official_code)::uuid,
  id,
  default_english_name,
  normalized_name,
  slug,
  'evidence_pending',
  'real'::public.data_classification,
  'unverified'::public.verification_status,
  '{"status":"coming_soon","provider":null}'::jsonb
from inserted_geographies
on conflict (geography_id, normalized_name, data_classification) do update set
  slug = excluded.slug,
  activation_status = case
    when public.destinations.activation_status = 'active' then 'active'
    else 'evidence_pending'
  end,
  future_map_configuration = excluded.future_map_configuration,
  updated_at = statement_timestamp();
