"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Calculator,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { VAULT_NAV_ITEMS } from "@/components/layout/config/vault-nav";
import { CountUpMetric } from "@/features/landing/count-up-metric";
import { HeroTrendChart } from "@/features/landing/hero-trend-chart";
import { HERO_DASHBOARD } from "@/features/landing/config";

type FloatingBadge = (typeof HERO_DASHBOARD.floatingBadges)[number];

const FLOATING_ICONS: Record<FloatingBadge["icon"], LucideIcon> = {
  calculator: Calculator,
  "trending-up": TrendingUp,
  bell: Bell,
};

const BADGE_PLACEMENT: Record<FloatingBadge["placement"], string> = {
  "top-left":
    "landing-float-delayed hidden sm:flex -top-4 left-0 md:-top-5 md:-left-1",
  "bottom-left":
    "landing-float hidden sm:flex -bottom-3 -left-2 md:-bottom-4 md:-left-3",
  "right-mid":
    "landing-float hidden sm:flex -right-2 top-[31%] md:-right-3 md:top-[32%]",
};

const SIDEBAR_ITEMS = VAULT_NAV_ITEMS.slice(0, 5);

const FloatingBadge = ({
  badge,
  delay = 0.75,
}: {
  badge: FloatingBadge;
  delay?: number;
}) => {
  const Icon = FLOATING_ICONS[badge.icon];

  return (
    <motion.div
      className={`absolute z-20 flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-lg sm:px-3 sm:py-2 ${BADGE_PLACEMENT[badge.placement]}`}
      initial={{ opacity: 0, y: 6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay }}
    >
      <Icon className="size-3.5 shrink-0 text-violet-600" aria-hidden />
      <span className="text-[10px] leading-tight sm:text-xs">
        <span className="text-slate-500">{badge.prefix}</span>{" "}
        <span
          className={
            "emphasisClass" in badge && badge.emphasisClass
              ? badge.emphasisClass
              : "font-bold text-slate-900"
          }
        >
          {badge.emphasis}
        </span>
      </span>
    </motion.div>
  );
};

export const HeroDashboardMockup = () => (
  <div className="relative mx-auto w-full max-w-xl px-4 pt-4 pb-5 sm:max-w-2xl sm:px-5 sm:pt-9 sm:pb-6 lg:max-w-none lg:px-0">
    <div className="relative">
    <motion.div
      className="landing-float relative w-full overflow-visible rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-violet-200/40"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="mx-auto truncate text-[10px] font-medium text-slate-400 sm:text-[11px]">
          {HERO_DASHBOARD.url}
        </span>
      </div>

      <div className="flex">
        <aside className="flex w-11 shrink-0 flex-col items-center gap-2 border-r border-slate-100 bg-white py-3.5 sm:w-12">
          {SIDEBAR_ITEMS.map((item, index) => {
            const isActive = index === 0;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.href}
                className={`flex size-8 items-center justify-center rounded-lg sm:size-9 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                    : "text-slate-400"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.25 + index * 0.04 }}
                aria-hidden
              >
                <Icon className="size-3.5 sm:size-4" />
              </motion.div>
            );
          })}
        </aside>

        <div className="min-w-0 flex-1 bg-slate-50/40 p-2.5 sm:p-4">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
            {HERO_DASHBOARD.metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="flex min-h-[4.25rem] flex-col gap-0.5 rounded-lg border border-slate-100 bg-white p-1.5 shadow-sm sm:min-h-[4.5rem] sm:gap-1 sm:p-2 xl:min-h-[4.75rem] xl:p-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.06 }}
              >
                <p className="shrink-0 text-[8px] font-medium uppercase leading-none tracking-wide text-slate-400 sm:text-[9px] xl:text-[10px] xl:tracking-wider">
                  {metric.label}
                </p>

                {"isPercent" in metric && metric.isPercent ? (
                  <>
                    <p className="font-sans text-[11px] font-bold leading-none tabular-nums tracking-tight text-violet-600 sm:text-xs xl:text-base">
                      {metric.value}%
                    </p>
                    {"showBar" in metric && metric.showBar ? (
                      <div className="mt-auto pt-1.5">
                        <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className="h-full rounded-full bg-violet-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{
                              duration: 0.9,
                              delay: 0.55,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <CountUpMetric
                      value={metric.value}
                      className="block font-sans text-[11px] font-bold leading-none tabular-nums tracking-tight text-slate-900 sm:text-xs xl:text-base"
                    />
                    {"footnote" in metric && metric.footnote ? (
                      <p
                        className={`mt-auto text-[8px] font-medium leading-none sm:text-[9px] xl:text-[10px] ${metric.footnoteClass ?? "text-slate-400"}`}
                      >
                        {metric.footnote}
                      </p>
                    ) : (
                      <span className="mt-auto block min-h-[8px] xl:min-h-[10px]" aria-hidden />
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </div>

          <HeroTrendChart compact />

          <motion.div
            className="mt-3.5 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Recent Records
            </p>
            <div className="mt-2 space-y-2">
              {HERO_DASHBOARD.records.map((record, index) => (
                <motion.div
                  key={record.id}
                  className="flex items-center justify-between gap-3"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.65 + index * 0.08 }}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`size-2 shrink-0 rounded-full ${record.dotClass}`}
                      aria-hidden
                    />
                    <span className="truncate text-[11px] text-slate-400 sm:text-xs">
                      {record.label}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-900 sm:text-xs">
                    ₱{record.amount.toLocaleString("en-PH")}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>

    {HERO_DASHBOARD.floatingBadges.map((badge, index) => (
      <FloatingBadge key={badge.id} badge={badge} delay={0.75 + index * 0.12} />
    ))}
    </div>
  </div>
);
