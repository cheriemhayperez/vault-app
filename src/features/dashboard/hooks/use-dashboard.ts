"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Calculator,
  Gift,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { useDashboardPeriod } from "@/contexts/dashboard-period-context";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import { useAppSelector } from "@/store";
import {
  buildRevenueChartDataForPeriod,
  computeGovernmentContributionsForPeriod,
  computePayMetrics,
} from "@/utils/dashboardMetrics";
import {
  aggregatePayRecordDistribution,
  isPayRecord,
} from "@/utils/payRecords";
import {
  aggregateExpenseDistributionForPeriod,
  buildExpenseCategoryNameMap,
  sumLifestyleSpendForPeriod,
} from "@/utils/expenseLedger";
import {
  filterToDistributionOptions,
  filterTransactionsByPeriod,
  getPeriodDisplayLabel,
} from "@/utils/periodFilter";

const DASHBOARD_LOAD_MS = 520;

const getSavingsRating = (
  ratePercent: number,
): { label: string; badgeClass: string; ringColor: string; labelClass: string } => {
  if (ratePercent >= 80) {
    return {
      label: "Excellent",
      badgeClass: "bg-emerald-50 text-emerald-700",
      ringColor: "#10b981",
      labelClass: "text-emerald-600",
    };
  }
  if (ratePercent >= 50) {
    return {
      label: "Good",
      badgeClass: "bg-emerald-50 text-emerald-700",
      ringColor: "#10b981",
      labelClass: "text-emerald-600",
    };
  }
  if (ratePercent > 0) {
    return {
      label: "Moderate",
      badgeClass: "bg-amber-50 text-amber-700",
      ringColor: "#f59e0b",
      labelClass: "text-amber-600",
    };
  }
  return {
    label: "Low",
    badgeClass: "bg-rose-50 text-rose-600",
    ringColor: "#f43f5e",
    labelClass: "text-rose-500",
  };
};

export const useDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { filter } = useDashboardPeriod();
  const { formatMoney, formatMoneyFixed, formatMoneyMetric, formatDate } =
    useVaultPreferences();
  const {
    grossMonthlyIncome,
    transactions,
  } = useAppSelector((state) => state.financial);
  const { income: incomeCategories, deduction: deductionCategories } =
    useAppSelector((state) => state.categories);
  const budgetCategories = useAppSelector((state) => state.budgetCategories);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), DASHBOARD_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, filter),
    [transactions, filter],
  );

  const payMetrics = useMemo(
    () => computePayMetrics(filteredTransactions),
    [filteredTransactions],
  );

  const distributionOptions = useMemo(
    () => filterToDistributionOptions(filter),
    [filter],
  );

  const deductionsRatePercent = useMemo(() => {
    if (payMetrics.totalEntitlements <= 0) {
      return 0;
    }
    return (payMetrics.totalDeductions / payMetrics.totalEntitlements) * 100;
  }, [payMetrics.totalDeductions, payMetrics.totalEntitlements]);

  const retainedRatePercent = useMemo(() => {
    if (payMetrics.totalEntitlements <= 0) {
      return 0;
    }
    return Math.min(
      100,
      (payMetrics.netPay / payMetrics.totalEntitlements) * 100,
    );
  }, [payMetrics.netPay, payMetrics.totalEntitlements]);

  const savingsRating = getSavingsRating(retainedRatePercent);

  const incomeDistribution = useMemo(
    () =>
      aggregatePayRecordDistribution(filteredTransactions, "CREDIT", {
        ...distributionOptions,
        incomeCategories,
        deductionCategories,
      }),
    [
      filteredTransactions,
      distributionOptions,
      incomeCategories,
      deductionCategories,
    ],
  );

  const deductionDistribution = useMemo(
    () =>
      aggregatePayRecordDistribution(filteredTransactions, "DEBIT", {
        ...distributionOptions,
        incomeCategories,
        deductionCategories,
      }),
    [
      filteredTransactions,
      distributionOptions,
      incomeCategories,
      deductionCategories,
    ],
  );

  const expenseCategoryNameById = useMemo(
    () => buildExpenseCategoryNameMap(budgetCategories),
    [budgetCategories],
  );

  const totalLifestyleExpenses = useMemo(
    () => sumLifestyleSpendForPeriod(transactions, filter),
    [transactions, filter],
  );

  const expenseDistribution = useMemo(
    () =>
      aggregateExpenseDistributionForPeriod(
        transactions,
        expenseCategoryNameById,
        filter,
      ),
    [transactions, expenseCategoryNameById, filter],
  );

  const revenueValues = {
    income: payMetrics.totalEntitlements,
    deductions: payMetrics.totalDeductions,
    expenses: totalLifestyleExpenses,
    net: payMetrics.netPay,
  };

  const summaryCards: {
    label: string;
    sublabel: string;
    value: number;
    icon: LucideIcon;
    iconClass: string;
    valueClass: string;
    useFixedAmount?: boolean;
  }[] = [
    {
      label: "Total Entitlements",
      sublabel: "Gross earnings",
      value: payMetrics.totalEntitlements,
      icon: Calculator,
      iconClass: "bg-teal-50 text-teal-600",
      valueClass: "text-teal-700",
      useFixedAmount: true,
    },
    {
      label: "Additional Pay",
      sublabel: "Bonuses & allowances",
      value: payMetrics.additionalPay,
      icon: Gift,
      iconClass: "bg-sky-50 text-sky-600",
      valueClass: "text-slate-900",
    },
    {
      label: "Total Deductions",
      sublabel: "All manual deductions",
      value: payMetrics.totalDeductions,
      icon: TrendingDown,
      iconClass: "bg-red-50 text-red-500",
      valueClass: "text-red-600",
      useFixedAmount: true,
    },
    {
      label: "Net Pay",
      sublabel: "Take home amount",
      value: payMetrics.netPay,
      icon: TrendingUp,
      iconClass: "bg-teal-50 text-teal-600",
      valueClass: "text-teal-700",
      useFixedAmount: true,
    },
    {
      label: "Total Expenses",
      sublabel: "Active lifestyle spending",
      value: totalLifestyleExpenses,
      icon: Receipt,
      iconClass: "bg-violet-50 text-violet-600",
      valueClass: "text-violet-700",
      useFixedAmount: true,
    },
  ];

  const chartData = useMemo(
    () => buildRevenueChartDataForPeriod(transactions, filter),
    [transactions, filter],
  );

  const periodGovernment = useMemo(
    () =>
      computeGovernmentContributionsForPeriod(
        transactions,
        filter,
        grossMonthlyIncome,
      ),
    [transactions, filter, grossMonthlyIncome],
  );

  const governmentContributions = useMemo(
    () => ({
      sss: periodGovernment.sss,
      philHealth: periodGovernment.philHealth,
      pagIbig: periodGovernment.pagIbig,
      birTax: periodGovernment.birTax,
    }),
    [periodGovernment],
  );

  const governmentEmployeeShare = periodGovernment.governmentEmployeeShare;
  const totalTaxAndContributions = periodGovernment.totalDeductions;

  const netAfterGovernment = useMemo(
    () =>
      Math.max(
        0,
        periodGovernment.periodGrossIncome - totalTaxAndContributions,
      ),
    [periodGovernment.periodGrossIncome, totalTaxAndContributions],
  );

  const governmentShareLabel =
    filter.periodType === "month"
      ? "Monthly tax & contributions"
      : "Period tax & contributions";

  const recentTransactions = useMemo(
    () =>
      [...filteredTransactions]
        .filter(isPayRecord)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 5),
    [filteredTransactions],
  );

  return {
    isLoading,
    filter,
    formatMoney,
    formatMoneyFixed,
    formatMoneyMetric,
    formatDate,
    incomeCategories,
    deductionCategories,
    payMetrics,
    deductionsRatePercent,
    retainedRatePercent,
    savingsRating,
    incomeDistribution,
    deductionDistribution,
    expenseDistribution,
    revenueValues,
    summaryCards,
    chartData,
    governmentContributions,
    governmentEmployeeShare,
    totalTaxAndContributions,
    netAfterGovernment,
    governmentShareLabel,
    recentTransactions,
    getPeriodDisplayLabel,
  };
};
