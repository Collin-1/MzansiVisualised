// components/layout/SiteHeader.tsx
//
// The persistent top navigation bar.
// Flask equivalent: the <nav> block in base.html.

import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="pt-6 px-4 md:px-6">
      <div className="max-w-content mx-auto page-shell px-4 sm:px-5 h-16 flex items-center justify-between">
        {/* Logo / wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="w-9 h-9 rounded-2xl bg-brand-gold flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            M
          </span>
          <span className="font-serif font-bold text-lg tracking-tight text-neutral-900">
            Mzansi<span className="text-brand-gold">Visualized</span>
          </span>
        </Link>

        {/* Right-side nav links */}
        <nav className="flex items-center gap-2 text-sm text-brand-bark">
          <Link
            href="/issues"
            className="btn-secondary px-4 py-2 text-sm font-medium"
          >
            All Issues
          </Link>
          <Link
            href="/about"
            className="btn-secondary px-4 py-2 text-sm font-medium"
          >
            About
          </Link>
          <a
            href="https://instagram.com/mzansivisualized"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-4 py-2 text-sm font-medium"
            aria-label="Instagram"
          >
            Instagram
          </a>
        </nav>
      </div>
    </header>
  );
}
