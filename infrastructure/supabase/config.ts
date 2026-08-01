import { z } from "zod";

const localOrTestUrl = z
  .url()
  .refine(
    (value) =>
      value.startsWith("http://127.0.0.1:") ||
      value.startsWith("http://localhost:") ||
      value.endsWith(".supabase.co"),
    "Expected a local/test Supabase URL.",
  );

const publicClientConfigSchema = z.object({
  url: localOrTestUrl,
  publishableKey: z.string().min(1),
});

const serviceClientConfigSchema = z.object({
  url: localOrTestUrl,
  serviceRoleKey: z.string().min(1),
  environment: z.enum(["development", "test", "production"]),
});

export type PublicDatabaseClientConfig = z.infer<typeof publicClientConfigSchema>;
export type ServiceDatabaseClientConfig = z.infer<typeof serviceClientConfigSchema>;

export const parsePublicDatabaseClientConfig = (
  input: unknown,
): PublicDatabaseClientConfig => publicClientConfigSchema.parse(input);

export const parseServiceDatabaseClientConfig = (
  input: unknown,
): ServiceDatabaseClientConfig => serviceClientConfigSchema.parse(input);
