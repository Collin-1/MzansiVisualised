// app/not-found.tsx
// Shown automatically by Next.js whenever notFound() is called,
// or when a URL doesn't match any page.
// Flask equivalent: @app.errorhandler(404)

import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-content mx-auto px-4 md:px-6 py-10 md:py-16">
        <section className="page-shell py-20 px-6 text-center">
          <p className="text-brand-gold text-sm font-medium tracking-widest uppercase mb-4">
            404
          </p>
          <h1 className="font-serif text-5xl font-bold mb-4">Page not found</h1>
          <p className="text-brand-bark mb-10">
            This issue doesn't exist yet — or the URL is wrong.
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
          >
            ← Back to home
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
