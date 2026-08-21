export function validateVillageEvidence(
  records: Array<Record<string, unknown>>,
  tambons: Array<Record<string, unknown>>,
): string[];
export function validateVillageManifest(
  manifest: Record<string, unknown>,
  scanRoot?: string,
): string[];
export function findVillageRuntimeLeakage(scanRoot?: string): string[];
export function findCommittedVillageSourceBinaries(scanRoot?: string): string[];
