"use client";
import { useState } from "react";

export default function ControlsBar({
  months,
  selectedMonth,
  setSelectedMonth,
  metrics,
  selectedMetric,
  setSelectedMetric,
  provinces,
  focusProvince,
  setFocusProvince,
  trendProvinces,
  setTrendProvinces,
}) {
  // Helper for trend province selection (max 5)
  function toggleTrendProvince(prov) {
    if (trendProvinces.includes(prov)) {
      setTrendProvinces(trendProvinces.filter((p) => p !== prov));
    } else if (trendProvinces.length < 5) {
      setTrendProvinces([...trendProvinces, prov]);
    }
  }

  return (
    <section className="card mb-4 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">Month</label>
        <select
          className="w-36"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">Metric</label>
        <select
          className="w-44"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          {metrics.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">
          Focus Province
        </label>
        <select
          className="w-44"
          value={focusProvince}
          onChange={(e) => setFocusProvince(e.target.value)}
        >
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs font-medium text-slate-400">
          Trend Provinces (max 5)
        </label>
        <div className="flex flex-wrap gap-2">
          {provinces.map((p) => (
            <button
              key={p}
              type="button"
              className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${trendProvinces.includes(p) ? "bg-primary-500 text-slate-950 border-primary-500" : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"}`}
              onClick={() => toggleTrendProvince(p)}
              disabled={
                !trendProvinces.includes(p) && trendProvinces.length >= 5
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
