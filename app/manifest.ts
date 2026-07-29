import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Travel Companion Thailand",
    short_name: "Thailand Companion",
    description: "A trustworthy travel companion foundation.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6faf8",
    theme_color: "#047857",
  };
}
