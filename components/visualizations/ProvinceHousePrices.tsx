// components/visualizations/ProvinceHousePrices.tsx
// Renders South African province boundaries from a dataset file.
"use client";

import { useState, useRef } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import saProvinces from "@/publicdata/sa-provinces-boundaries.json";
import {
  PROVINCE_DATA,
  PROVINCES_BY_RANK,
  NATIONAL_MEDIAN,
  type ProvinceCode,
} from "@/data/province-house-prices";
import { fmtRandShort, fmtPct, cx } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────────────
interface GeoFeature {
  type: "Feature";
  properties: {
    PROVINCE?: string;
    shapeName?: string;
    shapeISO?: string;
  };
  geometry: GeoPermissibleObjects;
}
interface GeoCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

function rewindGeometryForD3(
  geometry: GeoPermissibleObjects,
): GeoPermissibleObjects {
  if (geometry.type === "Polygon") {
    const polygon = geometry as any;
    return {
      type: "Polygon",
      coordinates: polygon.coordinates.map((ring: number[][]) =>
        [...ring].reverse(),
      ),
    };
  }

  if (geometry.type === "MultiPolygon") {
    const multiPolygon = geometry as any;
    return {
      type: "MultiPolygon",
      coordinates: multiPolygon.coordinates.map((polygon: number[][][]) =>
        polygon.map((ring: number[][]) => [...ring].reverse()),
      ),
    };
  }

  return geometry;
}

const SA_GEOJSON: GeoCollection = {
  type: "FeatureCollection",
  features: (saProvinces as GeoCollection).features.map((feature) => ({
    ...feature,
    geometry: rewindGeometryForD3(feature.geometry),
  })),
};

function normalizeProvinceName(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

const NAME_TO_CODE: Record<string, ProvinceCode> = {
  westerncape: "WC",
  easterncape: "EC",
  northerncape: "NC",
  notherncape: "NC",
  freestate: "FS",
  kwazulunatal: "KZN",
  northwest: "NW",
  gauteng: "GP",
  mpumalanga: "MP",
  limpopo: "LP",
};

// ── Component ───────────────────────────────────────────────────────────────
export default function ProvinceHousePrices() {
  const [selected, setSelected] = useState<ProvinceCode>("WC");
  const [hovered, setHovered] = useState<ProvinceCode | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    code: ProvinceCode;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const activeCode = hovered ?? selected;
  const activeData = PROVINCE_DATA[activeCode];
  const maxPrice = Math.max(
    ...Object.values(PROVINCE_DATA).map((d) => d.avgPrice),
  );

  const W = 620,
    H = 480;
  const projection = geoMercator().fitSize([W, H], SA_GEOJSON as any);
  const pathGen = geoPath(projection);

  function handleMouseEnter(e: React.MouseEvent, code: ProvinceCode) {
    setHovered(code);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect)
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, code });
  }
  function handleMouseMove(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect)
      setTooltip((t) =>
        t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null,
      );
  }
  function handleMouseLeave() {
    setHovered(null);
    setTooltip(null);
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
      {/* Stat bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-neutral-100 dark:divide-neutral-800 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { label: "Most expensive", value: "R1.8m", sub: "Western Cape" },
          { label: "Best value", value: "R800k", sub: "Free State" },
          { label: "National median", value: "R980k", sub: "All provinces" },
          { label: "WC vs FS gap", value: "+125%", sub: "price premium" },
        ].map((s) => (
          <div key={s.label} className="px-5 py-4">
            <p className="text-[10px] uppercase tracking-widest text-brand-ash mb-1">
              {s.label}
            </p>
            <p className="font-serif text-2xl font-bold leading-none">
              {s.value}
            </p>
            <p className="text-xs text-brand-bark dark:text-neutral-500 mt-1">
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Map + sidebar */}
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 relative p-2 min-h-[320px]">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {SA_GEOJSON.features.map((feature) => {
              const rawName =
                feature.properties.PROVINCE ??
                feature.properties.shapeName ??
                "";
              const code = NAME_TO_CODE[normalizeProvinceName(rawName)];
              if (!code) return null;
              const d = pathGen(feature.geometry);
              if (!d) return null;
              const data = PROVINCE_DATA[code];
              const isActive = code === activeCode;
              const isDimmed = !!hovered && code !== hovered;
              return (
                <path
                  key={code}
                  d={d}
                  fill={data.color}
                  stroke="white"
                  strokeWidth={isActive ? 2 : 1}
                  className={cx(
                    "province-path",
                    isActive && "is-active",
                    isDimmed && "is-dimmed",
                  )}
                  onMouseEnter={(e) => handleMouseEnter(e, code)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => setSelected(code)}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-3 min-w-[170px]"
              style={{
                left: tooltip.x + 14,
                top: tooltip.y - 10,
                transform:
                  tooltip.x > W * 0.65 ? "translateX(-110%)" : undefined,
              }}
            >
              <p className="text-xs text-brand-bark mb-0.5">
                {PROVINCE_DATA[tooltip.code].name}
              </p>
              <p
                className="font-serif text-2xl font-bold leading-none"
                style={{ color: PROVINCE_DATA[tooltip.code].color }}
              >
                {fmtRandShort(PROVINCE_DATA[tooltip.code].avgPrice)}
              </p>
              <div className="mt-2 pt-2 border-t border-neutral-100 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-brand-ash">Rank</span>{" "}
                <span className="font-medium">
                  #{PROVINCE_DATA[tooltip.code].rank} of 9
                </span>
                <span className="text-brand-ash">YoY</span>{" "}
                <span className="font-medium">
                  {fmtPct(PROVINCE_DATA[tooltip.code].yoyGrowth)}
                </span>
                <span className="text-brand-ash">Capital</span>
                <span className="font-medium">
                  {PROVINCE_DATA[tooltip.code].capital}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar ranking */}
        <div className="w-full lg:w-60 border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800 p-5">
          <p className="text-[10px] uppercase tracking-widest text-brand-ash mb-4 font-medium">
            Ranked by avg. price
          </p>
          <ul className="space-y-1">
            {PROVINCES_BY_RANK.map((prov) => {
              const isActive = prov.code === activeCode;
              return (
                <li key={prov.code}>
                  <button
                    className={cx(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors",
                      isActive
                        ? "bg-brand-earth-2 dark:bg-neutral-800"
                        : "hover:bg-brand-earth dark:hover:bg-neutral-800/50",
                    )}
                    onClick={() => setSelected(prov.code)}
                    onMouseEnter={() => setHovered(prov.code)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="text-[10px] text-brand-ash w-4 text-right flex-shrink-0">
                      {prov.rank}
                    </span>
                    <span
                      className="w-2.5 h-8 rounded-sm flex-shrink-0"
                      style={{ background: prov.color }}
                    />
                    <span className="flex-1 min-w-0">
                      <span
                        className={cx(
                          "block text-[13px] font-medium leading-tight",
                          isActive && "text-brand-gold",
                        )}
                      >
                        {prov.name}
                      </span>
                      <span className="block text-xs text-brand-bark dark:text-neutral-500 tabular-nums">
                        {fmtRandShort(prov.avgPrice)}
                      </span>
                      <span className="block mt-1 h-0.5 rounded bg-neutral-100 dark:bg-neutral-700">
                        <span
                          className="block h-0.5 rounded"
                          style={{
                            width: `${(prov.avgPrice / maxPrice) * 100}%`,
                            background: prov.color,
                          }}
                        />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div
              className="h-2 rounded-full"
              style={{
                background: "linear-gradient(to right,#EAD39C,#C87040,#B84020)",
              }}
            />
            <div className="flex justify-between text-[10px] text-brand-ash mt-1">
              <span>Affordable</span>
              <span>Expensive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <div className="border-t border-neutral-100 dark:border-neutral-800 p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
          <div className="flex-1">
            <h3
              className="font-serif text-xl font-bold mb-1.5"
              style={{ color: activeData.color }}
            >
              {activeData.name}
            </h3>
            <p className="text-sm text-brand-bark dark:text-neutral-400 leading-relaxed max-w-prose">
              {activeData.description}
            </p>
          </div>
          <div className="flex gap-8 sm:gap-6 flex-shrink-0 sm:text-right">
            {[
              { label: "Avg. price", value: fmtRandShort(activeData.avgPrice) },
              { label: "YoY growth", value: fmtPct(activeData.yoyGrowth) },
              { label: "Capital", value: activeData.capital },
              {
                label: "vs median",
                value: fmtPct(
                  ((activeData.avgPrice - NATIONAL_MEDIAN) / NATIONAL_MEDIAN) *
                    100,
                ),
              },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] uppercase tracking-widest text-brand-ash">
                  {s.label}
                </p>
                <p className="font-serif text-lg font-bold leading-tight">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 dark:border-neutral-800 px-6 py-3 flex justify-between text-[10px] text-brand-ash">
        <span>
          Sources: Property24 · Lightstone · FNB Home Loans · StatsSA (2025)
        </span>
        <span>mzansivisualized.co.za</span>
      </div>
    </div>
  );
}
