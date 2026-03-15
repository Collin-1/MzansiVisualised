// app/page.tsx
//
// The homepage — rendered at https://mzansivisualized.co.za/
//
// KEY NEXT.JS CONCEPT — Server Components (the default):
// This file has NO 'use client' directive at the top.
// That means Next.js renders it on the SERVER — like Flask renders a template.
// The HTML is generated before it reaches the browser.
// Benefits: fast initial load, great SEO, no JavaScript needed for the shell.
//
// Components that need interactivity (useState, event handlers) are marked
// 'use client' and are "hydrated" in the browser after the initial HTML loads.

import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import IssueCard from "@/components/ui/IssueCard";
import { getAllIssues } from "@/data/issues";

export default function HomePage() {
  // getAllIssues() runs on the SERVER — no API call needed, it's just JS.
  // Flask equivalent: Issue.query.order_by(Issue.published_at.desc()).all()
  const issues = getAllIssues();

  return (
    <>
      <SiteHeader />

      <main className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="page-shell p-8 md:p-10 mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-brand-gold flex items-center justify-center text-white font-bold shadow-sm">
              M
            </div>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-brand-gold">
              MzansiVisualized
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-6 max-w-2xl text-neutral-900">
            South Africa,{" "}
            <em className="text-brand-gold not-italic">in data.</em>
          </h1>

          <p className="text-lg text-brand-bark leading-relaxed max-w-xl mb-8">
            Weekly visualizations about the country we call home — economy,
            people, provinces, infrastructure, and culture. Beautiful, honest,
            South African.
          </p>

          <Link
            href="/issues"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
          >
            Browse all issues →
          </Link>
        </section>

        {/* ── Latest issues grid ───────────────────────────────────────────── */}
        <section className="page-shell p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold">Latest issues</h2>
            <Link href="/issues" className="btn-secondary px-4 py-2 text-sm">
              View all
            </Link>
          </div>

          {issues.length === 0 ? (
            <p className="text-brand-bark">
              No issues published yet. Check back soon!
            </p>
          ) : (
            // CSS Grid: 1 column on mobile, 2 columns on md+
            // The first (featured) card spans 2 columns via IssueCard's featured prop
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {issues.map((issue, i) => (
                <IssueCard
                  key={issue.slug}
                  issue={issue}
                  featured={i === 0} // first card gets the large treatment
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Newsletter signup ─────────────────────────────────────────────── */}
        <section className="mt-8 md:mt-10 page-shell p-8 md:p-10 text-center">
          <h2 className="font-serif text-3xl font-bold mb-3">
            New issue, every week.
          </h2>
          <p className="text-brand-bark mb-6 max-w-md mx-auto">
            One data visualization about South Africa, delivered to your inbox
            every Thursday.
          </p>
          {/* Replace this with your actual newsletter signup form
              Recommended: Buttondown (free up to 1000 subscribers)
              https://buttondown.com */}
          <div className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-full border border-[#c8d5cb] bg-white/80 text-sm focus:outline-none focus:border-brand-gold"
            />
            <button className="btn-primary px-5 py-2.5 text-sm font-medium">
              Subscribe
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
