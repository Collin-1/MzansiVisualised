"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_REF_BASKET,
  GROCERY_ITEMS,
  YEARS,
  type GroceryItem,
} from "@/data/grocery-basket";
import { cx } from "@/lib/utils";

type BasketState = Record<string, number>;

function currency(value: number): string {
  return `R${value.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function currencyShort(value: number): string {
  return `R${value.toLocaleString("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function itemPrice(
  item: GroceryItem,
  year: number,
  priceShiftPct: number,
): number {
  const base = item.pricesByYear[year] ?? 0;
  const adjusted = base * (1 + priceShiftPct / 100);
  return Math.max(0.5, Math.round(adjusted * 100) / 100);
}

function runAutoFill(
  year: number,
  budget: number,
  priceShiftPct: number,
): BasketState {
  const basket: BasketState = {};
  let remaining = budget;

  const tryAdd = (item: GroceryItem, maxQty: number) => {
    const price = itemPrice(item, year, priceShiftPct);
    while ((basket[item.id] ?? 0) < maxQty && price <= remaining) {
      basket[item.id] = (basket[item.id] ?? 0) + 1;
      remaining -= price;
    }
  };

  const essential = GROCERY_ITEMS.filter((item) => item.priority === 1);
  const standard = GROCERY_ITEMS.filter((item) => item.priority === 2);
  const extras = GROCERY_ITEMS.filter((item) => item.priority === 3);

  for (const item of essential) tryAdd(item, item.typicalQty);
  for (const item of standard) tryAdd(item, item.typicalQty);
  for (const item of extras) tryAdd(item, 1);
  for (const item of [...essential, ...standard])
    tryAdd(item, item.typicalQty * 3);

  return basket;
}

export default function GroceryBasketAffordability() {
  const [selectedYear, setSelectedYear] = useState<number>(
    YEARS[YEARS.length - 1],
  );
  const [budget, setBudget] = useState<number>(500);
  const [priceShiftPct, setPriceShiftPct] = useState<number>(0);
  const [basket, setBasket] = useState<BasketState>({});

  useEffect(() => {
    setBasket(runAutoFill(selectedYear, budget, priceShiftPct));
  }, [selectedYear, budget, priceShiftPct]);

  const pricedItems = useMemo(() => {
    return GROCERY_ITEMS.map((item) => ({
      ...item,
      price: itemPrice(item, selectedYear, priceShiftPct),
    }));
  }, [selectedYear, priceShiftPct]);

  const basketEntries = useMemo(() => {
    return Object.entries(basket)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = pricedItems.find((x) => x.id === id);
        if (!item) return null;
        const total = item.price * qty;
        return { item, qty, total };
      })
      .filter(
        (
          entry,
        ): entry is {
          item: (typeof pricedItems)[number];
          qty: number;
          total: number;
        } => Boolean(entry),
      )
      .sort(
        (a, b) =>
          a.item.priority - b.item.priority ||
          a.item.name.localeCompare(b.item.name),
      );
  }, [basket, pricedItems]);

  const basketTotal = useMemo(
    () => basketEntries.reduce((sum, entry) => sum + entry.total, 0),
    [basketEntries],
  );
  const remaining = budget - basketTotal;

  const affordableCount = useMemo(
    () => pricedItems.filter((item) => item.price <= budget).length,
    [pricedItems, budget],
  );

  const refForChart = useMemo(() => {
    if (basketEntries.length > 0) {
      return basketEntries.map((entry) => ({
        id: entry.item.id,
        qty: entry.qty,
      }));
    }
    return DEFAULT_REF_BASKET;
  }, [basketEntries]);

  const chartTotals = useMemo(() => {
    return YEARS.map((year) => {
      const total = refForChart.reduce((sum, row) => {
        const item = GROCERY_ITEMS.find((x) => x.id === row.id);
        if (!item) return sum;
        return sum + itemPrice(item, year, priceShiftPct) * row.qty;
      }, 0);
      return { year, total };
    });
  }, [refForChart, priceShiftPct]);

  const maxChartTotal = Math.max(...chartTotals.map((x) => x.total), 1);
  const firstTotal = chartTotals[0]?.total ?? 1;
  const activeTotal =
    chartTotals.find((x) => x.year === selectedYear)?.total ?? 0;
  const riseVs1995 = ((activeTotal - firstTotal) / firstTotal) * 100;
  const riseAll =
    ((chartTotals[chartTotals.length - 1].total - firstTotal) / firstTotal) *
    100;

  function refill() {
    setBasket(runAutoFill(selectedYear, budget, priceShiftPct));
  }

  function manualToggle(id: string) {
    const item = pricedItems.find((x) => x.id === id);
    if (!item) return;

    setBasket((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
        return next;
      }

      const rem = budget - basketTotal;
      if (item.price <= rem) {
        next[id] = 1;
      }
      return next;
    });
  }

  function adjustQty(id: string, delta: number) {
    const item = pricedItems.find((x) => x.id === id);
    if (!item) return;

    setBasket((prev) => {
      const currentQty = prev[id] ?? 0;
      const nextQty = currentQty + delta;
      const next = { ...prev };

      if (nextQty <= 0) {
        delete next[id];
        return next;
      }

      if (delta > 0) {
        const currentTotal = Object.entries(prev).reduce(
          (sum, [itemId, qty]) => {
            const found = pricedItems.find((x) => x.id === itemId);
            if (!found) return sum;
            return sum + found.price * qty;
          },
          0,
        );

        const rem = budget - currentTotal;
        if (item.price > rem) {
          return prev;
        }
      }

      next[id] = nextQty;
      return next;
    });
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#2a332e] bg-[#0d0f0e] text-[#e8ede9]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_10%,rgba(201,168,76,0.06),transparent_50%),radial-gradient(ellipse_at_90%_80%,rgba(76,175,130,0.05),transparent_50%)]" />

      <div className="relative z-10 p-6 md:p-8">
        <header className="mb-6 border-b border-[#2a332e] pb-6">
          <div className="mb-3 h-1.5 w-10 rounded bg-[linear-gradient(90deg,#007A4D_33%,#FFB81C_33%_66%,#DE3831_66%)]" />
          <h2 className="font-serif text-3xl font-black leading-tight md:text-5xl">
            The South African{" "}
            <span className="text-[#c9a84c]">Grocery Basket</span>
          </h2>
          <p className="mt-2 text-sm text-[#7a9085]">
            Move budget, switch years, or shift prices. The basket fills
            automatically using a typical household shopping pattern.
          </p>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#2a332e] bg-[#161a18] p-5">
            <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-[#7a9085]">
              Monthly grocery budget
            </p>
            <p className="font-serif text-4xl font-bold text-[#c9a84c]">
              {currencyShort(budget)}
            </p>
            <input
              type="range"
              min={50}
              max={5000}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-4 w-full accent-[#c9a84c]"
            />
            <div className="mt-1 flex justify-between text-[11px] text-[#7a9085]">
              <span>R50</span>
              <span>R5,000</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2a332e] bg-[#161a18] p-5">
            <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[#7a9085]">
              Select year
            </p>
            <div className="flex flex-wrap gap-2">
              {YEARS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={cx(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors",
                    selectedYear === year
                      ? "border-[#c9a84c] bg-[#c9a84c] text-[#0d0f0e]"
                      : "border-[#2a332e] bg-[#1e2420] text-[#7a9085] hover:border-[#c9a84c] hover:text-[#e8ede9]",
                  )}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[11px] text-[#7a9085]">
                <span>Price pressure</span>
                <span>
                  {priceShiftPct > 0 ? "+" : ""}
                  {priceShiftPct}%
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={30}
                step={1}
                value={priceShiftPct}
                onChange={(e) => setPriceShiftPct(Number(e.target.value))}
                className="w-full accent-[#c9a84c]"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#7a9085]">
              All items
              <span className="rounded-full border border-[#2a332e] bg-[#1e2420] px-2 py-0.5 text-[10px] tracking-normal">
                {affordableCount}/{pricedItems.length} affordable
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {pricedItems.map((item) => {
                const qty = basket[item.id] ?? 0;
                const canAffordOne = item.price <= budget;
                const tier =
                  item.priority === 1
                    ? "essential"
                    : item.priority === 2
                      ? "standard"
                      : "extra";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => canAffordOne && manualToggle(item.id)}
                    disabled={!canAffordOne}
                    className={cx(
                      "relative overflow-hidden rounded-xl border p-3 text-left transition-all",
                      "border-[#2a332e] bg-[#161a18] hover:-translate-y-0.5",
                      canAffordOne
                        ? "hover:border-[#3d7a5e]"
                        : "cursor-not-allowed opacity-30",
                      qty > 0 && "border-[#c9a84c] bg-[#1e2420]",
                    )}
                  >
                    {qty > 0 && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a84c] text-[10px] font-bold text-[#0d0f0e]">
                        {qty}
                      </span>
                    )}

                    <span
                      className={cx(
                        "mb-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]",
                        tier === "essential" && "bg-[#4caf822e] text-[#4caf82]",
                        tier === "standard" && "bg-[#c9a84c2a] text-[#c9a84c]",
                        tier === "extra" && "bg-[#7a90852a] text-[#7a9085]",
                      )}
                    >
                      {tier}
                    </span>

                    <div className="mb-1 text-2xl">{item.emoji}</div>
                    <p className="text-sm font-medium leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-[#7a9085]">{item.unit}</p>
                    <p className="mt-1 font-serif text-lg font-bold text-[#c9a84c]">
                      {currency(item.price)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-[#2a332e] bg-[#161a18] p-4">
              <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[#7a9085]">
                Basket cost across all years
              </p>
              <div className="flex h-28 items-end gap-1.5">
                {chartTotals.map((row) => {
                  const h = (row.total / maxChartTotal) * 100;
                  const active = row.year === selectedYear;
                  return (
                    <div
                      key={row.year}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
                    >
                      <div
                        className={cx(
                          "relative w-full rounded-t-sm transition-all",
                          active ? "bg-[#c9a84c]" : "bg-[#3d7a5e]",
                        )}
                        style={{ height: `${Math.max(h, 3)}%` }}
                      >
                        <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded border border-[#2a332e] bg-[#0d0f0e] px-1.5 py-0.5 text-[10px] text-[#e8c97a] group-hover:block">
                          {currencyShort(row.total)}
                        </div>
                      </div>
                      <p className="text-[9px] text-[#7a9085]">{row.year}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 border-t border-[#2a332e] pt-3 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] text-[#7a9085]">1995 cost</p>
                  <p className="font-serif text-base font-bold">
                    {currencyShort(firstTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#7a9085]">
                    {selectedYear} cost
                  </p>
                  <p className="font-serif text-base font-bold">
                    {currencyShort(activeTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#7a9085]">vs 1995</p>
                  <p className="font-serif text-base font-bold text-[#e05c5c]">
                    +{riseVs1995.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#7a9085]">30-yr rise</p>
                  <p className="font-serif text-base font-bold text-[#e05c5c]">
                    +{riseAll.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#2a332e] bg-[#161a18] p-4 lg:sticky lg:top-4">
            <div className="mb-3 flex items-center gap-2 border-b border-[#2a332e] pb-3">
              <span className="text-xl">🛒</span>
              <p className="font-serif text-xl font-bold">My Basket</p>
              <p className="ml-auto text-xs text-[#7a9085]">
                {basketEntries.reduce((sum, entry) => sum + entry.qty, 0)} items
              </p>
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#4caf8240] bg-[#4caf821a] px-3 py-1 text-[10px] text-[#4caf82]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4caf82]" />
              Auto-filled · typical SA household
            </div>

            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {basketEntries.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#7a9085]">
                  <p className="text-3xl">🛍️</p>
                  Increase budget to start filling
                </div>
              ) : (
                basketEntries.map((entry) => (
                  <div
                    key={entry.item.id}
                    className="flex items-center gap-2 rounded-lg bg-[#1e2420] px-2.5 py-2"
                  >
                    <span className="text-lg">{entry.item.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {entry.item.name}
                      </p>
                      <p className="text-[10px] text-[#7a9085]">
                        {entry.qty}× @ {currency(entry.item.price)}
                      </p>
                    </div>
                    <p className="font-serif text-sm font-bold text-[#c9a84c]">
                      {currency(entry.total)}
                    </p>
                    <div className="ml-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => adjustQty(entry.item.id, -1)}
                        className="flex h-5 w-5 items-center justify-center rounded bg-[#2a332e] text-xs hover:bg-[#3d7a5e]"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-[11px] font-semibold">
                        {entry.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustQty(entry.item.id, 1)}
                        className="flex h-5 w-5 items-center justify-center rounded bg-[#2a332e] text-xs hover:bg-[#3d7a5e]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {basketEntries.length > 0 && (
              <div className="mt-3 border-t border-[#2a332e] pt-3">
                <div className="mb-1 flex items-end justify-between">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a9085]">
                    Total
                  </p>
                  <p className="font-serif text-2xl font-bold">
                    {currency(basketTotal)}
                  </p>
                </div>
                <div className="mb-2 flex items-end justify-between">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a9085]">
                    Remaining
                  </p>
                  <p
                    className={cx(
                      "font-serif text-lg font-bold",
                      remaining < 0
                        ? "text-[#e05c5c]"
                        : remaining < budget * 0.05
                          ? "text-[#c9a84c]"
                          : "text-[#4caf82]",
                    )}
                  >
                    {remaining >= 0
                      ? currency(remaining)
                      : `-${currency(Math.abs(remaining))}`}
                  </p>
                </div>

                <div className="mb-3 h-1.5 overflow-hidden rounded bg-[#2a332e]">
                  <div
                    className={cx(
                      "h-full rounded",
                      remaining < 0
                        ? "bg-[#e05c5c]"
                        : "bg-[linear-gradient(90deg,#4caf82,#c9a84c)]",
                    )}
                    style={{
                      width: `${Math.min((basketTotal / budget) * 100, 100)}%`,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={refill}
                  className="w-full rounded-lg border border-[#2a332e] px-3 py-1.5 text-xs text-[#7a9085] transition-colors hover:border-[#4caf82] hover:text-[#4caf82]"
                >
                  ↺ Re-fill automatically
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
