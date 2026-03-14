// app/layout.tsx
//
// Think of this like Flask's base.html — it wraps EVERY page on the site.
// In Next.js the App Router, every folder under /app can have a layout.tsx.
// The root one (this file) sets up fonts, metadata, and the outer HTML shell.

import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

// ── Fonts ────────────────────────────────────────────────────────────────────
// Next.js downloads Google Fonts at BUILD TIME and self-hosts them.
// This means zero flash-of-unstyled-text and no external font requests.
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans", // becomes a CSS variable you can use anywhere
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// ── Site-wide metadata ───────────────────────────────────────────────────────
// Next.js reads this and inserts the right <meta> and <title> tags.
// Each page can override/extend these (see individual page.tsx files).
export const metadata: Metadata = {
  title: {
    default: "MzansiVisualized — Data stories about South Africa",
    template: "%s | MzansiVisualized", // page title becomes "Page | MzansiVisualized"
  },
  description:
    "Weekly data visualizations about South Africa — economy, people, provinces, and more.",
  metadataBase: new URL("https://mzansivisualized.co.za"),
  openGraph: {
    siteName: "MzansiVisualized",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@mzansiviz", // update to your handle
  },
};

// ── Root layout component ────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // "children" = whatever page is currently active
}) {
  return (
    // suppressHydrationWarning prevents a React warning caused by dark-mode
    // class being toggled by JS before React hydrates
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${dmSans.variable}
          ${playfair.variable}
          font-sans
          bg-brand-earth
          text-neutral-900
          dark:bg-neutral-950
          dark:text-neutral-100
          antialiased min-h-screen
        `}
      >
        {children}
      </body>
    </html>
  );
}
