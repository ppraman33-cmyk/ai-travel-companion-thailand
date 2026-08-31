export const CHIANG_MAI_PROVINCE_CODE = "50" as const;
export const CHIANG_MAI_PROVINCE_IDENTIFIER = "TH-50" as const;
export const CHIANG_MAI_EVIDENCE_RETRIEVED_ON = "2026-08-01" as const;

export type EvidenceState = "verified" | "evidence-pending" | "coverage-gap";

export interface EvidenceSource {
  readonly id: string;
  readonly tier: "primary" | "supporting";
  readonly publisher: string;
  readonly title: string;
  readonly url: `https://${string}`;
  readonly retrievedOn: string;
  readonly rightsStatus: "facts-only-media-rights-pending";
}

export const chiangMaiSources = [
  {
    id: "dopa-district-code-register-2025",
    tier: "primary",
    publisher: "Department of Provincial Administration",
    title: "Official agency and district code register",
    url: "https://multi.dopa.go.th/finance/assets/modules/news/uploads/6e646c629a15e48b1c501a3a87882a8367612a6a65a55610888295310807263.pdf",
    retrievedOn: CHIANG_MAI_EVIDENCE_RETRIEVED_ON,
    rightsStatus: "facts-only-media-rights-pending",
  },
  {
    id: "chiang-mai-administration-2024",
    tier: "primary",
    publisher: "Chiang Mai Provincial Office",
    title: "Chiang Mai provincial administrative summary",
    url: "https://www.chiangmai.go.th/managing/public/D2/2D25Apr2024125440.pdf",
    retrievedOn: CHIANG_MAI_EVIDENCE_RETRIEVED_ON,
    rightsStatus: "facts-only-media-rights-pending",
  },
  {
    id: "ku-standard-district-register-2019",
    tier: "supporting",
    publisher: "Kasetsart University",
    title: "Thailand standard district reference table",
    url: "https://mis.ku.ac.th/Staff/Pichaya/view_table/index.php?table_name=REF_DISTRICT",
    retrievedOn: CHIANG_MAI_EVIDENCE_RETRIEVED_ON,
    rightsStatus: "facts-only-media-rights-pending",
  },
] as const satisfies readonly EvidenceSource[];

export interface ChiangMaiDistrictEvidence {
  readonly officialCode: `50${string}`;
  readonly canonicalId: `TH-50-${string}`;
  readonly thaiName: string;
  readonly englishName: string;
  readonly provinceCode: "50";
  readonly provinceIdentifier: "TH-50";
  readonly administrativePosition: string;
  readonly factualSummary: string;
  readonly verificationStatus: "verified";
  readonly sourceIds: readonly string[];
  readonly highlightStatus: "coverage-gap";
  readonly highlights: readonly never[];
  readonly coverageGaps: readonly string[];
  readonly publicationStatus: "evidence-pending";
  readonly mediaRightsStatus: "media-rights-pending";
}

const districtRows = [
  ["5001", "เมืองเชียงใหม่", "Mueang Chiang Mai"],
  ["5002", "จอมทอง", "Chom Thong"],
  ["5003", "แม่แจ่ม", "Mae Chaem"],
  ["5004", "เชียงดาว", "Chiang Dao"],
  ["5005", "ดอยสะเก็ด", "Doi Saket"],
  ["5006", "แม่แตง", "Mae Taeng"],
  ["5007", "แม่ริม", "Mae Rim"],
  ["5008", "สะเมิง", "Samoeng"],
  ["5009", "ฝาง", "Fang"],
  ["5010", "แม่อาย", "Mae Ai"],
  ["5011", "พร้าว", "Phrao"],
  ["5012", "สันป่าตอง", "San Pa Tong"],
  ["5013", "สันกำแพง", "San Kamphaeng"],
  ["5014", "สันทราย", "San Sai"],
  ["5015", "หางดง", "Hang Dong"],
  ["5016", "ฮอด", "Hot"],
  ["5017", "ดอยเต่า", "Doi Tao"],
  ["5018", "อมก๋อย", "Omkoi"],
  ["5019", "สารภี", "Saraphi"],
  ["5020", "เวียงแหง", "Wiang Haeng"],
  ["5021", "ไชยปราการ", "Chai Prakan"],
  ["5022", "แม่วาง", "Mae Wang"],
  ["5023", "แม่ออน", "Mae On"],
  ["5024", "ดอยหล่อ", "Doi Lo"],
  ["5025", "กัลยาณิวัฒนา", "Galyani Vadhana"],
] as const;

export const chiangMaiDistricts: readonly ChiangMaiDistrictEvidence[] =
  districtRows.map(([officialCode, thaiName, englishName]) => ({
    officialCode,
    canonicalId: `TH-50-${officialCode}`,
    thaiName,
    englishName,
    provinceCode: CHIANG_MAI_PROVINCE_CODE,
    provinceIdentifier: CHIANG_MAI_PROVINCE_IDENTIFIER,
    administrativePosition: `Official district ${officialCode} within Chiang Mai province (province code 50).`,
    factualSummary: `${englishName} is an official administrative district of Chiang Mai province, identified by district code ${officialCode}.`,
    verificationStatus: "verified",
    sourceIds: [
      "dopa-district-code-register-2025",
      "chiang-mai-administration-2024",
      "ku-standard-district-register-2019",
    ],
    highlightStatus: "coverage-gap",
    highlights: [],
    coverageGaps: [
      "No assertion-level local highlight has completed primary-source verification.",
      "No category inventory record has completed district and coordinate verification.",
      "Administrative boundary geometry has not been imported; the province relationship is verified.",
    ],
    publicationStatus: "evidence-pending",
    mediaRightsStatus: "media-rights-pending",
  }));

export const chiangMaiCategoryCoverage = [
  "attraction",
  "restaurant",
  "local_food",
  "event",
  "market",
  "activity",
  "emergency",
  "hospital",
  "police",
  "tourist_police",
  "rescue",
  "pharmacy_clinic",
  "transport_handoff",
  "community_producer",
] as const;

export function getChiangMaiCoverageSummary() {
  return {
    districtCount: chiangMaiDistricts.length,
    verifiedDistrictIdentities: chiangMaiDistricts.filter(
      (district) => district.verificationStatus === "verified",
    ).length,
    evidencePendingDistricts: chiangMaiDistricts.filter(
      (district) => district.publicationStatus === "evidence-pending",
    ).length,
    verifiedHighlights: chiangMaiDistricts.reduce(
      (count, district) => count + district.highlights.length,
      0,
    ),
    documentedCoverageGaps: chiangMaiDistricts.reduce(
      (count, district) => count + district.coverageGaps.length,
      0,
    ),
    primarySources: chiangMaiSources.filter((source) => source.tier === "primary")
      .length,
    supportingSources: chiangMaiSources.filter((source) => source.tier === "supporting")
      .length,
    publicationEligible: false,
  } as const;
}
