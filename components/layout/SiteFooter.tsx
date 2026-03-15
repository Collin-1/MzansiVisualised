// components/layout/SiteFooter.tsx

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-14 px-4 md:px-6 pb-10">
      <div className="max-w-content mx-auto page-shell px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-serif font-bold text-base">
            Mzansi<span className="text-brand-gold">Visualized</span>
          </p>
          <p className="text-sm text-brand-bark mt-1">
            Weekly data stories about South Africa.
          </p>
        </div>

        <nav className="flex gap-3 text-sm text-brand-bark">
          <Link href="/issues" className="btn-secondary px-4 py-2">
            Issues
          </Link>
          <Link href="/about" className="btn-secondary px-4 py-2">
            About
          </Link>
          <a
            href="https://instagram.com/mzansivisualized"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-4 py-2"
          >
            Instagram
          </a>
        </nav>

        <p className="text-xs text-brand-ash">
          © {new Date().getFullYear()} MzansiVisualized
        </p>
      </div>
    </footer>
  );
}
