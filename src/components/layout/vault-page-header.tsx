"use client";

import { usePathname } from "next/navigation";

import { getPageMeta } from "@/components/layout/config/vault-nav";
import { PeriodFiltersRow } from "@/components/shared/period-filters";
import { useVaultPageHeaderActions } from "@/contexts/vault-page-header-actions-context";

const PERIOD_FILTER_PATHS = new Set(["/dashboard", "/investments"]);

export const VaultPageHeader = () => {
  const pathname = usePathname();
  const { title, description } = getPageMeta(pathname);
  const { actions } = useVaultPageHeaderActions();
  const showPeriodFilters = PERIOD_FILTER_PATHS.has(pathname);
  const trailing = actions ?? (showPeriodFilters ? <PeriodFiltersRow /> : null);

  return (
    <div className="mb-4 w-full min-w-0 sm:mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-sans text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 font-sans text-xs tracking-tight text-slate-500 sm:text-sm">
            {description}
          </p>
        </div>

        {trailing ? (
          <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:pt-0">
            {trailing}
          </div>
        ) : null}
      </div>
    </div>
  );
};
