export const externalMapProviders = ["google_maps", "apple_maps"] as const;
export type ExternalMapProvider = (typeof externalMapProviders)[number];

const trustedProviderUrls: Record<ExternalMapProvider, string> = {
  google_maps: "https://www.google.com/maps",
  apple_maps: "https://maps.apple.com/",
};

export function getTrustedExternalMapUrl(provider: string) {
  return externalMapProviders.includes(provider as ExternalMapProvider)
    ? trustedProviderUrls[provider as ExternalMapProvider]
    : undefined;
}
