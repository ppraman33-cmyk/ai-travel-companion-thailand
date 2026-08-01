import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Travel Companion Thailand",
    short_name: "Thailand Companion",
    description: "A trustworthy nationwide guide to Thailand's 77 provinces.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6faf8",
    theme_color: "#047857",
    icons: [
      {
        src: "/icons/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
