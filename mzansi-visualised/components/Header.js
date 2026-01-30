"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/90 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 px-2 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <span className="text-2xl font-bold tracking-tight text-primary-400">
            Mzansi Visualised
          </span>
          <span className="text-lg font-semibold text-slate-100">
            Cost of Living Explorer
          </span>
        </div>
        <nav className="flex gap-2 md:gap-4 items-center mt-2 md:mt-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors duration-150 ${pathname === link.href ? "bg-primary-500 text-slate-950" : "hover:bg-slate-800 text-slate-200"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="w-full text-center text-xs text-slate-400 pb-2 -mt-2">
        South Africa’s data, beautifully explained.
      </div>
    </header>
  );
}
