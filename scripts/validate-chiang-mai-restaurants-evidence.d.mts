export interface ChiangMaiRestaurantCoverageRecord {
  code: string;
  nameTh: string;
  nameEn: string;
  recordIds: string[];
  coverageStatus: "research_pending" | "partial" | "closed_below_target";
  gap: string;
}

export function loadChiangMaiRestaurantCoverage(scanRoot?: string): {
  registry: {
    status: string;
    publicationEligibility: string;
    records: Array<
      Record<string, unknown> & {
        id: string;
        districtCode: string;
        sourceIds: string[];
        assertions: Array<Record<string, unknown>>;
      }
    >;
  };
  sources: {
    status: string;
    publicationEligibility: string;
    sources: Array<Record<string, unknown> & { id: string }>;
  };
  coverage: {
    status: string;
    publicationEligibility: string;
    targetPerDistrict: number;
    targetIsQuota: boolean;
    districts: ChiangMaiRestaurantCoverageRecord[];
  };
  districts: Array<{
    code: string;
    nameTh: string;
    nameEn: string;
    parentProvinceCode: string;
  }>;
};

export function validateChiangMaiRestaurantCoverage(
  data: ReturnType<typeof loadChiangMaiRestaurantCoverage>,
): string[];
