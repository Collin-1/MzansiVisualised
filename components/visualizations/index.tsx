// components/visualizations/index.tsx
//
// Registry mapping the `component` string in data/issues.ts to the real
// React component. When you add a new issue:
//   1. Create the component file (e.g. GdpByProvince.tsx)
//   2. Add a dynamic() entry below
//   3. Add the issue to data/issues.ts — the site updates automatically.
//
// IMPORTANT: This file must be .tsx (not .ts) because the loading fallback
// contains JSX — the <div> below. .ts files do not allow JSX syntax.

import React from "react";
import dynamic from "next/dynamic";

// Loading fallback shown while the visualization JS chunk downloads.
// Kept as a plain function so it can live in a .tsx file without 'use client'.
function LoadingFallback() {
  return (
    <div className="h-96 flex items-center justify-center text-brand-ash text-sm">
      Loading visualization…
    </div>
  );
}

export const VIZ_REGISTRY: Record<string, React.ComponentType> = {
  ProvinceHousePrices: dynamic(() => import("./ProvinceHousePrices"), {
    ssr: false,
    loading: LoadingFallback,
  }),
  LoadSheddingHistory: dynamic(() => import("./LoadSheddingHistory"), {
    ssr: false,
  }),
  // Add future visualizations here:
  // GdpByProvince:   dynamic(() => import('./GdpByProvince'),   { ssr: false }),
  // UnemploymentMap: dynamic(() => import('./UnemploymentMap'), { ssr: false }),
};
