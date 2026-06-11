import type { Transaction } from "@/types/financial";

export type DashboardPeriodType = "all-time" | "month" | "year" | "range";

export const PERIOD_YEAR_OPTIONS = ["2026", "2027", "2028"] as const;

export const PERIOD_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type PeriodMonthName = (typeof PERIOD_MONTH_NAMES)[number];

export interface DashboardPeriodFilter {
  periodType: DashboardPeriodType;
  year: number;
  month: number;
  endMonth: number;
}

export const monthNameToIndex = (name: string): number => {
  const index = PERIOD_MONTH_NAMES.indexOf(name as PeriodMonthName);
  return index >= 0 ? index : new Date().getMonth();
};

export const getDefaultPeriodMonth = (): PeriodMonthName =>
  PERIOD_MONTH_NAMES[new Date().getMonth()];

export const getDefaultPeriodYear = (): string => {
  const currentYear = String(new Date().getFullYear());
  if (
    PERIOD_YEAR_OPTIONS.includes(
      currentYear as (typeof PERIOD_YEAR_OPTIONS)[number],
    )
  ) {
    return currentYear;
  }
  return PERIOD_YEAR_OPTIONS[0];
};

export const getDefaultPeriodState = () => ({
  periodType: "month" as DashboardPeriodType,
  month: getDefaultPeriodMonth(),
  endMonth: "December" as PeriodMonthName,
  year: getDefaultPeriodYear(),
});

export const buildPeriodFilter = (input: {
  periodType: DashboardPeriodType;
  month: string;
  endMonth: string;
  year: string;
}): DashboardPeriodFilter => ({
  periodType: input.periodType,
  year: Number(input.year) || 2026,
  month: monthNameToIndex(input.month),
  endMonth: monthNameToIndex(input.endMonth),
});

export const isTransactionInPeriod = (
  transaction: Transaction,
  filter: DashboardPeriodFilter,
): boolean => {
  if (filter.periodType === "all-time") {
    return true;
  }

  const date = new Date(transaction.timestamp);
  const year = date.getFullYear();
  const month = date.getMonth();

  if (filter.periodType === "year") {
    return year === filter.year;
  }

  if (filter.periodType === "month") {
    return year === filter.year && month === filter.month;
  }

  if (year !== filter.year) {
    return false;
  }

  const start = Math.min(filter.month, filter.endMonth);
  const end = Math.max(filter.month, filter.endMonth);
  return month >= start && month <= end;
};

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  filter: DashboardPeriodFilter,
): Transaction[] =>
  transactions.filter((transaction) =>
    isTransactionInPeriod(transaction, filter),
  );

export const getPeriodDisplayLabel = (filter: DashboardPeriodFilter): string => {
  if (filter.periodType === "all-time") {
    return "All Time";
  }

  if (filter.periodType === "year") {
    return String(filter.year);
  }

  if (filter.periodType === "month") {
    return `${PERIOD_MONTH_NAMES[filter.month]} ${filter.year}`;
  }

  const start = PERIOD_MONTH_NAMES[Math.min(filter.month, filter.endMonth)];
  const end = PERIOD_MONTH_NAMES[Math.max(filter.month, filter.endMonth)];
  return `${start} – ${end} ${filter.year}`;
};

export const filterToDistributionOptions = (
  filter: DashboardPeriodFilter,
): {
  year?: number;
  month?: number;
  endMonth?: number;
} => {
  if (filter.periodType === "all-time") {
    return {};
  }

  if (filter.periodType === "year") {
    return { year: filter.year };
  }

  if (filter.periodType === "month") {
    return { year: filter.year, month: filter.month };
  }

  return {
    year: filter.year,
    month: filter.month,
    endMonth: filter.endMonth,
  };
};

export const getPeriodMonthKeys = (
  filter: DashboardPeriodFilter,
): { year: number; month: number }[] => {
  if (filter.periodType === "all-time") {
    const now = new Date();
    return [{ year: now.getFullYear(), month: now.getMonth() }];
  }

  if (filter.periodType === "month") {
    return [{ year: filter.year, month: filter.month }];
  }

  if (filter.periodType === "year") {
    return PERIOD_MONTH_NAMES.map((_, month) => ({
      year: filter.year,
      month,
    }));
  }

  const start = Math.min(filter.month, filter.endMonth);
  const end = Math.max(filter.month, filter.endMonth);
  const keys: { year: number; month: number }[] = [];
  for (let month = start; month <= end; month += 1) {
    keys.push({ year: filter.year, month });
  }
  return keys;
};

/** Budget sub-category scope key, e.g. `2026-06` for June 2026. */
export const formatBudgetMonthlyPeriod = (
  year: number,
  month: number,
): string => `${year}-${String(month + 1).padStart(2, "0")}`;

export const getBudgetMonthlyPeriodKeys = (
  filter: DashboardPeriodFilter,
): string[] =>
  getPeriodMonthKeys(filter).map(({ year, month }) =>
    formatBudgetMonthlyPeriod(year, month),
  );
