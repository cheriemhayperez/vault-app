"use client";

import Link from "next/link";
import { Bell, ChevronRight, PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";

import { getPageMeta } from "@/components/layout/config/vault-nav";
import { useLiveNow } from "@/features/system/use-live-now";
import { useAppSelector } from "@/store";
import { getNotificationBadgeCount } from "@/utils/reminderFormat";

interface VaultHeaderProps {
  onOpenMobileNav?: () => void;
}

export const VaultHeader = ({ onOpenMobileNav }: VaultHeaderProps) => {
  const pathname = usePathname();
  const { breadcrumb } = getPageMeta(pathname);
  const reminders = useAppSelector((state) => state.reminders);
  const now = useLiveNow(30_000);
  const badgeCount = getNotificationBadgeCount(reminders, now);
  const badgeLabel =
    badgeCount > 9 ? "9+" : badgeCount > 0 ? String(badgeCount) : null;

  return (
    <header className="sticky top-0 z-40 shrink-0 overflow-visible border-b border-slate-100 bg-white px-4 py-3 md:h-16 md:px-6 md:py-0">
      <div className="flex h-full w-full items-center justify-between gap-3 overflow-visible">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="inline-flex rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700 md:hidden"
            onClick={onOpenMobileNav}
          >
            <PanelLeft className="size-5" strokeWidth={2} />
          </button>

          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1.5 text-sm tracking-tight"
          >
            <Link
              href="/dashboard"
              className="truncate text-slate-500 transition-colors hover:text-violet-600"
            >
              Home
            </Link>
            <ChevronRight
              className="size-3.5 shrink-0 text-slate-300"
              strokeWidth={2}
              aria-hidden
            />
            <span className="truncate font-semibold text-slate-900">
              {breadcrumb}
            </span>
          </nav>
        </div>

        <div className="relative z-40 flex shrink-0 items-center overflow-visible">
          <Link
            href="/reminders"
            aria-label={
              badgeCount > 0
                ? `Reminders, ${badgeCount} notification${badgeCount === 1 ? "" : "s"}`
                : "Reminders"
            }
            className="relative inline-flex shrink-0 overflow-visible rounded-lg p-2 text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
          >
            <Bell className="size-5 md:size-4" strokeWidth={2} />
            {badgeLabel ? (
              <span
                className="pointer-events-none absolute -right-1 -top-1 z-50 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
                aria-hidden
              >
                {badgeLabel}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
};
