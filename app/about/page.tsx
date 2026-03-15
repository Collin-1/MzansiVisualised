// app/about/page.tsx  →  mzansivisualized.co.za/about

import type { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "About",
  description:
    "MzansiVisualized is a weekly data visualization project about South Africa.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="max-w-2xl page-shell p-7 md:p-10">
          <h1 className="font-serif text-5xl font-bold mb-6">About</h1>

          <div className="prose prose-neutral text-base leading-relaxed space-y-5">
            <p className="text-xl text-brand-bark leading-relaxed">
              MzansiVisualized is a weekly data publication turning South
              African data into clear, beautiful, shareable visualizations.
            </p>

            <h2 className="font-serif text-2xl font-bold mt-10 mb-3">Why?</h2>
            <p>
              South Africa generates enormous amounts of public data — StatsSA,
              National Treasury, the Reserve Bank, property registries,
              municipal dashboards — but most of it stays buried in spreadsheets
              and government PDFs. MzansiVisualized exists to surface it.
            </p>

            <h2 className="font-serif text-2xl font-bold mt-10 mb-3">
              How it works
            </h2>
            <p>
              Every week, one dataset. One question. One visualization designed
              to be understood in under a minute and worth sharing. Topics span
              property, economy, infrastructure, culture, sport, and the
              environment.
            </p>

            <h2 className="font-serif text-2xl font-bold mt-10 mb-3">
              Data sources
            </h2>
            <p>
              All data comes from primary South African sources: StatsSA, the
              South African Reserve Bank, National Treasury, Lightstone,
              Property24, FNB, the Department of Basic Education, and Eskom.
              Each issue credits its sources in full.
            </p>

            <h2 className="font-serif text-2xl font-bold mt-10 mb-3">
              Contact
            </h2>
            <p>
              Questions, corrections, or data suggestions:{" "}
              <a
                href="mailto:hello@mzansivisualized.co.za"
                className="text-brand-gold hover:underline"
              >
                hello@mzansivisualized.co.za
              </a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
