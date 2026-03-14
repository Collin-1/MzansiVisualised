// data/province-house-prices.ts
//
// All the data for Issue #001. Keeping data files separate from components
// makes it easy to update numbers without touching the UI code.
// Sources: Property24, Lightstone, FNB Home Loans, StatsSA (2025)

export type ProvinceCode =
  | "WC"
  | "GP"
  | "KZN"
  | "MP"
  | "LP"
  | "EC"
  | "NW"
  | "NC"
  | "FS";

export interface ProvinceData {
  code: ProvinceCode;
  name: string;
  capital: string;
  avgPrice: number; // ZAR
  yoyGrowth: number; // percentage, e.g. 8.2 = +8.2%
  rank: number; // 1 = most expensive
  color: string; // hex, matches tailwind config
  description: string; // shown in the detail panel
}

export const PROVINCE_DATA: Record<ProvinceCode, ProvinceData> = {
  WC: {
    code: "WC",
    name: "Western Cape",
    capital: "Cape Town",
    avgPrice: 1_800_000,
    yoyGrowth: 8.2,
    rank: 1,
    color: "#C4562A",
    description:
      "SA's most sought-after province. Cape Town's Atlantic Seaboard and the Winelands command near-global prices, driven by semigration, lifestyle appeal, and constrained coastal land supply.",
  },
  GP: {
    code: "GP",
    name: "Gauteng",
    capital: "Johannesburg",
    avgPrice: 1_500_000,
    yoyGrowth: 5.1,
    rank: 2,
    color: "#B84020",
    description:
      "The economic engine of Africa. High demand from professionals and corporate relocations, concentrated in Sandton, Midrand, and the booming East Rand corridors.",
  },
  KZN: {
    code: "KZN",
    name: "KwaZulu-Natal",
    capital: "Pietermaritzburg",
    avgPrice: 1_100_000,
    yoyGrowth: 3.8,
    rank: 3,
    color: "#CF8B50",
    description:
      "Coastal Durban properties anchor the province's high prices. Umhlanga and Ballito rival Cape Town in premium development density, while the Midlands offers value.",
  },
  MP: {
    code: "MP",
    name: "Mpumalanga",
    capital: "Mbombela",
    avgPrice: 980_000,
    yoyGrowth: 2.9,
    rank: 4,
    color: "#C87040",
    description:
      "Gateway to the Kruger, with growing demand from Johannesburg buyers seeking weekend escapes, retirement value, and proximity to Mozambique's coast.",
  },
  LP: {
    code: "LP",
    name: "Limpopo",
    capital: "Polokwane",
    avgPrice: 960_000,
    yoyGrowth: 2.2,
    rank: 5,
    color: "#D4904A",
    description:
      "Agricultural heartland and Big Five country. Polokwane is the commercial hub; prices remain moderate relative to SA's metros despite strong provincial GDP.",
  },
  EC: {
    code: "EC",
    name: "Eastern Cape",
    capital: "Bhisho",
    avgPrice: 950_000,
    yoyGrowth: 2.0,
    rank: 6,
    color: "#D4734A",
    description:
      "Home to Gqeberha and East London, with significant government employment. The Wild Coast remains one of SA's last undervalued coastal frontiers.",
  },
  NW: {
    code: "NW",
    name: "North West",
    capital: "Mahikeng",
    avgPrice: 870_000,
    yoyGrowth: 1.8,
    rank: 7,
    color: "#D4A86A",
    description:
      "Sun City and the platinum mining belt define the province. Rustenburg's mining wealth creates localised demand spikes that skew the provincial average upward.",
  },
  NC: {
    code: "NC",
    name: "Northern Cape",
    capital: "Kimberley",
    avgPrice: 840_000,
    yoyGrowth: 1.5,
    rank: 8,
    color: "#E8C88A",
    description:
      "SA's largest province by area yet least densely populated. Diamond history, Augrabies Falls, and vast Karoo landscapes — low prices reflect limited urban centres.",
  },
  FS: {
    code: "FS",
    name: "Free State",
    capital: "Bloemfontein",
    avgPrice: 800_000,
    yoyGrowth: 1.2,
    rank: 9,
    color: "#EAD39C",
    description:
      "The heartland of South Africa. Affordable prices and Bloemfontein's judicial capital status make this the best value-for-space province in the country.",
  },
};

// Sorted arrays — pre-computed so components don't re-sort on every render
export const PROVINCES_BY_RANK = Object.values(PROVINCE_DATA).sort(
  (a, b) => a.rank - b.rank,
);

export const NATIONAL_MEDIAN = 980_000; // ZAR
