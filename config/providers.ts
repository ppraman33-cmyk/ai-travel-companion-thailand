export type ProviderCapability =
  "ai" | "maps" | "weather" | "translation" | "analytics";

export interface ProviderSelection {
  readonly capability: ProviderCapability;
  readonly providerId: string;
}

export interface ProviderConfiguration {
  readonly selections: readonly ProviderSelection[];
}
