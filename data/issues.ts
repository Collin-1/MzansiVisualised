// data/issues.ts
//
// This is your "database" for now — a plain TypeScript array.
// When you're ready to scale, swap this out for a real DB (e.g. Supabase,
// PlanetScale) or a CMS (Sanity, Contentful). The components won't change —
// only this file and the data-fetching functions do.
//
// Flask equivalent: your SQLAlchemy models + seed data.

export type Tag =
  | "property"
  | "economy"
  | "people"
  | "infrastructure"
  | "culture"
  | "map";

export interface Issue {
  slug: string; // URL identifier: /issues/province-house-prices
  number: number; // Issue #001, #002 …
  title: string;
  deck: string; // Short description shown on cards and in meta tags
  publishedAt: string; // ISO date string: "2026-03-13"
  tags: Tag[];
  component: string; // Which visualization component to render (see below)
  featured: boolean; // Show on homepage hero?
}

// ── Issue registry ────────────────────────────────────────────────────────────
// Add a new object here each week. The site auto-updates.
export const issues: Issue[] = [
  {
    slug: "province-house-prices",
    number: 1,
    title: "Where does your rand go the furthest?",
    deck: "Average house prices across SA's nine provinces reveal a country of stark contrasts. The Western Cape costs nearly double the Free State.",
    publishedAt: "2026-03-13",
    tags: ["property", "economy", "map"],
    component: "ProvinceHousePrices",
    featured: true,
  },
  {
    slug: "load-shedding-history",
    number: 2,
    title: "SA's years in the dark",
    deck: "From 50 hours in 2007 to 6,829 hours in 2023. Every year of load-shedding, mapped and measured.",
    publishedAt: "2026-03-20",
    tags: ["infrastructure", "economy"],
    component: "LoadSheddingHistory",
    featured: false,
  },
  // ── Add future issues below ────────────────────────────────────────────────
  // {
  //   slug:        'gdp-by-province',
  //   number:      2,
  //   title:       'Who is carrying the economy?',
  //   deck:        'Gauteng alone generates 34% of South Africa\'s GDP. Here\'s the full picture.',
  //   publishedAt: '2026-03-20',
  //   tags:        ['economy', 'map'],
  //   component:   'GdpByProvince',
  //   featured:    false,
  // },
];

// ── Helper functions (like Flask db.session.query()) ──────────────────────────

/** Returns all issues sorted newest first */
export function getAllIssues(): Issue[] {
  return [...issues].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/** Returns a single issue by its URL slug */
export function getIssueBySlug(slug: string): Issue | undefined {
  return issues.find((i) => i.slug === slug);
}

/** Returns the featured issue for the homepage hero */
export function getFeaturedIssue(): Issue | undefined {
  return issues.find((i) => i.featured);
}
