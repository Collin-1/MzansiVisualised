// app/issues/[slug]/page.tsx
//
// This is a DYNAMIC ROUTE — the [slug] folder name is the hint to Next.js.
// It renders a different page for every issue:
//   /issues/province-house-prices  → Issue #001
//   /issues/gdp-by-province        → Issue #002  (when you add it)
//
// Flask equivalent:
//   @app.route('/issues/<slug>')
//   def issue(slug): ...
//
// TWO KEY NEXT.JS FUNCTIONS used here:
//
//   generateStaticParams() — runs at BUILD TIME and tells Next.js which slugs
//   exist. Next.js pre-renders a static HTML file for each one. This is
//   equivalent to generating static files with Flask-Frozen or Frozen-Flask.
//   Result: blazing fast page loads, perfect SEO, no server needed.
//
//   generateMetadata() — runs at BUILD TIME per page and generates the correct
//   <title>, og:image, og:description etc. for each issue.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { VIZ_REGISTRY } from "@/components/visualizations";
import { getIssueBySlug, getAllIssues } from "@/data/issues";
import { fmtDate } from "@/lib/utils";

// ── Tell Next.js which pages to pre-build ─────────────────────────────────────
// This function runs once at build time.
// Return every slug from your data — Next.js builds a static HTML file for each.
export async function generateStaticParams() {
  return getAllIssues().map((issue) => ({ slug: issue.slug }));
}

// ── Generate per-page <head> metadata ─────────────────────────────────────────
// params comes from the URL — e.g. { slug: 'province-house-prices' }
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const issue = getIssueBySlug(params.slug);
  if (!issue) return { title: "Issue not found" };

  return {
    title: issue.title,
    description: issue.deck,
    openGraph: {
      title: issue.title,
      description: issue.deck,
      // Points to our auto-generated OG image (see app/api/og/[slug]/route.tsx)
      images: [`/api/og/${issue.slug}`],
    },
    twitter: {
      card: "summary_large_image",
      title: issue.title,
      description: issue.deck,
      images: [`/api/og/${issue.slug}`],
    },
  };
}

// ── The page component itself ──────────────────────────────────────────────────
export default function IssuePage({ params }: { params: { slug: string } }) {
  const issue = getIssueBySlug(params.slug);

  // If the slug doesn't exist in our data, show the built-in 404 page
  if (!issue) notFound();

  // Look up the React component for this issue from the registry
  // e.g. issue.component = 'ProvinceHousePrices' → the actual component
  const Visualization = VIZ_REGISTRY[issue.component];

  return (
    <>
      <SiteHeader />

      <main className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="page-shell p-6 md:p-8">
          {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
          <nav className="flex items-center gap-2 text-sm text-brand-bark mb-10">
            <Link href="/" className="hover:text-brand-gold transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/issues"
              className="hover:text-brand-gold transition-colors"
            >
              Issues
            </Link>
            <span>/</span>
            <span className="text-neutral-900">
              #{String(issue.number).padStart(3, "0")}
            </span>
          </nav>

          {/* ── Issue header ───────────────────────────────────────────────── */}
          <header className="mb-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-brand-gold">
                Issue #{String(issue.number).padStart(3, "0")}
              </span>
              <span className="text-brand-ash text-xs">·</span>
              <time
                dateTime={issue.publishedAt}
                className="text-brand-ash text-xs"
              >
                {fmtDate(issue.publishedAt)}
              </time>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-5">
              {issue.title}
            </h1>

            <p className="text-lg text-brand-bark dark:text-neutral-400 leading-relaxed">
              {issue.deck}
            </p>
          </header>

          {/* ── The visualization ──────────────────────────────────────────── */}
          {/* This is the main event — the interactive chart/map */}
          {Visualization ? (
            <section className="mb-14" aria-label="Data visualization">
              <Visualization />
            </section>
          ) : (
            // Safety fallback if the component name in data/issues.ts is wrong
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-14 text-sm text-amber-800">
              Visualization component{" "}
              <code className="font-mono">"{issue.component}"</code> not found.
              Add it to{" "}
              <code className="font-mono">
                components/visualizations/index.ts
              </code>
              .
            </div>
          )}

          {/* ── Written analysis below the viz ────────────────────────────── */}
          {/* In a future iteration you can pull this from an MDX file or a CMS.
            For now, add issue-specific prose directly here or pass it through
            the Issue data type. */}
          <section className="prose prose-neutral max-w-prose mb-16">
            <h2>What the data tells us</h2>
            <p>
              South Africa's property market is a tale of nine very different
              economies operating within one country. The Western Cape's
              dominance at the top is driven by years of "semigration" — the
              movement of households from Gauteng and other provinces to the
              Cape Peninsula — alongside constrained coastal land supply and
              consistent municipal service delivery.
            </p>
            <p>
              The Free State's position at the bottom doesn't signal distress —
              it reflects a different economy: agricultural, spacious, and
              anchored by Bloemfontein's stable government employment base. Your
              rand buys considerably more land and space here than anywhere else
              in the country.
            </p>
            <p>
              Perhaps the most interesting data point is Gauteng's year-on-year
              growth slowing to +5.1% while the Western Cape holds +8.2%. The
              premium gap is widening, not narrowing — a structural shift that
              shows no sign of reversing.
            </p>
          </section>

          {/* ── Share buttons ─────────────────────────────────────────────── */}
          <section className="border-t border-neutral-200 pt-10 mb-10">
            <p className="text-sm text-brand-bark mb-4">Share this issue</p>
            <div className="flex gap-3 flex-wrap">
              <ShareButton
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(issue.title)}&url=${encodeURIComponent(`https://mzansivisualized.co.za/issues/${issue.slug}`)}`}
                label="Share on X / Twitter"
              />
              <ShareButton
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://mzansivisualized.co.za/issues/${issue.slug}`)}`}
                label="Share on LinkedIn"
              />
              <ShareButton
                href={`https://wa.me/?text=${encodeURIComponent(`${issue.title} — mzansivisualized.co.za/issues/${issue.slug}`)}`}
                label="Share on WhatsApp"
              />
            </div>
          </section>

          {/* ── Next issue teaser / nav ────────────────────────────────────── */}
          <div className="text-center">
            <Link
              href="/issues"
              className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              All issues
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

// ── Small helper component used only on this page ──────────────────────────────
function ShareButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
    >
      {label}
    </a>
  );
}
