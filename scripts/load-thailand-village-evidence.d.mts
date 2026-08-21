export interface VillageEvidenceRecord {
  [key: string]: unknown;
  code: string;
  villageNumber: number;
  nameTh: string;
  nameEn: string;
  parentTambonCode: string;
  parentAmphoeCode: string;
  parentProvinceCode: string;
  sourceReferences: string[];
  lifecycleStatus: string;
  englishNameStatus: string;
  rightsStatus: string;
  boundaryStatus: string;
  publicationEligibility: string;
}
export interface VillageEvidenceManifest {
  [key: string]: unknown;
  storage: {
    files: Array<{ path: string; bytes: number; sha256: string }>;
    totalBytes: number;
    maxFileBytes: number;
  };
  sourceRegister: Array<Record<string, unknown>>;
  authoritativeTotals: Record<string, number>;
  tambonCounts: Record<string, number>;
  zeroVillageTambons: Array<Record<string, unknown>>;
  monthlyReconciliation: {
    newlyObservedInJuly: string[];
    notObservedInJuly: string[];
    identityConflicts: string[];
    notObservedLifecycleStatus: string;
  };
}
export function canonicalVillageRecordsSha256(records: unknown[]): string;
export function loadVillageEvidence(scanRoot?: string): {
  manifest: VillageEvidenceManifest;
  records: VillageEvidenceRecord[];
  canonicalRecordsSha256: string;
};
