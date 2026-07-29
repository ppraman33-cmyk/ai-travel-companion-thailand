export type SupabaseEnvironment = "development" | "test" | "production";

export interface SupabaseConnectionSettings {
  readonly environment: SupabaseEnvironment;
  readonly projectUrl: URL;
  readonly publicKey: string;
}

export type DatabaseSchema = never;
