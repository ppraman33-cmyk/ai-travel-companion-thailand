export type ProvinceIdentity = { code: string };

export function validateDistrictEvidence(
  payload: unknown,
  provinces: ProvinceIdentity[],
): string[];

export function validateSourceManifest(manifest: unknown): string[];

export function findRuntimeLeakage(scanRoot?: string): string[];
