import type { Transaction } from "@/types/financial";
import {
  computeBirFlatTax,
  computePagIbigEmployeeShare,
  computePhilHealthEmployeeShare,
  computeSssEmployeeShare,
} from "@/utils/philippineDeductions";
import {
  getPeriodMonthKeys,
  type DashboardPeriodFilter,
} from "@/utils/periodFilter";
import { sumLifestyleSpend } from "@/utils/expenseLedger";
import {
  isPayRecord,
  isPayRecordIncome,
  sumPayRecordDeductions,
  sumPayRecordDeductionsForMonth,
  sumPayRecordIncome,
  sumPayRecordIncomeForMonth,
} from "@/utils/payRecords";

export interface DashboardPayMetrics {
  basicSalary: number;
  additionalPay: number;
  totalEntitlements: number;
  totalDeductions: number;
  netPay: number;
}

const isSalaryIncomeRecord = (transaction: Transaction): boolean =>
  isPayRecordIncome(transaction) &&
  transaction.recordCategory?.trim().toLowerCase() === "salary";

/** Payroll totals from pay records only (income & deductions), not lifestyle expenses. */
export const computePayMetrics = (
  transactions: Transaction[],
): DashboardPayMetrics => {
  const totalEntitlements = Math.max(0, sumPayRecordIncome(transactions));
  const totalDeductions = Math.max(0, sumPayRecordDeductions(transactions));
  const netPay = Math.max(0, totalEntitlements - totalDeductions);

  const basicSalary = transactions
    .filter(isSalaryIncomeRecord)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const additionalPay = Math.max(0, totalEntitlements - basicSalary);

  return {
    basicSalary: Math.max(0, basicSalary),
    additionalPay,
    totalEntitlements,
    totalDeductions,
    netPay,
  };
};

export interface RevenuePlotPoint {
  label: string;
  value: number;
  xPercent: number;
  yPercent: number;
}

const MONTH_LABELS = [
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

export interface RevenueChartPoint {
  period: string;
  income: number;
  deductions: number;
  expenses: number;
  net: number;
}

/** Last six months of pay income, deductions, lifestyle spend, and net pay. */
export const buildRevenueChartData = (
  transactions: Transaction[],
): RevenueChartPoint[] => {
  const now = new Date();
  const points: RevenueChartPoint[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const income = sumPayRecordIncomeForMonth(transactions, year, month);
    const deductions = sumPayRecordDeductionsForMonth(
      transactions,
      year,
      month,
    );
    const expenses = sumLifestyleSpend(transactions, { year, month });

    points.push({
      period: `${MONTH_LABELS[month] ?? "—"} ${year}`,
      income,
      deductions,
      expenses,
      net: Math.max(0, income - deductions),
    });
  }

  return points;
};

export const buildRevenueChartDataForPeriod = (
  transactions: Transaction[],
  filter: DashboardPeriodFilter,
): RevenueChartPoint[] => {
  if (filter.periodType === "all-time") {
    return buildRevenueChartData(transactions);
  }

  const monthKeys = getPeriodMonthKeys(filter);

  return monthKeys.map(({ year, month }) => {
    const income = sumPayRecordIncomeForMonth(transactions, year, month);
    const deductions = sumPayRecordDeductionsForMonth(
      transactions,
      year,
      month,
    );
    const expenses = sumLifestyleSpend(transactions, { year, month });

    return {
      period: `${MONTH_LABELS[month] ?? "—"} ${year}`,
      income,
      deductions,
      expenses,
      net: Math.max(0, income - deductions),
    };
  });
};

export interface PeriodGovernmentContributions {
  sss: number;
  philHealth: number;
  pagIbig: number;
  birTax: number;
  periodGrossIncome: number;
  governmentEmployeeShare: number;
  totalDeductions: number;
  monthCount: number;
}

const collectPayIncomeMonthKeys = (
  transactions: Transaction[],
): { year: number; month: number }[] => {
  const keys = new Set<string>();

  for (const transaction of transactions) {
    if (!isPayRecord(transaction) || transaction.direction !== "CREDIT") {
      continue;
    }
    const date = new Date(transaction.timestamp);
    keys.add(`${date.getFullYear()}:${date.getMonth()}`);
  }

  return [...keys]
    .map((key) => {
      const [year, month] = key.split(":").map(Number);
      return { year, month };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
};

const resolveGovernmentContributionMonthKeys = (
  transactions: Transaction[],
  filter: DashboardPeriodFilter,
): { year: number; month: number }[] => {
  if (filter.periodType === "all-time") {
    const incomeMonths = collectPayIncomeMonthKeys(transactions);
    if (incomeMonths.length > 0) {
      return incomeMonths;
    }

    const now = new Date();
    return [{ year: now.getFullYear(), month: now.getMonth() }];
  }

  return getPeriodMonthKeys(filter);
};

/** SSS, PhilHealth, Pag-IBIG, and BIR withholding totals for the active dashboard period. */
export const computeGovernmentContributionsForPeriod = (
  transactions: Transaction[],
  filter: DashboardPeriodFilter,
  fallbackMonthlyGross = 0,
): PeriodGovernmentContributions => {
  const monthKeys = resolveGovernmentContributionMonthKeys(transactions, filter);

  let sss = 0;
  let philHealth = 0;
  let pagIbig = 0;
  let birTax = 0;
  let periodGrossIncome = 0;

  for (const { year, month } of monthKeys) {
    let monthlyIncome = sumPayRecordIncomeForMonth(transactions, year, month);

    if (
      monthlyIncome <= 0 &&
      filter.periodType === "month" &&
      monthKeys.length === 1
    ) {
      monthlyIncome = fallbackMonthlyGross;
    }

    periodGrossIncome += monthlyIncome;
    sss += computeSssEmployeeShare(monthlyIncome);
    philHealth += computePhilHealthEmployeeShare(monthlyIncome);
    pagIbig += computePagIbigEmployeeShare(monthlyIncome);
    birTax += computeBirFlatTax(monthlyIncome);
  }

  const governmentEmployeeShare = sss + philHealth + pagIbig;

  return {
    sss,
    philHealth,
    pagIbig,
    birTax,
    periodGrossIncome,
    governmentEmployeeShare,
    totalDeductions: governmentEmployeeShare + birTax,
    monthCount: monthKeys.length,
  };
};

export const buildRevenuePlotPoints = (
  grossMonthlyIncome: number,
  transactions: Transaction[],
): RevenuePlotPoint[] => {
  const now = new Date();
  const months: { label: string; value: number }[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const creditsInMonth = transactions
      .filter((transaction) => {
        if (transaction.direction !== "CREDIT" || isPayRecord(transaction)) {
          return false;
        }
        const transactionDate = new Date(transaction.timestamp);
        return (
          transactionDate.getMonth() === monthIndex &&
          transactionDate.getFullYear() === year
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const baseline =
      offset === 0 && monthIndex === now.getMonth() && year === now.getFullYear()
        ? grossMonthlyIncome
        : 0;
    months.push({
      label: MONTH_LABELS[monthIndex] ?? "—",
      value: baseline + creditsInMonth,
    });
  }

  const maxValue = Math.max(...months.map((month) => month.value), 1);

  return months.map((month, index) => ({
    label: month.label,
    value: month.value,
    xPercent: (index / Math.max(months.length - 1, 1)) * 100,
    yPercent: 100 - (month.value / maxValue) * 80,
  }));
};

export const computeSavingsRatePercent = (
  trueNet: number,
  savingsSpent: number,
): number => {
  if (trueNet <= 0) {
    return 0;
  }
  return Math.min(100, (savingsSpent / trueNet) * 100);
};
