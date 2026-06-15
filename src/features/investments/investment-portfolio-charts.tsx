"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useVaultPreferences } from "@/contexts/vault-preferences-context";

interface GrowthChartPoint {
  label: string;
  dateLabel: string;
  capital: number;
  returns: number;
}

interface InvestmentPortfolioChartsProps {
  returnsData: { name: string; total: number }[];
  growthData: GrowthChartPoint[];
  totalReturns: number;
  totalCapital: number;
}

const CHART_COLORS = {
  capital: "var(--vault-accent-deep)",
  capitalFill: "var(--vault-accent-deep)",
  returns: "var(--vault-accent)",
  returnsBar: "var(--vault-accent)",
} as const;

const ACTIVE_HOLLOW_DOT = (color: string) => ({
  r: 6,
  fill: "#ffffff",
  stroke: color,
  strokeWidth: 2.5,
  strokeOpacity: 1,
});

const renderHollowDot =
  (color: string) =>
  ({ cx, cy }: { cx?: number; cy?: number }) => {
    if (cx == null || cy == null) {
      return null;
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#ffffff"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.4}
      />
    );
  };

const niceStepMax = (peak: number, preferredStep: number): number => {
  if (peak <= 0) {
    return preferredStep * 4;
  }
  return Math.ceil(peak / preferredStep) * preferredStep;
};

const growthYMax = (
  totalCapital: number,
  growthData: { capital: number; returns: number }[],
) => {
  const peak = growthData.reduce(
    (max, point) => Math.max(max, point.capital, point.returns),
    0,
  );
  const target = Math.max(totalCapital, peak);
  return niceStepMax(target, target > 100_000 ? 55_000 : 5_000);
};

const returnsYMax = (returnsData: { total: number }[], totalReturns: number) => {
  const peak = Math.max(
    totalReturns,
    returnsData.reduce((max, item) => Math.max(max, item.total), 0),
  );
  return niceStepMax(peak, peak > 20_000 ? 10_000 : 5_000);
};

const CHART_TITLE_CLASS =
  "text-base font-semibold tracking-tight text-slate-900";
const CHART_SUBTITLE_CLASS = "text-xs text-slate-500";

const ReturnsChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; total: number } }[];
}) => {
  const { formatMoneyMetric } = useVaultPreferences();

  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload;
  if (!row) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-md">
      <p className="mb-2 text-sm font-bold text-slate-900">{row.name}</p>
      <div className="flex items-center justify-between gap-8 text-sm">
        <span className="font-normal text-slate-500">Returns:</span>
        <span className="font-bold tabular-nums text-vault-accent">
          {formatMoneyMetric(row.total)}
        </span>
      </div>
    </div>
  );
};

const PortfolioGrowthTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: GrowthChartPoint }[];
}) => {
  const { formatMoneyMetric } = useVaultPreferences();

  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload;
  if (!row) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-md">
      <p className="mb-2 text-sm font-bold text-slate-900">{row.dateLabel}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-8 text-sm">
          <span className="font-normal text-slate-500">Capital:</span>
          <span className="font-bold tabular-nums text-slate-900">
            {formatMoneyMetric(row.capital)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8 text-sm">
          <span className="font-normal text-slate-500">Returns:</span>
          <span className="font-bold tabular-nums text-vault-accent">
            {formatMoneyMetric(row.returns)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const InvestmentPortfolioCharts = ({
  returnsData,
  growthData,
  totalReturns,
  totalCapital,
}: InvestmentPortfolioChartsProps) => {
  const { formatMoneyAxisTick, formatMoneyMetric } = useVaultPreferences();

  const growthMax = growthYMax(totalCapital, growthData);
  const returnsMax = returnsYMax(returnsData, totalReturns);
  const hasReturnBars = returnsData.some((item) => item.total > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h3 className={CHART_TITLE_CLASS}>Returns Overview</h3>
            <p className={CHART_SUBTITLE_CLASS}>
              Dividends & interest received per investment
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total Returns</p>
            <p className="text-2xl font-bold tabular-nums text-vault-accent">
              {formatMoneyMetric(totalReturns)}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-200 px-5 py-4">
          <div className="h-56">
            {returnsData.length > 0 && hasReturnBars ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={returnsData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis
                    domain={[0, returnsMax]}
                    allowDecimals={false}
                    tickFormatter={formatMoneyAxisTick}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={<ReturnsChartTooltip />} cursor={false} />
                  <Bar
                    dataKey="total"
                    fill={CHART_COLORS.returnsBar}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                    activeBar={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No returns recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h3 className={CHART_TITLE_CLASS}>Portfolio Growth</h3>
            <p className={CHART_SUBTITLE_CLASS}>
              Capital vs returns over time
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4 rounded-full"
                style={{ backgroundColor: CHART_COLORS.capital }}
              />
              Capital
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4 rounded-full"
                style={{ backgroundColor: CHART_COLORS.returns }}
              />
              Returns
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 border-t border-slate-200 px-5 py-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">Total Capital</p>
            <p className="font-mono font-bold tabular-nums text-slate-900">
              {formatMoneyMetric(totalCapital)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Returns</p>
            <p className="font-mono font-bold tabular-nums text-vault-accent">
              {formatMoneyMetric(totalReturns)}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-200 px-5 py-4">
          <div className="h-56">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={growthData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="investmentCapitalArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={CHART_COLORS.capitalFill}
                        stopOpacity={0.22}
                      />
                      <stop
                        offset="100%"
                        stopColor={CHART_COLORS.capitalFill}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={growthData.length > 2 ? -25 : 0}
                    textAnchor={growthData.length > 2 ? "end" : "middle"}
                    height={growthData.length > 2 ? 48 : 32}
                  />
                  <YAxis
                    domain={[0, growthMax]}
                    allowDecimals={false}
                    tickFormatter={formatMoneyAxisTick}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip
                    content={<PortfolioGrowthTooltip />}
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="capital"
                    stroke="none"
                    fill="url(#investmentCapitalArea)"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="capital"
                    stroke={CHART_COLORS.capital}
                    strokeWidth={2}
                    dot={renderHollowDot(CHART_COLORS.capital)}
                    activeDot={ACTIVE_HOLLOW_DOT(CHART_COLORS.capital)}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="returns"
                    stroke={CHART_COLORS.returns}
                    strokeWidth={2}
                    dot={renderHollowDot(CHART_COLORS.returns)}
                    activeDot={ACTIVE_HOLLOW_DOT(CHART_COLORS.returns)}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Add investments to see growth
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
