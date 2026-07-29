import type { Place } from "@/domain/models";

export const syntheticPlaceFixture: Place = {
  id: "synthetic-place-001",
  dataClassification: "synthetic",
  subtype: "attraction",
  name: "Synthetic Place — Not for Publication",
  location: {
    latitude: 0,
    longitude: 0,
  },
  sourceIds: ["synthetic-source-001"],
  mediaAssetIds: [],
  verificationId: "synthetic-verification-001",
};
