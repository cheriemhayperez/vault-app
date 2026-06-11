"use client";

import { usePathname } from "next/navigation";

import { getPageMeta } from "@/components/layout/config/vault-nav";
import { PeriodFiltersRow } from "@/components/shared/period-filters";

export const VaultPageHeader = () => {
  const pathname = usePathname();

  if (
    pathname === "/records" ||
    pathname === "/categories" ||
    pathname === "/budget" ||
    pathname === "/expenses" ||
    pathname === "/reminders" ||
    pathname === "/investments" ||
    pathname === "/settings"
  ) {
    return null;
  }

  const { title, description } = getPageMeta(pathname);

  return (
    <div className="mb-4 w-full min-w-0 sm:mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-sans text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 font-sans text-xs tracking-tight text-slate-500 sm:text-sm">
            {description}
          </p>
        </div>

        <PeriodFiltersRow className="shrink-0 sm:pt-0.5" />
      </div>
    </div>
  );
};
