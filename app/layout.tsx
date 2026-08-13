import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI Travel Companion Thailand",
  description: "Implementation foundation for a trustworthy Thailand travel companion.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#16A34A",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Strict nonce-based CSP requires request-time rendering so Next can nonce its scripts.
  await connection();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
