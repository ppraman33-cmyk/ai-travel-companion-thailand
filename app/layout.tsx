import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI Travel Companion Thailand",
  description: "Implementation foundation for a trustworthy Thailand travel companion.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#047857",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
