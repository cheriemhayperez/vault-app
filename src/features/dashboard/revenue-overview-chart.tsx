"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenueChartPoint } from "@/utils/dashboardMetrics";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import { getActiveCurrencyFormatters } from "@/utils/format/currencyFormat";

interface RevenueOverviewChartProps {
  data: RevenueChartPoint[];
  className?: string;
}

export const REVENUE_CHART_COLORS = {
  income: "#10b981",
  deductions: "#f43f5e",
  expenses: "#7c3aed",
  net: "#94a3b8",
} as const;

const CHART_COLORS = REVENUE_CHART_COLORS;

const HOLLOW_DOT = (color: string) => ({
  r: 5,
  fill: "transparent",
  stroke: color,
  strokeWidth: 2,
  strokeOpacity: 0.4,
});

const ACTIVE_HOLLOW_DOT = (color: string) => ({
  r: 6,
  fill: "transparent",
  stroke: color,
  strokeWidth: 2.5,
  strokeOpacity: 1,
});

export const REVENUE_CHART_LEGEND = [
  { label: "Income", color: REVENUE_CHART_COLORS.income, variant: "dot" as const },
  {
    label: "Deductions",
    color: REVENUE_CHART_COLORS.deductions,
    variant: "dot" as const,
  },
  {
    label: "Expenses",
    color: REVENUE_CHART_COLORS.expenses,
    variant: "dot" as const,
  },
  { label: "Net", color: REVENUE_CHART_COLORS.net, variant: "line" as const },
];

export const RevenueChartLegend = ({ className = "" }: { className?: string }) => (
  <ul className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
    {REVENUE_CHART_LEGEND.map((item) => (
      <li key={item.label} className="flex items-center gap-1.5">
        {item.variant === "line" ? (
          <span
            className="inline-block h-0.5 w-3.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
        ) : (
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
        )}
        <span className="text-xs text-slate-500">{item.label}</span>
      </li>
    ))}
  </ul>
);

const resolveChartYMax = (data: RevenueChartPoint[]): number => {
  const peak = Math.max(
    0,
    ...data.flatMap((row) => [
      row.income,
      row.deductions,
      row.expenses,
      row.net,
    ]),
  );

  if (peak <= 0) {
    return 200_000;
  }

  const step = peak <= 50_000 ? 10_000 : 50_000;
  return Math.ceil(peak / step) * step;
};

const RevenueChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: RevenueChartPoint }[];
  label?: string;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload;
  if (!row) {
    return null;
  }

  const rows = [
    { label: "Income", value: row.income, color: CHART_COLORS.income },
    { label: "Deductions", value: row.deductions, color: CHART_COLORS.deductions },
    { label: "Expenses", value: row.expenses, color: CHART_COLORS.expenses },
    { label: "Net", value: row.net, color: CHART_COLORS.net },
  ];

  return (
    <div className="vault-revenue-chart-tooltip rounded-lg border px-3 py-2.5">
      <p className="vault-revenue-chart-tooltip-title mb-2 text-xs font-semibold tracking-tight">
        {label ?? row.period}
      </p>
      <div className="space-y-1.5">
        {rows.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-6 text-[11px]"
          >
            <span className="vault-revenue-chart-tooltip-label">{item.label}</span>
            <span
              className="font-normal tabular-nums"
              style={{ color: item.color }}
            >
              {getActiveCurrencyFormatters().formatMoneyMetric(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RevenueOverviewChart = ({
  data,
  className = "h-full w-full",
}: RevenueOverviewChartProps) => {
  const { formatMoneyAxisTick } = useVaultPreferences();
  const yMax = useMemo(() => resolveChartYMax(data), [data]);
  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, index) =>
      Math.round((yMax / count) * index),
    );
  }, [yMax]);

  return (
    <div
      className={`w-full min-w-0 [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_svg]:outline-none ${className}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          className="outline-none focus:outline-none"
        >
          <CartesianGrid
            strokeDasharray="6 6"
            stroke="var(--vault-chart-grid-stroke)"
            vertical={false}
          />
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            dy={2}
            height={18}
            tickMargin={0}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            tickFormatter={(value) => formatMoneyAxisTick(Number(value))}
            ticks={yTicks}
            domain={[0, yMax]}
            width={48}
            allowDecimals={false}
          />
          <Tooltip
            content={<RevenueChartTooltip />}
            cursor={{ stroke: "var(--vault-chart-cursor-stroke)", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Total Income"
            stroke={CHART_COLORS.income}
            strokeWidth={2}
            strokeOpacity={0.35}
            dot={HOLLOW_DOT(CHART_COLORS.income)}
            activeDot={ACTIVE_HOLLOW_DOT(CHART_COLORS.income)}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Total Expenses"
            stroke={CHART_COLORS.expenses}
            strokeWidth={2}
            strokeOpacity={0.35}
            dot={HOLLOW_DOT(CHART_COLORS.expenses)}
            activeDot={ACTIVE_HOLLOW_DOT(CHART_COLORS.expenses)}
          />
          <Line
            type="monotone"
            dataKey="net"
            name="Net"
            stroke={CHART_COLORS.net}
            strokeWidth={2}
            strokeOpacity={0.35}
            dot={HOLLOW_DOT(CHART_COLORS.net)}
            activeDot={ACTIVE_HOLLOW_DOT(CHART_COLORS.net)}
          />
          <Line
            type="monotone"
            dataKey="deductions"
            name="Total Deductions"
            stroke={CHART_COLORS.deductions}
            strokeWidth={2}
            strokeOpacity={0.35}
            dot={HOLLOW_DOT(CHART_COLORS.deductions)}
            activeDot={ACTIVE_HOLLOW_DOT(CHART_COLORS.deductions)}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
