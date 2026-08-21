export interface EvidenceRecord {
  id: string;
  districtCode: string;
  sourceIds: string[];
  assertions: Array<{ field: string; sourceId: string; status: string }>;
  rightsStatus: string;
  mediaRightsStatus: string;
  publicationEligibility: string;
  coordinates: null;
  openingHoursStatus: string;
  admissionStatus: string;
  accessibilityStatus: string;
  [key: string]: unknown;
}

export interface ChiangMaiAttractionEvidenceData {
  registry: { records: EvidenceRecord[]; [key: string]: unknown };
  sources: {
    sources: Array<{ id: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  coverage: {
    districts: Array<{
      code: string;
      coverageStatus: "partial" | "gap";
      recordIds: string[];
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  exclusions: { items: Array<Record<string, unknown>>; [key: string]: unknown };
  districts: Array<Record<string, unknown>>;
  subdistricts: Array<Record<string, unknown>>;
}

export function loadChiangMaiAttractions(
  scanRoot?: string,
): ChiangMaiAttractionEvidenceData;
export function validateChiangMaiAttractions(
  data: ChiangMaiAttractionEvidenceData,
): string[];
export function findChiangMaiAttractionRuntimeLeakage(scanRoot?: string): string[];
export function findProhibitedAttractionFiles(scanRoot?: string): string[];
