// app/issues/page.tsx  →  mzansivisualized.co.za/issues

import type { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import IssueCard from "@/components/ui/IssueCard";
import { getAllIssues } from "@/data/issues";

export const metadata: Metadata = {
  title: "All Issues",
  description: "Browse every MzansiVisualized data story about South Africa.",
};

export default function IssuesPage() {
  const issues = getAllIssues();

  return (
    <>
      <SiteHeader />
      <main className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-10">
        <section className="page-shell p-6 md:p-8">
          <h1 className="font-serif text-4xl font-bold mb-3">All Issues</h1>
          <p className="text-brand-bark mb-8">
            {issues.length} data {issues.length === 1 ? "story" : "stories"} and
            counting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {issues.map((issue) => (
              <IssueCard key={issue.slug} issue={issue} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
