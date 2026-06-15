"use client";

import type { ReactNode } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { CategoryDistributionSlice } from "@/utils/payRecords";
import { CHART_PROGRESS_TRACK } from "@/types/categories";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import { getActiveCurrencyFormatters } from "@/utils/format/currencyFormat";

interface CategoryPieTooltipProps {
  active?: boolean;
  payload?: {
    name?: string;
    value?: number;
    payload?: CategoryDistributionSlice;
  }[];
}

const CategoryPieTooltip = ({ active, payload }: CategoryPieTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0];
  const slice = entry?.payload;
  const amount = slice?.amount ?? entry?.value;
  if (amount === undefined) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      {slice?.name ? (
        <p className="text-xs font-medium text-slate-500">{slice.name}</p>
      ) : null}
      <p className="text-sm font-semibold tabular-nums text-slate-900">
        {getActiveCurrencyFormatters().formatMoney(amount)}
      </p>
    </div>
  );
};

interface CategoryDistributionCardProps {
  title: string;
  subtitle: string;
  trailing: ReactNode;
  slices: CategoryDistributionSlice[];
  variant?: "income" | "deduction" | "expense";
  totalClassName?: string;
}

export const CategoryDistributionCard = ({
  title,
  subtitle,
  trailing,
  slices,
  variant = "income",
  totalClassName,
}: CategoryDistributionCardProps) => {
  const { formatMoney } = useVaultPreferences();
  const resolvedTotalClassName =
    totalClassName ??
    (variant === "deduction"
      ? "text-red-500"
      : variant === "expense"
        ? "text-violet-600"
        : "text-emerald-600");
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0);
  const hasData = slices.length > 0 && total > 0;

  /** Fixed px size so all dashboard donuts match regardless of legend length. */
  const chartSizePx = 120;
  const innerRadius = chartSizePx * 0.33;
  const outerRadius = chartSizePx * 0.46;

  const showPieTooltip = hasData;

  /** Fixed height for empty cards only — cards with data grow with their content. */
  const emptyBodyClass = "mt-3 flex min-h-[200px] items-center justify-center";
  const dataBodyClass = "mt-3 flex flex-col";

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-0.5 text-xs tracking-tight text-slate-500">
            {subtitle}
          </p>
        </div>
        <div className="shrink-0">{trailing}</div>
      </div>

      <div className={hasData ? dataBodyClass : emptyBodyClass}>
      {hasData ? (
        <>
          <p
            className={`font-sans text-2xl font-bold leading-none tracking-tight tabular-nums ${resolvedTotalClassName}`}
          >
            {formatMoney(total)}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div
              className="relative shrink-0 grow-0"
              style={{
                width: chartSizePx,
                height: chartSizePx,
                minWidth: chartSizePx,
                minHeight: chartSizePx,
              }}
            >
              <ResponsiveContainer width={chartSizePx} height={chartSizePx}>
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="amount"
                    nameKey="name"
                    cx={chartSizePx / 2}
                    cy={chartSizePx / 2}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    stroke="none"
                    paddingAngle={slices.length > 1 ? 2 : 0}
                    activeShape={false}
                    className={
                      showPieTooltip
                        ? "cursor-pointer outline-none focus:outline-none"
                        : undefined
                    }
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.name} fill={slice.color} />
                    ))}
                  </Pie>
                  {showPieTooltip ? (
                    <Tooltip
                      content={<CategoryPieTooltip />}
                      cursor={false}
                      animationDuration={150}
                      wrapperStyle={{ zIndex: 20, outline: "none" }}
                    />
                  ) : null}
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="min-w-0 flex-1 space-y-2 self-center">
              {slices.map((slice) => (
                <li
                  key={slice.name}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="truncate text-slate-700">{slice.name}</span>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums text-slate-600">
                    {slice.percent.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
            {slices.map((slice) => (
              <div key={slice.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-800">{slice.name}</span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {formatMoney(slice.amount)}
                  </span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: CHART_PROGRESS_TRACK }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${slice.percent}%`,
                      backgroundColor: slice.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400">No data available</p>
      )}
      </div>
    </div>
  );
};
