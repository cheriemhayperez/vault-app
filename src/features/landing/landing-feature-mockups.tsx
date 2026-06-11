"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import {
  computeBirFlatTax,
  computePagIbigEmployeeShare,
  computePhilHealthEmployeeShare,
  computeSssEmployeeShare,
} from "@/utils/philippineDeductions";

const listItemMotion = {
  initial: { opacity: 0, x: 12 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const GROSS_MONTHLY = 35_000;

const formatDeduction = (amount: number) =>
  `-₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatNetPay = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const payRecordDeductions = (() => {
  const bir = computeBirFlatTax(GROSS_MONTHLY);
  const sss = computeSssEmployeeShare(GROSS_MONTHLY);
  const philHealth = computePhilHealthEmployeeShare(GROSS_MONTHLY);
  const pagIbig = computePagIbigEmployeeShare(GROSS_MONTHLY);
  const total = bir + sss + philHealth + pagIbig;

  return {
    rows: [
      { label: "BIR", amount: bir },
      { label: "SSS", amount: sss },
      { label: "PhilHealth", amount: philHealth },
      { label: "Pag-IBIG", amount: pagIbig },
    ],
    total,
    net: GROSS_MONTHLY - total,
  };
})();

export const PayRecordMockup = () => (
  <div className="space-y-2">
    <div className="flex items-start justify-between gap-3">
      <p className="text-xs font-semibold text-slate-900">Record Pay</p>
      <p className="text-[9px] text-slate-400">Latest Cutoff</p>
    </div>

    <div className="rounded-lg border border-slate-100 p-2.5">
      <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
        Monthly Gross Salary
      </p>
      <p className="mt-0.5 font-mono text-lg font-bold text-slate-900">
        ₱35,000
        <span className="text-[10px] font-normal text-slate-400"> / month</span>
      </p>
      <div className="mt-2 h-0.5 rounded-full bg-violet-500" />
    </div>

    <div className="rounded-lg border border-slate-100 p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-500">
          Government Deductions
        </p>
        <span className="text-[9px] font-semibold text-violet-600">
          Auto-computed
        </span>
      </div>
      <div className="space-y-1">
        {payRecordDeductions.rows.map((row, index) => (
          <motion.div
            key={row.label}
            className="flex items-center justify-between"
            {...listItemMotion}
            transition={{ duration: 0.35, delay: index * 0.06 }}
          >
            <span className="flex items-center gap-1.5 text-[11px] text-slate-700">
              <span className="size-1.5 shrink-0 rounded-full bg-violet-500" />
              {row.label}
            </span>
            <span className="font-mono text-[11px] font-medium text-slate-900">
              {formatDeduction(row.amount)}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className="font-medium text-slate-600">Total Deductions</span>
        <span className="font-mono font-semibold text-rose-600">
          {formatDeduction(payRecordDeductions.total)}
        </span>
      </div>
    </div>

    <div className="flex items-center justify-between rounded-lg border border-violet-100 bg-violet-50 p-2.5">
      <div>
        <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-500">
          Net Take-Home Pay
        </p>
        <p className="mt-0.5 font-mono text-base font-bold text-violet-700">
          {formatNetPay(payRecordDeductions.net)}
        </p>
      </div>
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100"
        aria-hidden
      >
        <Check className="size-3.5 text-violet-600" strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const BUDGET_NET_PAY = 30_450;
const BUDGET_SLICES = [
  {
    label: "Needs",
    pct: 50,
    amount: Math.round(BUDGET_NET_PAY * 0.5),
    barColor: "bg-violet-600",
    dotColor: "bg-violet-600",
    donutColor: "#7c3aed",
  },
  {
    label: "Wants",
    pct: 30,
    amount: Math.round(BUDGET_NET_PAY * 0.3),
    barColor: "bg-yellow-400",
    dotColor: "bg-yellow-400",
    donutColor: "#facc15",
  },
  {
    label: "Savings",
    pct: 20,
    amount: Math.round(BUDGET_NET_PAY * 0.2),
    barColor: "bg-teal-400",
    dotColor: "bg-teal-400",
    donutColor: "#2dd4bf",
  },
] as const;

const formatBudgetAmount = (amount: number) =>
  `₱${amount.toLocaleString("en-PH")}`;

const DONUT_SIZE = 112;
const DONUT_CENTER = DONUT_SIZE / 2;
const DONUT_RADIUS = 42;
const DONUT_STROKE = 10;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const BudgetDonutChart = () => {
  let segmentOffset = 0;

  return (
    <div className="flex w-28 shrink-0 flex-col items-center justify-center">
      <div className="relative size-28" aria-hidden>
        <svg
          viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
          className="size-full -rotate-90"
        >
          {BUDGET_SLICES.map((slice) => {
            const segmentLength = (slice.pct / 100) * DONUT_CIRCUMFERENCE;
            const circle = (
              <circle
                key={slice.label}
                cx={DONUT_CENTER}
                cy={DONUT_CENTER}
                r={DONUT_RADIUS}
                fill="none"
                stroke={slice.donutColor}
                strokeWidth={DONUT_STROKE}
                strokeDasharray={`${segmentLength} ${DONUT_CIRCUMFERENCE}`}
                strokeDashoffset={-segmentOffset}
                strokeLinecap="butt"
              />
            );
            segmentOffset += segmentLength;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold leading-none text-slate-900">
            ₱30.5K
          </span>
        </div>
      </div>
      <p className="mt-1 text-[10px] font-medium text-slate-400">Net Pay</p>
    </div>
  );
};

export const BudgetMockup = () => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-slate-800">50/30/20 Budget</p>
      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-semibold text-violet-700">
        Active
      </span>
    </div>

    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1 space-y-2.5">
        {BUDGET_SLICES.map((bar, index) => (
          <motion.div
            key={bar.label}
            {...listItemMotion}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="mb-1 flex justify-between text-[10px]">
              <span className="font-medium text-slate-800">
                {bar.label}{" "}
                <span className="font-normal text-slate-400">({bar.pct}%)</span>
              </span>
              <span className="font-semibold text-slate-900">
                {formatBudgetAmount(bar.amount)}
              </span>
            </div>
            <div className="h-3">
              <motion.div
                className={`h-full rounded-full ${bar.barColor}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${bar.pct}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + index * 0.1,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <BudgetDonutChart />
    </div>

    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        Top Expenses
      </p>
      <div className="mt-2 space-y-1.5">
        {[
          {
            name: "Rent",
            tag: "Needs",
            amount: "₱8,000",
            pct: "26%",
            dotColor: "bg-violet-600",
          },
          {
            name: "Groceries",
            tag: "Needs",
            amount: "₱4,500",
            pct: "15%",
            dotColor: "bg-violet-600",
          },
          {
            name: "Dining Out",
            tag: "Wants",
            amount: "₱3,000",
            pct: "10%",
            dotColor: "bg-violet-600",
          },
        ].map((expense, index) => (
          <motion.div
            key={expense.name}
            className="flex items-center justify-between text-[11px]"
            {...listItemMotion}
            transition={{ duration: 0.35, delay: 0.3 + index * 0.08 }}
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className={`size-1.5 shrink-0 rounded-full ${expense.dotColor}`}
                aria-hidden
              />
              <span className="font-medium text-slate-700">{expense.name}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">
                {expense.tag}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-mono font-semibold text-slate-900">
                {expense.amount}
              </span>
              <span className="ml-1.5 text-[10px] text-slate-400">
                {expense.pct}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const INVESTMENT_SPARKLINE =
  "M 0 26 Q 40 22, 80 18 T 160 12 T 240 6";
const INVESTMENT_SPARKLINE_AREA = `${INVESTMENT_SPARKLINE} L 240 32 L 0 32 Z`;

export const InvestmentsMockup = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-semibold text-slate-800">Portfolio Overview</p>
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-semibold text-violet-700">
        <span className="size-1.5 rounded-full bg-violet-500" />
        Live
      </span>
    </div>

    <div className="rounded-lg border border-slate-100 bg-white p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        Total Value
      </p>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
        <span className="text-lg font-bold text-slate-900">₱50,000</span>
        <span className="text-[10px] font-semibold text-violet-600">
          +₱4,350 (9.5%)
        </span>
      </div>
      <svg
        viewBox="0 0 240 32"
        className="mt-1.5 h-7 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="investmentSparkGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={INVESTMENT_SPARKLINE_AREA}
          fill="url(#investmentSparkGradient)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
        />
        <motion.path
          d={INVESTMENT_SPARKLINE}
          fill="none"
          stroke="#7c3aed"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
    </div>

    <div className="space-y-1.5">
      {[
        {
          letter: "A",
          name: "ACEN",
          type: "Stock",
          value: "₱15,000",
          change: "+12.5%",
          positive: true,
          color: "bg-violet-100 text-violet-700",
        },
        {
          letter: "B",
          name: "BPI UITF",
          type: "Mutual Fund",
          value: "₱25,000",
          change: "+8.2%",
          positive: true,
          color: "bg-violet-100 text-violet-700",
        },
        {
          letter: "B",
          name: "Bitcoin",
          type: "Crypto",
          value: "₱10,000",
          change: "-3.1%",
          positive: false,
          color: "bg-rose-100 text-rose-700",
        },
      ].map((asset, index) => (
        <motion.div
          key={asset.name}
          className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-2.5 py-2"
          {...listItemMotion}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-lg text-[10px] font-bold ${asset.color}`}
            >
              {asset.letter}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-800">{asset.name}</p>
              <p className="text-[9px] text-slate-400">{asset.type}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-900">{asset.value}</p>
            <p
              className={`text-[9px] font-semibold ${
                asset.positive ? "text-violet-600" : "text-rose-600"
              }`}
            >
              {asset.change}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export const FeatureBrowserMockup = ({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) => (
    <div className="landing-float overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-2.5">
      <div className="flex gap-1.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-rose-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
      </div>
      <span className="mx-auto truncate text-[10px] font-medium text-slate-400">
        {url}
      </span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);
