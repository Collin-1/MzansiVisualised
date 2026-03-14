// components/ui/IssueCard.tsx
//
// A reusable card component shown in the issue grid on the homepage.
// Flask equivalent: a Jinja2 macro you'd call with {% call issue_card(issue) %}

import Link from "next/link";
import type { Issue } from "@/data/issues";
import { fmtDate } from "@/lib/utils";

// Map tag names to short display labels + colours
const TAG_STYLES: Record<string, string> = {
  property: "bg-orange-100 text-orange-700",
  economy: "bg-amber-100  text-amber-700",
  people: "bg-blue-100   text-blue-700",
  infrastructure: "bg-slate-100  text-slate-600",
  culture: "bg-purple-100 text-purple-700",
  map: "bg-green-100  text-green-700",
};

interface IssueCardProps {
  issue: Issue;
  featured?: boolean; // larger treatment for the hero card
}

export default function IssueCard({ issue, featured = false }: IssueCardProps) {
  return (
    <Link
      href={`/issues/${issue.slug}`}
      className={`
        group block ui-card overflow-hidden
        hover:border-brand-gold/50 hover:shadow-[0_14px_30px_rgba(20,70,45,0.13)]
        transition-all duration-300
        ${featured ? "md:col-span-2" : ""}
      `}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-gold via-emerald-500 to-teal-400" />

      <div className={`p-6 ${featured ? "md:p-10" : ""}`}>
        {/* Issue number + date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-brand-gold tracking-widest uppercase">
            Issue #{String(issue.number).padStart(3, "0")}
          </span>
          <span className="text-brand-ash text-xs">/</span>
          <span className="text-brand-ash text-xs">
            {fmtDate(issue.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h2
          className={`
            font-serif font-bold leading-tight mb-3
            group-hover:text-brand-gold transition-colors
            ${featured ? "text-3xl md:text-4xl" : "text-xl"}
          `}
        >
          {issue.title}
        </h2>

        {/* Deck (short description) */}
        <p className="text-brand-bark text-sm leading-relaxed mb-5">
          {issue.deck}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {issue.tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TAG_STYLES[tag] ?? "bg-neutral-100 text-neutral-600"}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
