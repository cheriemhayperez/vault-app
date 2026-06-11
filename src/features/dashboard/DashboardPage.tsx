"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  FileText,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { CategoryDistributionCard } from "./category-distribution-card";
import { PayRecordDirectionIcon } from "@/components/shared/pay-record-direction-icon";
import { RecordCategoryBadge } from "@/components/shared/record-category-badge";
import { DashboardOverviewSkeleton } from "./dashboard-overview-skeleton";
import {
  RevenueChartLegend,
  RevenueOverviewChart,
} from "./revenue-overview-chart";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import {
  GOVERNMENT_ROWS,
  REVENUE_METRICS,
  SAVINGS_DEDUCTION_RED,
  SAVINGS_RING_ACTIVE,
  SAVINGS_RING_TRACK,
} from "@/features/dashboard/config";
import {
  GOVERNMENT_CONTRIBUTION_RATES_YEAR,
} from "@/utils/philippineDeductions";
import {
  getRecordRowDescription,
  isEmptyRecordRowDescription,
} from "@/utils/payRecords";

const PanelCardHeader = ({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle: string;
  trailing: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2">
    <div className="min-w-0">
      <h3 className="text-sm font-semibold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-0.5 text-xs tracking-tight text-slate-500">{subtitle}</p>
    </div>
    <div className="shrink-0">{trailing}</div>
  </div>
);

const IconBadge = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => (
  <div
    className={`flex size-8 items-center justify-center rounded-lg ${className}`}
  >
    {children}
  </div>
);

const SavingsRateGauge = ({
  ratePercent,
  rating,
}: {
  ratePercent: number;
  rating: {
    label: string;
    badgeClass: string;
    ringColor: string;
    labelClass: string;
  };
}) => {
  const size = 108;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, ratePercent));
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const ringColor =
    ratePercent >= 50 ? SAVINGS_RING_ACTIVE : rating.ringColor;

  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={SAVINGS_RING_TRACK}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <p
          className={`text-2xl font-bold leading-none tracking-tight tabular-nums ${rating.labelClass}`}
        >
          {ratePercent.toFixed(0)}%
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${rating.badgeClass}`}
        >
          {rating.label}
        </span>
      </div>
    </div>
  );
};

const SavingsRateRetainedBar = ({
  retainedPercent,
  deductedPercent,
}: {
  retainedPercent: number;
  deductedPercent: number;
}) => {
  const retained = Math.min(100, Math.max(0, retainedPercent));
  const deducted = Math.min(100, Math.max(0, deductedPercent));

  if (retained === 0 && deducted === 0) {
    return <div className="h-2 w-full rounded-full bg-slate-100" />;
  }

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full">
      <div
        className="bg-emerald-500 transition-all duration-500"
        style={{ width: `${retained}%` }}
      />
      <div
        className="transition-all duration-500"
        style={{ width: `${deducted}%`, backgroundColor: SAVINGS_DEDUCTION_RED }}
      />
    </div>
  );
};

export const DashboardPage = () => {
  const {
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
    totalTaxAndContributions,
    netAfterGovernment,
    governmentShareLabel,
    recentTransactions,
    getPeriodDisplayLabel,
  } = useDashboard();

  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex min-h-[120px] flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:min-h-[132px]"
            >
              <div className="flex w-full items-center justify-between gap-1">
                <IconBadge className={card.iconClass}>
                  <Icon className="size-4" />
                </IconBadge>
                <span className="shrink-0 text-[10px] font-normal tabular-nums text-slate-400 sm:text-xs">
                  — 0%
                </span>
              </div>

              <div className="flex min-h-[1.75rem] items-center sm:min-h-8">
                <p
                  className={`truncate font-sans text-xl font-bold leading-none tracking-tight tabular-nums sm:text-xl xl:text-2xl ${card.valueClass}`}
                >
                  {card.useFixedAmount
                    ? formatMoneyFixed(card.value)
                    : formatMoneyMetric(card.value)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="truncate font-sans text-sm font-semibold tracking-tight text-slate-900">
                  {card.label}
                </p>
                <p className="mt-0.5 truncate font-sans text-xs font-normal leading-snug tracking-tight text-slate-500">
                  {card.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 w-full min-w-0 gap-4 sm:mb-6 sm:gap-6 max-lg:flex max-lg:flex-col lg:grid lg:grid-cols-3 lg:items-stretch">
        <div className="flex flex-col gap-6 lg:col-start-3 lg:row-start-1">
          <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                Savings Rate
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Percentage retained after deductions
              </p>
            </div>

            <div className="mt-4 flex flex-col">
              <div className="flex justify-center">
                <SavingsRateGauge
                  ratePercent={retainedRatePercent}
                  rating={savingsRating}
                />
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500">Net Pay</span>
                  <span className="font-semibold tabular-nums text-emerald-600">
                    {formatMoney(payMetrics.netPay)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500">Deductions</span>
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: SAVINGS_DEDUCTION_RED }}
                  >
                    {deductionsRatePercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Retained</span>
                  <span>Deducted</span>
                </div>
                <div className="mt-2">
                  <SavingsRateRetainedBar
                    retainedPercent={retainedRatePercent}
                    deductedPercent={deductionsRatePercent}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <PanelCardHeader
              title="Government Contributions"
              subtitle={`${GOVERNMENT_CONTRIBUTION_RATES_YEAR} rates · ${getPeriodDisplayLabel(filter)}`}
              trailing={
                <IconBadge className="bg-emerald-50 text-emerald-600">
                  <Calculator className="size-4" />
                </IconBadge>
              }
            />

            <div className="mt-4">
              <p className="font-sans text-2xl font-semibold leading-none tracking-tight text-rose-600 tabular-nums">
                {formatMoneyFixed(totalTaxAndContributions)}
              </p>
              <p className="mt-0.5 text-xs tracking-tight text-slate-500">
                {governmentShareLabel}
              </p>

              <div className="mt-4 space-y-4">
                {GOVERNMENT_ROWS.map((row) => {
                  const rowAmount = governmentContributions[row.key];
                  const barWidth =
                    totalTaxAndContributions > 0
                      ? (rowAmount / totalTaxAndContributions) * 100
                      : 0;

                  return (
                    <div key={row.key} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`size-2 shrink-0 rounded-full ${row.dotClass}`}
                          />
                          <span className="font-medium text-slate-800">
                            {row.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({row.percent})
                          </span>
                        </div>
                        <span className="shrink-0 font-normal tabular-nums text-slate-900">
                          {formatMoneyFixed(rowAmount)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${row.barClass}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Net after deductions</span>
                  <span className="font-semibold tabular-nums text-emerald-600">
                    {formatMoneyFixed(netAfterGovernment)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="box-border flex min-h-0 min-w-0 flex-col rounded-xl border border-slate-100 bg-white px-4 pt-4 pb-4 shadow-sm sm:px-5 sm:pt-5 sm:pb-5 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:h-full max-lg:order-first">
          <div className="shrink-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight text-slate-900">
                  Revenue Overview
                </h2>
                <p className="mt-0.5 text-xs tracking-tight text-slate-500">
                  Income vs deductions over time
                </p>
              </div>
              <RevenueChartLegend className="shrink-0 sm:pt-0.5" />
            </div>

            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 sm:px-4 sm:py-3.5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {REVENUE_METRICS.map((metric) => {
                  const value = revenueValues[metric.key];
                  return (
                    <div key={metric.key} className="min-w-0">
                      <p className="text-xs text-slate-500">{metric.label}</p>
                      <p
                        className={`mt-0.5 font-sans text-lg font-bold tracking-tight tabular-nums sm:text-xl ${metric.valueClass}`}
                      >
                        {formatMoneyFixed(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 h-[220px] shrink-0 sm:h-[240px] lg:min-h-0 lg:flex-1">
            <RevenueOverviewChart
              data={chartData}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 grid w-full min-w-0 grid-cols-1 items-start gap-4 sm:mb-6 sm:gap-6 lg:grid-cols-3">
        <CategoryDistributionCard
          title="Income Sources"
          subtitle="Category distribution"
          variant="income"
          slices={incomeDistribution}
          trailing={
            <IconBadge className="bg-emerald-50 text-emerald-600">
              <TrendingUp className="size-4" />
            </IconBadge>
          }
        />

        <CategoryDistributionCard
          title="Deductions"
          subtitle="Category distribution"
          variant="deduction"
          slices={deductionDistribution}
          trailing={
            <IconBadge className="bg-red-50 text-red-500">
              <TrendingDown className="size-4" />
            </IconBadge>
          }
        />

        <CategoryDistributionCard
          title="Lifestyle Expenses"
          subtitle="Active spending by category"
          variant="expense"
          slices={expenseDistribution}
          trailing={
            <IconBadge className="bg-violet-50 text-violet-600">
              <Receipt className="size-4" />
            </IconBadge>
          }
        />

      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <IconBadge className="bg-violet-50 text-violet-600">
              <Receipt className="size-4" />
            </IconBadge>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                Recent Transactions
              </h3>
              <p className="mt-0.5 text-xs tracking-tight text-slate-500">
                Latest pay records
              </p>
            </div>
          </div>
          <Link
            href="/records"
            className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 transition-colors hover:text-violet-700"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <>
            <div className="grid min-w-[640px] grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 sm:px-5">
              {["Description", "Category", "Date", "Amount"].map((heading) => (
                <span
                  key={heading}
                  className={`text-[10px] font-semibold uppercase tracking-wide text-slate-500 ${
                    heading === "Amount" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </span>
              ))}
            </div>
            <div className="min-w-[640px] divide-y divide-slate-100">
              {recentTransactions.map((transaction) => {
                const isDeduction = transaction.direction === "DEBIT";

                return (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 px-4 py-3.5 text-sm sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <PayRecordDirectionIcon direction={transaction.direction} />
                      <p
                        className={`truncate ${
                          isEmptyRecordRowDescription(transaction)
                            ? "text-slate-400"
                            : "font-medium text-slate-800"
                        }`}
                      >
                        {getRecordRowDescription(transaction)}
                      </p>
                    </div>
                    <RecordCategoryBadge
                      record={transaction}
                      incomeCategories={incomeCategories}
                      deductionCategories={deductionCategories}
                    />
                    <p className="whitespace-nowrap text-slate-600">
                      {formatDate(transaction.timestamp)}
                    </p>
                    <span
                      className={`text-right font-semibold tabular-nums ${
                        isDeduction ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {isDeduction ? "-" : "+"}
                      {formatMoneyMetric(transaction.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
            </>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
              <FileText className="size-8 text-slate-400" />
            </div>
            <p className="mt-4 text-base font-semibold tracking-tight text-slate-900">
              No records yet
            </p>
            <p className="mt-1 text-sm tracking-tight text-slate-500">
              Start by adding your first pay record
            </p>
            <Link
              href="/records"
              className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              Add Record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
