export type LoadSheddingStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;

export interface YearRecord {
  year: number;
  totalHours: number;
  peakStage: LoadSheddingStage;
  daysAffected: number;
  gdpImpactBn: number;
}

export interface MonthRecord {
  year: number;
  month: number;
  avgStage: number;
  hoursLost: number;
}

export interface KeyEvent {
  year: number;
  label: string;
  description: string;
  type: "spike" | "relief" | "policy" | "record";
}

export const YEAR_DATA: YearRecord[] = [
  {
    year: 2007,
    totalHours: 50,
    peakStage: 1,
    daysAffected: 18,
    gdpImpactBn: 0,
  },
  {
    year: 2008,
    totalHours: 310,
    peakStage: 2,
    daysAffected: 60,
    gdpImpactBn: 0,
  },
  { year: 2009, totalHours: 0, peakStage: 0, daysAffected: 0, gdpImpactBn: 0 },
  { year: 2010, totalHours: 0, peakStage: 0, daysAffected: 0, gdpImpactBn: 0 },
  { year: 2011, totalHours: 0, peakStage: 0, daysAffected: 0, gdpImpactBn: 0 },
  { year: 2012, totalHours: 0, peakStage: 0, daysAffected: 0, gdpImpactBn: 0 },
  { year: 2013, totalHours: 0, peakStage: 0, daysAffected: 0, gdpImpactBn: 0 },
  {
    year: 2014,
    totalHours: 420,
    peakStage: 2,
    daysAffected: 80,
    gdpImpactBn: 0,
  },
  {
    year: 2015,
    totalHours: 780,
    peakStage: 3,
    daysAffected: 146,
    gdpImpactBn: 0,
  },
  {
    year: 2016,
    totalHours: 120,
    peakStage: 2,
    daysAffected: 32,
    gdpImpactBn: 0,
  },
  { year: 2017, totalHours: 0, peakStage: 0, daysAffected: 0, gdpImpactBn: 0 },
  { year: 2018, totalHours: 0, peakStage: 0, daysAffected: 0, gdpImpactBn: 0 },
  {
    year: 2019,
    totalHours: 530,
    peakStage: 2,
    daysAffected: 97,
    gdpImpactBn: 0,
  },
  {
    year: 2020,
    totalHours: 860,
    peakStage: 3,
    daysAffected: 148,
    gdpImpactBn: 1.8,
  },
  {
    year: 2021,
    totalHours: 1180,
    peakStage: 4,
    daysAffected: 210,
    gdpImpactBn: 3.2,
  },
  {
    year: 2022,
    totalHours: 3776,
    peakStage: 6,
    daysAffected: 289,
    gdpImpactBn: 24.1,
  },
  {
    year: 2023,
    totalHours: 6829,
    peakStage: 6,
    daysAffected: 335,
    gdpImpactBn: 56.0,
  },
  {
    year: 2024,
    totalHours: 2100,
    peakStage: 5,
    daysAffected: 180,
    gdpImpactBn: 18.4,
  },
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function monthRecord(
  year: number,
  month: number,
  avgStage: number,
): MonthRecord {
  return {
    year,
    month,
    avgStage,
    hoursLost: Math.round(avgStage * 2 * daysInMonth(year, month)),
  };
}

export const MONTH_DATA: MonthRecord[] = [
  monthRecord(2022, 1, 1.2),
  monthRecord(2022, 2, 1.6),
  monthRecord(2022, 3, 2.0),
  monthRecord(2022, 4, 2.4),
  monthRecord(2022, 5, 2.7),
  monthRecord(2022, 6, 3.2),
  monthRecord(2022, 7, 3.9),
  monthRecord(2022, 8, 4.4),
  monthRecord(2022, 9, 4.9),
  monthRecord(2022, 10, 5.3),
  monthRecord(2022, 11, 5.8),
  monthRecord(2022, 12, 6.0),

  monthRecord(2023, 1, 5.4),
  monthRecord(2023, 2, 5.6),
  monthRecord(2023, 3, 5.7),
  monthRecord(2023, 4, 5.8),
  monthRecord(2023, 5, 6.0),
  monthRecord(2023, 6, 6.0),
  monthRecord(2023, 7, 5.9),
  monthRecord(2023, 8, 5.8),
  monthRecord(2023, 9, 5.7),
  monthRecord(2023, 10, 5.3),
  monthRecord(2023, 11, 4.9),
  monthRecord(2023, 12, 4.5),

  monthRecord(2024, 1, 4.0),
  monthRecord(2024, 2, 3.6),
  monthRecord(2024, 3, 3.1),
  monthRecord(2024, 4, 2.7),
  monthRecord(2024, 5, 2.3),
  monthRecord(2024, 6, 1.8),
  monthRecord(2024, 7, 1.3),
  monthRecord(2024, 8, 1.0),
  monthRecord(2024, 9, 0.6),
  monthRecord(2024, 10, 0.4),
  monthRecord(2024, 11, 0.3),
  monthRecord(2024, 12, 0.2),
];

export const KEY_EVENTS: KeyEvent[] = [
  {
    year: 2008,
    type: "spike",
    label: "Eskom capacity crisis begins",
    description:
      "Years of under-investment in generation capacity caused the first major shortfall. Eskom warned of a decade-long problem.",
  },
  {
    year: 2015,
    type: "record",
    label: "First Stage 3 declared",
    description:
      "South Africa experienced its most severe load-shedding to date, with Stage 3 cutting up to 3,000MW from the national grid.",
  },
  {
    year: 2020,
    type: "policy",
    label: "Stage 4 normalised",
    description:
      "During COVID-19, reduced industrial demand briefly eased pressure. But ageing Eskom plants pushed the country to Stage 4 for the first time.",
  },
  {
    year: 2022,
    type: "record",
    label: "Stage 6 - new worst ever",
    description:
      "The single worst year in SA history. Eskom's fleet availability collapsed below 50%, leaving 335 days with at least some level of shedding.",
  },
  {
    year: 2024,
    type: "relief",
    label: "Improvement begins",
    description:
      "New private generation capacity, gas-to-power plants, and improved Eskom maintenance brought a meaningful reduction in total hours lost.",
  },
];

export const WORST_YEAR = 2023;
export const TOTAL_HOURS_LOST = YEAR_DATA.reduce(
  (sum, d) => sum + d.totalHours,
  0,
);
