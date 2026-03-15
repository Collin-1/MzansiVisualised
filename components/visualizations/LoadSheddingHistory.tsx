"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart,
  registerables,
  type ChartData,
  type ChartEvent,
  type ActiveElement,
} from "chart.js";

import {
  YEAR_DATA,
  MONTH_DATA,
  KEY_EVENTS,
  TOTAL_HOURS_LOST,
  type YearRecord,
} from "@/data/load-shedding";
import { cx } from "@/lib/utils";

Chart.register(...registerables);

type ActiveTab = "hours" | "gdp";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getSeverityColor(record: YearRecord): string {
  if (record.totalHours === 0) return "#e5e5e5";
  if (record.peakStage <= 2) return "#EAD39C";
  if (record.peakStage === 3 || record.peakStage === 4) return "#D4A86A";
  if (record.peakStage === 5) return "#C4562A";
  return "#8B1A00";
}

function getHeatmapColor(avgStage: number): string {
  if (avgStage === 0)
    return "var(--color-background-secondary, rgba(0,0,0,0.03))";
  if (avgStage < 2) return "rgba(196, 86, 42, 0.2)";
  if (avgStage < 3) return "rgba(196, 86, 42, 0.4)";
  if (avgStage < 4) return "rgba(196, 86, 42, 0.6)";
  if (avgStage < 5) return "rgba(196, 86, 42, 0.75)";
  return "rgba(139, 26, 0, 0.9)";
}

function getEventColor(type: "spike" | "relief" | "policy" | "record"): string {
  if (type === "spike") return "#C4562A";
  if (type === "record") return "#8B1A00";
  if (type === "policy") return "#D4A86A";
  return "#4A8C5C";
}

export default function LoadSheddingHistory() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("hours");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<"bar", number[], string> | null>(null);

  const selectedRecord = YEAR_DATA.find((d) => d.year === selectedYear) ?? null;

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = YEAR_DATA.map((d) => d.year.toString());
    const values = YEAR_DATA.map((d) =>
      activeTab === "hours" ? d.totalHours : d.gdpImpactBn,
    );

    const data: ChartData<"bar", number[], string> = {
      labels,
      datasets: [
        {
          data: values,
          borderWidth: 0,
          backgroundColor: YEAR_DATA.map((d) => getSeverityColor(d)),
          borderRadius: 4,
          hoverBorderWidth: 0,
        },
      ],
    };

    chartRef.current = new Chart<"bar", number[], string>(canvasRef.current, {
      type: "bar",
      data,
      options: {
        maintainAspectRatio: false,
        animation: {
          duration: 350,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                const index = items[0]?.dataIndex ?? 0;
                return `Year ${YEAR_DATA[index].year}`;
              },
              label: (context) => {
                const index = context.dataIndex;
                const record = YEAR_DATA[index];
                return `Hours: ${record.totalHours.toLocaleString()} | Peak stage: ${record.peakStage} | Days: ${record.daysAffected}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 0,
              font: {
                size: 10,
              },
              color: "#7A6A58",
            },
            border: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0,0,0,0.05)",
            },
            ticks: {
              font: {
                size: 10,
              },
              color: "#7A6A58",
            },
            border: {
              display: false,
            },
          },
        },
        onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
          const first = elements[0];
          if (!first) return;
          setSelectedYear(YEAR_DATA[first.index].year);
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.data.datasets[0].data = YEAR_DATA.map((d) =>
      activeTab === "hours" ? d.totalHours : d.gdpImpactBn,
    );
    chartRef.current.update();
  }, [activeTab]);

  return (
    <section className="w-full rounded-2xl border border-brand-bark/20 bg-brand-earth-2 text-brand-bark shadow-sm">
      <div className="grid grid-cols-2 gap-3 border-b border-brand-bark/20 p-4 sm:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-brand-ash">
            Worst year
          </p>
          <p className="font-serif text-2xl leading-none text-brand-gold">
            2023
          </p>
          <p className="text-[11px] text-brand-ash">6,829 hrs total</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-brand-ash">
            Stage 6 days
          </p>
          <p className="font-serif text-2xl leading-none text-brand-gold">
            335
          </p>
          <p className="text-[11px] text-brand-ash">in 2023</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-brand-ash">
            Hours lost
          </p>
          <p className="font-serif text-2xl leading-none text-brand-gold">
            {TOTAL_HOURS_LOST.toLocaleString()}
          </p>
          <p className="text-[11px] text-brand-ash">2007-2024</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-brand-ash">
            GDP wiped est.
          </p>
          <p className="font-serif text-2xl leading-none text-brand-gold">
            R86bn
          </p>
          <p className="text-[11px] text-brand-ash">2020-2024 (World Bank)</p>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-end gap-6 border-b border-brand-bark/20">
          <button
            type="button"
            onClick={() => setActiveTab("hours")}
            className={cx(
              "pb-2 text-sm font-medium transition-colors",
              activeTab === "hours"
                ? "border-b-2 text-brand-bark"
                : "border-b-2 border-transparent text-brand-ash hover:text-brand-bark",
            )}
            style={
              activeTab === "hours"
                ? { borderBottomColor: "#C09040" }
                : undefined
            }
          >
            Hours lost
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gdp")}
            className={cx(
              "pb-2 text-sm font-medium transition-colors",
              activeTab === "gdp"
                ? "border-b-2 text-brand-bark"
                : "border-b-2 border-transparent text-brand-ash hover:text-brand-bark",
            )}
            style={
              activeTab === "gdp" ? { borderBottomColor: "#C09040" } : undefined
            }
          >
            GDP impact (Rbn)
          </button>
        </div>

        <div className="h-[260px]">
          <canvas ref={canvasRef} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-brand-ash">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#EAD39C" }}
            />
            Stage 1-2
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#D4A86A" }}
            />
            Stage 3-4
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#C4562A" }}
            />
            Stage 5
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#8B1A00" }}
            />
            Stage 6+
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#e5e5e5" }}
            />
            No shedding
          </span>
        </div>
      </div>

      {selectedRecord && (
        <div className="mx-4 mb-4 rounded-xl border border-brand-gold/30 bg-brand-earth p-4">
          <button
            type="button"
            onClick={() => setSelectedYear(null)}
            className="float-right text-lg leading-none text-brand-ash transition-colors hover:text-brand-bark"
            aria-label="Close selected year details"
          >
            &times;
          </button>
          <h3
            className="font-serif text-3xl leading-none"
            style={{ color: getSeverityColor(selectedRecord) }}
          >
            {selectedRecord.year}
          </h3>
          <p className="mt-2 text-sm text-brand-bark">
            {selectedRecord.totalHours.toLocaleString()} hours of load-shedding
          </p>
          <p className="text-sm text-brand-ash">
            Peak stage: {selectedRecord.peakStage}
          </p>
          <p className="text-sm text-brand-ash">
            {selectedRecord.daysAffected} days affected
          </p>
          {selectedRecord.gdpImpactBn > 0 ? (
            <p className="text-sm text-brand-ash">
              Estimated GDP impact: R{selectedRecord.gdpImpactBn.toFixed(1)}bn
            </p>
          ) : (
            <p className="text-sm text-brand-ash">
              GDP impact: not measured for this year
            </p>
          )}
        </div>
      )}

      <div className="border-t border-brand-bark/20 p-4">
        <p className="mb-3 text-xs font-medium tracking-[0.08em] text-brand-bark">
          Monthly intensity - 2022 to 2024
        </p>

        <div className="mb-1 ml-8 grid grid-cols-12 gap-1 text-[9px] text-brand-ash">
          {MONTH_NAMES.map((month) => (
            <span key={month} className="text-center">
              {month}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {[2022, 2023, 2024].map((year) => {
            const months = MONTH_DATA.filter((d) => d.year === year);
            return (
              <div key={year} className="flex items-center gap-1">
                <span className="w-7 text-right text-xs text-brand-ash">
                  {year}
                </span>
                <div className="grid flex-1 grid-cols-12 gap-1">
                  {months.map((record) => (
                    <span
                      key={`${record.year}-${record.month}`}
                      className="h-7 rounded-sm transition-opacity hover:opacity-70"
                      style={{
                        backgroundColor: getHeatmapColor(record.avgStage),
                      }}
                      title={`${MONTH_NAMES[record.month - 1]} ${record.year} - avg stage ${record.avgStage.toFixed(1)} (approx ${record.hoursLost.toLocaleString()} hrs lost)`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-brand-bark/20 p-4">
        <p className="mb-3 text-xs font-medium tracking-[0.08em] text-brand-bark">
          Key events
        </p>
        <div className="space-y-3">
          {KEY_EVENTS.map((event) => (
            <div
              key={`${event.year}-${event.label}`}
              className="flex items-start gap-3"
            >
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: getEventColor(event.type) }}
              />
              <span className="w-8 shrink-0 text-[11px] text-brand-ash">
                {event.year}
              </span>
              <div>
                <p className="text-[13px] font-medium text-brand-bark">
                  {event.label}
                </p>
                <p className="text-[11px] leading-relaxed text-brand-ash">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-brand-bark/20 px-4 py-2 text-[10px] text-brand-ash">
        <span>
          Sources: Eskom · EskomSePush API · StatsSA · World Bank (2024)
        </span>
        <span>mzansivisualized.co.za</span>
      </footer>
    </section>
  );
}
