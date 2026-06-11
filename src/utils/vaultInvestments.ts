import type {
  InvestmentReturn,
  InvestmentReturnType,
  VaultInvestment,
} from "@/types/investments";
import {
  isTransactionInPeriod,
  type DashboardPeriodFilter,
} from "@/utils/periodFilter";

const STORAGE_KEY = "vault-investments";

const toPeriodTimestamp = (date: string): string => `${date}T12:00:00.000Z`;

const isInvestmentDateInPeriod = (
  date: string,
  filter: DashboardPeriodFilter,
): boolean =>
  isTransactionInPeriod(
    {
      id: "period-check",
      timestamp: toPeriodTimestamp(date),
      merchantOrLabel: "",
      amount: 0,
      category: "SAVINGS",
      direction: "DEBIT",
      status: "COMPLETED",
    },
    filter,
  );

interface PeriodBounds {
  start: Date;
  end: Date;
}

const getPeriodBounds = (
  filter: DashboardPeriodFilter,
): PeriodBounds | null => {
  if (filter.periodType === "all-time") {
    return null;
  }

  if (filter.periodType === "year") {
    return {
      start: new Date(filter.year, 0, 1, 0, 0, 0, 0),
      end: new Date(filter.year, 11, 31, 23, 59, 59, 999),
    };
  }

  if (filter.periodType === "month") {
    return {
      start: new Date(filter.year, filter.month, 1, 0, 0, 0, 0),
      end: new Date(filter.year, filter.month + 1, 0, 23, 59, 59, 999),
    };
  }

  const startMonth = Math.min(filter.month, filter.endMonth);
  const endMonth = Math.max(filter.month, filter.endMonth);

  return {
    start: new Date(filter.year, startMonth, 1, 0, 0, 0, 0),
    end: new Date(filter.year, endMonth + 1, 0, 23, 59, 59, 999),
  };
};

const isOnOrBeforePeriodEnd = (
  date: string,
  bounds: PeriodBounds,
): boolean => new Date(toPeriodTimestamp(date)) <= bounds.end;

const filterReturnsForPeriod = (
  investment: VaultInvestment,
  filter: DashboardPeriodFilter,
): InvestmentReturn[] => {
  if (filter.periodType === "all-time") {
    return investment.returns;
  }

  return investment.returns.filter((item) =>
    isInvestmentDateInPeriod(item.date, filter),
  );
};

export const isInvestmentInPeriod = (
  investment: VaultInvestment,
  filter: DashboardPeriodFilter,
): boolean => {
  if (filter.periodType === "all-time") {
    return true;
  }

  if (isInvestmentDateInPeriod(investment.date, filter)) {
    return true;
  }

  if (
    investment.returns.some((item) => isInvestmentDateInPeriod(item.date, filter))
  ) {
    return true;
  }

  const bounds = getPeriodBounds(filter);
  if (!bounds) {
    return true;
  }

  const isParentBuy =
    !investment.parentId && investment.transactionType === "buy";

  if (!isParentBuy) {
    return false;
  }

  if (!isOnOrBeforePeriodEnd(investment.date, bounds)) {
    return false;
  }

  return investment.amount > 0 || investment.returns.length > 0;
};

export const filterInvestmentsByPeriod = (
  investments: VaultInvestment[],
  filter: DashboardPeriodFilter,
): VaultInvestment[] =>
  investments.filter((investment) => isInvestmentInPeriod(investment, filter));

/** Filters visible investments and scopes return history to the active period. */
export const scopeInvestmentsToPeriod = (
  investments: VaultInvestment[],
  filter: DashboardPeriodFilter,
): VaultInvestment[] =>
  filterInvestmentsByPeriod(investments, filter).map((investment) => ({
    ...investment,
    returns: filterReturnsForPeriod(investment, filter),
  }));

export const createInvestmentId = (): string =>
  `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createReturnId = (): string =>
  `ret-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const readVaultInvestments = (): VaultInvestment[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as VaultInvestment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeVaultInvestments = (investments: VaultInvestment[]): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
};

export const clearVaultInvestmentsLocal = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

export interface InvestmentReturnTotals {
  totalPayouts: number;
  incomePayouts: number;
  netProfit: number;
  netProfitPercent: number;
  currentCapital: number;
  initialInvestment: number;
  /** @deprecated Use netProfit — kept for callers migrating gradually. */
  realizedGain: number;
  /** @deprecated Use currentCapital */
  remainingCapital: number;
}

const isIncomeReturnType = (type: InvestmentReturnType): boolean =>
  type === "dividend" || type === "interest";

const sortedReturns = (investment: VaultInvestment): InvestmentReturn[] =>
  [...investment.returns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

/** Original buy principal (unchanged after sell/liquidation). */
export const getInvestmentInitialCapital = (
  investment: VaultInvestment,
): number => {
  if (investment.initialAmount != null && investment.initialAmount > 0) {
    return investment.initialAmount;
  }

  const isBuyParent =
    !investment.parentId && investment.transactionType === "buy";

  if (!isBuyParent) {
    return investment.amount;
  }

  const sellProceeds = investment.returns
    .filter((item) => item.type === "sell")
    .reduce((sum, item) => sum + item.amount, 0);

  return investment.amount + sellProceeds;
};

/**
 * (current capital + total payouts) − initial investment.
 * Selling at cost shows ~0% instead of a fake −100% loss.
 */
export const computeInvestmentNetProfit = (
  investment: VaultInvestment,
): number => {
  const isBuyParent =
    !investment.parentId && investment.transactionType === "buy";

  if (!isBuyParent) {
    return 0;
  }

  const currentCapital = investment.amount;
  const initialInvestment = getInvestmentInitialCapital(investment);
  const totalPayouts =
    investment.totalPayouts ??
    investment.returns.reduce((sum, item) => sum + item.amount, 0);

  return currentCapital + totalPayouts - initialInvestment;
};

/** Cash received and gain/loss broken down by return type. */
export const computeInvestmentReturnTotals = (
  investment: VaultInvestment,
): InvestmentReturnTotals => {
  const isBuyParent =
    !investment.parentId && investment.transactionType === "buy";

  let incomePayouts = 0;

  for (const item of sortedReturns(investment)) {
    if (isIncomeReturnType(item.type)) {
      incomePayouts += item.amount;
    }
  }

  if (
    investment.transactionType === "dividend" ||
    investment.transactionType === "interest"
  ) {
    incomePayouts += investment.amount;
  }

  const totalPayouts =
    investment.totalPayouts ??
    investment.returns.reduce((sum, item) => sum + item.amount, 0);

  const currentCapital = isBuyParent ? investment.amount : 0;
  const initialInvestment = getInvestmentInitialCapital(investment);
  const netProfit = isBuyParent
    ? currentCapital + totalPayouts - initialInvestment
    : 0;
  const netProfitPercent =
    isBuyParent && initialInvestment > 0
      ? (netProfit / initialInvestment) * 100
      : 0;

  return {
    totalPayouts,
    incomePayouts,
    netProfit,
    netProfitPercent,
    currentCapital,
    initialInvestment,
    realizedGain: netProfit,
    remainingCapital: currentCapital,
  };
};

export const sumInvestmentIncomePayouts = (
  investment: VaultInvestment,
): number => computeInvestmentReturnTotals(investment).incomePayouts;

export const sumInvestmentTotalPayouts = (
  investment: VaultInvestment,
): number => computeInvestmentReturnTotals(investment).totalPayouts;

export const computeInvestmentRealizedGain = (
  investment: VaultInvestment,
): number => computeInvestmentReturnTotals(investment).realizedGain;

export const getInvestmentRemainingCapital = (
  investment: VaultInvestment,
): number => computeInvestmentReturnTotals(investment).remainingCapital;

export interface InvestmentMetrics {
  capital: number;
  payouts: number;
  profit: number;
  positions: number;
}

export const computeInvestmentMetrics = (
  investments: VaultInvestment[],
): InvestmentMetrics => {
  const parents = investments.filter(
    (investment) =>
      !investment.parentId &&
      (investment.transactionType === "buy" ||
        investment.transactionType === "sell"),
  );

  const capital = parents.reduce((sum, investment) => {
    if (investment.transactionType === "sell") {
      return sum - investment.amount;
    }
    return sum + investment.amount;
  }, 0);

  const payouts = investments.reduce(
    (sum, investment) => sum + sumInvestmentIncomePayouts(investment),
    0,
  );

  return {
    capital,
    payouts,
    profit: payouts - Math.max(0, capital),
    positions: parents.filter((investment) => investment.transactionType === "buy")
      .length,
  };
};

export const getReturnsByInvestment = (
  investments: VaultInvestment[],
): { name: string; total: number }[] =>
  investments
    .filter((investment) => !investment.parentId)
    .map((investment) => ({
      name: investment.name,
      total: sumInvestmentIncomePayouts(investment),
    }));

export const getPortfolioGrowthPoints = (
  investments: VaultInvestment[],
): { label: string; dateLabel: string; capital: number; returns: number }[] => {
  const events: { date: string; capital: number; returns: number }[] = [];
  const remainingCapitalById = new Map<string, number>();

  for (const investment of investments) {
    const isBuyParent =
      !investment.parentId && investment.transactionType === "buy";

    if (investment.transactionType === "buy" && !investment.parentId) {
      const originalBuyAmount = getInvestmentInitialCapital(investment);
      remainingCapitalById.set(investment.id, originalBuyAmount);
      events.push({
        date: investment.date,
        capital: originalBuyAmount,
        returns: 0,
      });
    } else if (investment.transactionType === "sell") {
      events.push({
        date: investment.date,
        capital: -investment.amount,
        returns: 0,
      });
    }

    if (
      investment.transactionType === "dividend" ||
      investment.transactionType === "interest"
    ) {
      events.push({
        date: investment.date,
        capital: 0,
        returns: investment.amount,
      });
    }

    for (const item of sortedReturns(investment)) {
      if (isIncomeReturnType(item.type)) {
        if (isBuyParent) {
          const remaining = remainingCapitalById.get(investment.id) ?? 0;
          const returnOfCapital = Math.min(item.amount, remaining);
          remainingCapitalById.set(
            investment.id,
            Math.max(0, remaining - returnOfCapital),
          );
        }
        events.push({
          date: item.date,
          capital: 0,
          returns: item.amount,
        });
        continue;
      }

      if (item.type === "sell" && isBuyParent) {
        const remaining = remainingCapitalById.get(investment.id) ?? 0;
        const costAllocated = Math.min(item.amount, remaining);
        remainingCapitalById.set(
          investment.id,
          Math.max(0, remaining - costAllocated),
        );
        events.push({
          date: item.date,
          capital: -costAllocated,
          returns: 0,
        });
      }
    }
  }

  const mergedByDate = new Map<string, { capital: number; returns: number }>();
  for (const event of events) {
    const existing = mergedByDate.get(event.date) ?? { capital: 0, returns: 0 };
    mergedByDate.set(event.date, {
      capital: existing.capital + event.capital,
      returns: existing.returns + event.returns,
    });
  }

  const sortedDates = [...mergedByDate.keys()].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const formatGrowthAxisLabel = (dateStr: string): string => {
    const date = new Date(`${dateStr}T12:00:00.000Z`);
    const sameMonthDates = sortedDates.filter((candidate) => {
      const candidateDate = new Date(`${candidate}T12:00:00.000Z`);
      return (
        candidateDate.getUTCFullYear() === date.getUTCFullYear() &&
        candidateDate.getUTCMonth() === date.getUTCMonth()
      );
    });

    if (sameMonthDates.length > 1) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  let runningCapital = 0;
  let runningReturns = 0;

  return sortedDates.map((date) => {
    const delta = mergedByDate.get(date)!;
    runningCapital = Math.max(0, runningCapital + delta.capital);
    runningReturns += delta.returns;

    const pointDate = new Date(`${date}T12:00:00.000Z`);
    return {
      label: formatGrowthAxisLabel(date),
      dateLabel: pointDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      capital: runningCapital,
      returns: runningReturns,
    };
  });
};

export const appendInvestmentReturn = (
  investments: VaultInvestment[],
  investmentId: string,
  payload: Omit<InvestmentReturn, "id">,
): VaultInvestment[] =>
  investments.map((investment) =>
    investment.id === investmentId
      ? {
          ...investment,
          returns: [
            ...investment.returns,
            { ...payload, id: createReturnId() },
          ],
    }
      : investment,
  );

export const exportInvestmentsCsv = (investments: VaultInvestment[]): string => {
  const header = "Name,Type,Transaction,Amount,Date,Notes,Role";
  const rows = investments.map((investment) => {
    const role = investment.parentId ? "Child" : "Parent";
    return [
      investment.name,
      investment.type,
      investment.transactionType,
      investment.amount,
      investment.date,
      investment.notes ?? "",
      role,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
  });
  return [header, ...rows].join("\n");
};
