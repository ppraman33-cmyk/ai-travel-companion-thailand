import type {
  MapHandoffProvider,
  MapHandoffRequest,
} from "@/providers/maps/map-handoff-provider";
import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";
import { coordinatesSchema } from "@/shared/validation/coordinates";

export class ExternalMapHandoffProvider implements MapHandoffProvider {
  createExternalHandoffUrl(request: MapHandoffRequest) {
    const coordinates = coordinatesSchema.safeParse(request.destination);
    const label = request.destinationLabel.trim();
    if (!coordinates.success || !label || label.length > 200) {
      return failure(appError("VALIDATION", "A valid map destination is required."));
    }

    const coordinatePair = `${coordinates.data.latitude},${coordinates.data.longitude}`;
    if (request.application === "google_maps") {
      const url = new URL(
        request.action === "directions"
          ? "https://www.google.com/maps/dir/"
          : "https://www.google.com/maps/search/",
      );
      url.searchParams.set("api", "1");
      if (request.action === "directions") {
        url.searchParams.set("destination", coordinatePair);
      } else {
        url.searchParams.set("query", `${label} ${coordinatePair}`);
      }
      return success(url);
    }

    const url = new URL("https://maps.apple.com/");
    if (request.action === "directions") {
      url.searchParams.set("daddr", coordinatePair);
      url.searchParams.set("dirflg", "d");
    } else {
      url.searchParams.set("ll", coordinatePair);
      url.searchParams.set("q", label);
    }
    return success(url);
  }
}
