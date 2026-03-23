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

type Tier = 1 | 2 | 3;

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

function computeTotal(
  state: BasketState,
  year: number,
  priceShiftPct: number,
): number {
  return Object.entries(state).reduce((sum, [id, qty]) => {
    const item = GROCERY_ITEMS.find((x) => x.id === id);
    if (!item) return sum;
    return sum + itemPrice(item, year, priceShiftPct) * qty;
  }, 0);
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

  const essentials = GROCERY_ITEMS.filter((item) => item.priority === 1);
  const standards = GROCERY_ITEMS.filter((item) => item.priority === 2);
  const extras = GROCERY_ITEMS.filter((item) => item.priority === 3);

  for (const item of essentials) tryAdd(item, item.typicalQty);
  for (const item of standards) tryAdd(item, item.typicalQty);
  for (const item of extras) tryAdd(item, 1);
  for (const item of [...essentials, ...standards])
    tryAdd(item, item.typicalQty * 3);

  return basket;
}

function tierLabel(priority: Tier): string {
  if (priority === 1) return "Essentials first";
  if (priority === 2) return "Typical add-ons";
  return "Stretch items";
}

export default function GroceryBasketAffordability() {
  const [selectedYear, setSelectedYear] = useState<number>(
    YEARS[YEARS.length - 1],
  );
  const [budget, setBudget] = useState<number>(1500);
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

  const groupedItems = useMemo(() => {
    return {
      1: pricedItems.filter((item) => item.priority === 1),
      2: pricedItems.filter((item) => item.priority === 2),
      3: pricedItems.filter((item) => item.priority === 3),
    } as Record<Tier, typeof pricedItems>;
  }, [pricedItems]);

  const basketEntries = useMemo(() => {
    return Object.entries(basket)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = pricedItems.find((x) => x.id === id);
        if (!item) return null;
        return {
          item,
          qty,
          total: item.price * qty,
        };
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
    () => basketEntries.reduce((sum, row) => sum + row.total, 0),
    [basketEntries],
  );
  const remaining = budget - basketTotal;

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

  const totalUnits = basketEntries.reduce((sum, row) => sum + row.qty, 0);
  const affordableCount = pricedItems.filter(
    (item) => item.price <= budget,
  ).length;

  function refillAuto() {
    setBasket(runAutoFill(selectedYear, budget, priceShiftPct));
  }

  function toggleItem(itemId: string) {
    const item = pricedItems.find((x) => x.id === itemId);
    if (!item) return;

    setBasket((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
        return next;
      }

      const rem = budget - computeTotal(prev, selectedYear, priceShiftPct);
      if (item.price <= rem) {
        next[itemId] = 1;
      }
      return next;
    });
  }

  function adjustQty(itemId: string, delta: number) {
    const item = pricedItems.find((x) => x.id === itemId);
    if (!item) return;

    setBasket((prev) => {
      const current = prev[itemId] ?? 0;
      const nextQty = current + delta;
      const next = { ...prev };

      if (nextQty <= 0) {
        delete next[itemId];
        return next;
      }

      if (delta > 0) {
        const rem = budget - computeTotal(prev, selectedYear, priceShiftPct);
        if (item.price > rem) return prev;
      }

      next[itemId] = nextQty;
      return next;
    });
  }

  return (
    <section className="rounded-2xl border border-brand-bark/20 bg-brand-earth-2 text-brand-bark shadow-sm">
      <div className="border-b border-brand-bark/20 p-5 md:p-6">
        <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-brand-ash">
          Issue 003
        </p>
        <h2 className="font-serif text-3xl leading-tight text-brand-bark md:text-4xl">
          SA Grocery Basket Simulator
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-brand-ash">
          Different mode: build-by-tier. As you change year, budget, and price
          pressure, the model auto-fills essentials first, then expands the
          basket. You can still manually tweak quantities to test your own
          strategy.
        </p>
      </div>

      <div className="grid gap-4 border-b border-brand-bark/20 p-5 md:grid-cols-3 md:p-6">
        <div className="rounded-xl border border-brand-bark/20 bg-brand-earth p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-brand-ash">
            Budget
          </p>
          <p className="font-serif text-3xl text-brand-gold">
            {currencyShort(budget)}
          </p>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-3 w-full accent-brand-gold"
          />
          <div className="mt-1 flex justify-between text-[11px] text-brand-ash">
            <span>R50</span>
            <span>R5,000</span>
          </div>
        </div>

        <div className="rounded-xl border border-brand-bark/20 bg-brand-earth p-4">
          <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-brand-ash">
            Year
          </p>
          <div className="flex flex-wrap gap-2">
            {YEARS.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={cx(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  selectedYear === year
                    ? "border-brand-gold bg-brand-gold text-white"
                    : "border-brand-bark/25 bg-white/70 text-brand-ash hover:text-brand-bark",
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-brand-bark/20 bg-brand-earth p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-brand-ash">
            Price pressure
          </p>
          <p className="font-serif text-3xl text-brand-gold">
            {priceShiftPct > 0 ? "+" : ""}
            {priceShiftPct}%
          </p>
          <input
            type="range"
            min={-20}
            max={30}
            step={1}
            value={priceShiftPct}
            onChange={(e) => setPriceShiftPct(Number(e.target.value))}
            className="mt-3 w-full accent-brand-gold"
          />
          <div className="mt-2 flex gap-2">
            {[-10, 0, 15].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriceShiftPct(value)}
                className={cx(
                  "rounded-full border px-2.5 py-1 text-[11px]",
                  priceShiftPct === value
                    ? "border-brand-gold bg-brand-gold text-white"
                    : "border-brand-bark/25 bg-white/70 text-brand-ash",
                )}
              >
                {value > 0 ? "+" : ""}
                {value}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr] md:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-brand-bark/20 bg-brand-earth p-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-brand-ash">
                Live basket status
              </p>
              <p className="text-sm text-brand-bark">
                {totalUnits} items in basket · {affordableCount}/
                {pricedItems.length} can be bought with this budget.
              </p>
            </div>
            <button
              type="button"
              onClick={refillAuto}
              className="rounded-full border border-brand-bark/25 bg-white/80 px-4 py-1.5 text-xs text-brand-bark transition-colors hover:border-brand-gold hover:text-brand-gold"
            >
              Refill auto
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {([1, 2, 3] as Tier[]).map((tier) => (
              <div
                key={tier}
                className="rounded-xl border border-brand-bark/20 bg-brand-earth p-3"
              >
                <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-brand-ash">
                  {tierLabel(tier)}
                </p>
                <div className="space-y-2">
                  {groupedItems[tier].map((item) => {
                    const qty = basket[item.id] ?? 0;
                    const affordable = item.price <= budget;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => affordable && toggleItem(item.id)}
                        disabled={!affordable}
                        className={cx(
                          "w-full rounded-lg border px-2.5 py-2 text-left transition-colors",
                          qty > 0
                            ? "border-brand-gold/40 bg-brand-gold/10"
                            : "border-brand-bark/15 bg-white/70 hover:border-brand-bark/35",
                          !affordable && "cursor-not-allowed opacity-45",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-brand-bark">
                              {item.emoji} {item.name}
                            </p>
                            <p className="text-[11px] text-brand-ash">
                              {item.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-serif text-base text-brand-gold">
                              {currency(item.price)}
                            </p>
                            {qty > 0 && (
                              <p className="text-[11px] text-brand-ash">
                                qty {qty}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-brand-bark/20 bg-brand-earth p-4">
            <p className="mb-3 text-[11px] uppercase tracking-[0.12em] text-brand-ash">
              Basket cost timeline
            </p>
            <div className="flex h-24 items-end gap-1">
              {chartTotals.map((row) => {
                const isActive = row.year === selectedYear;
                const h = (row.total / maxChartTotal) * 100;
                return (
                  <div
                    key={row.year}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div
                      className={cx(
                        "relative w-full rounded-t-sm transition-all",
                        isActive ? "bg-brand-gold" : "bg-brand-bark/55",
                      )}
                      style={{ height: `${Math.max(4, h)}%` }}
                    >
                      <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded border border-brand-bark/20 bg-white px-1.5 py-0.5 text-[10px] text-brand-bark group-hover:block">
                        {currencyShort(row.total)}
                      </span>
                    </div>
                    <span className="text-[9px] text-brand-ash">
                      {row.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-xl border border-brand-bark/20 bg-brand-earth p-4 lg:sticky lg:top-4">
          <div className="mb-3 border-b border-brand-bark/20 pb-3">
            <p className="font-serif text-2xl text-brand-bark">
              Basket Receipt
            </p>
            <p className="text-xs text-brand-ash">
              Auto-filled from SA household priorities, then adjustable by you.
            </p>
          </div>

          <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
            {basketEntries.length === 0 ? (
              <p className="rounded-lg border border-brand-bark/15 bg-white/70 px-3 py-6 text-center text-sm text-brand-ash">
                Increase budget to populate the basket.
              </p>
            ) : (
              basketEntries.map((entry) => (
                <div
                  key={entry.item.id}
                  className="rounded-lg border border-brand-bark/15 bg-white/80 px-3 py-2"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-brand-bark">
                      {entry.item.emoji} {entry.item.name}
                    </p>
                    <p className="font-serif text-sm text-brand-gold">
                      {currency(entry.total)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-brand-ash">
                      {currency(entry.item.price)} each
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => adjustQty(entry.item.id, -1)}
                        className="flex h-5 w-5 items-center justify-center rounded bg-brand-bark/15 text-xs text-brand-bark hover:bg-brand-bark/25"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-xs font-semibold text-brand-bark">
                        {entry.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustQty(entry.item.id, 1)}
                        className="flex h-5 w-5 items-center justify-center rounded bg-brand-bark/15 text-xs text-brand-bark hover:bg-brand-bark/25"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 border-t border-brand-bark/20 pt-3">
            <div className="mb-1 flex items-end justify-between">
              <span className="text-[11px] uppercase tracking-[0.1em] text-brand-ash">
                Total
              </span>
              <span className="font-serif text-2xl text-brand-bark">
                {currency(basketTotal)}
              </span>
            </div>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-[11px] uppercase tracking-[0.1em] text-brand-ash">
                Remaining
              </span>
              <span
                className={cx(
                  "font-serif text-lg",
                  remaining < 0
                    ? "text-[#c4562a]"
                    : remaining < budget * 0.08
                      ? "text-brand-gold"
                      : "text-[#2f6a4e]",
                )}
              >
                {remaining >= 0
                  ? currency(remaining)
                  : `-${currency(Math.abs(remaining))}`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-brand-bark/15">
              <div
                className={cx(
                  "h-full rounded",
                  remaining < 0
                    ? "bg-[#c4562a]"
                    : "bg-[linear-gradient(90deg,#2f6a4e,#13795b)]",
                )}
                style={{
                  width: `${Math.min((basketTotal / budget) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
