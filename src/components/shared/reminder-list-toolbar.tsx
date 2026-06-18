"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { FilterSelectMenu } from "@/components/shared/filter-select-menu";

const PAGE_SIZE_OPTIONS = [
  { value: "5", label: "5" },
  { value: "10", label: "10" },
  { value: "30", label: "30" },
  { value: "60", label: "60" },
] as const;

interface ReminderListToolbarProps {
  rangeStart: number;
  rangeEnd: number;
  totalCount: number;
  pageSize: string;
  currentPage: number;
  totalPages: number;
  onPageSizeChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export const ReminderListToolbar = ({
  rangeStart,
  rangeEnd,
  totalCount,
  pageSize,
  currentPage,
  totalPages,
  onPageSizeChange,
  onPageChange,
}: ReminderListToolbarProps) => (
  <div className="vault-reminder-list-toolbar relative flex flex-wrap items-center justify-between gap-3 px-4 py-3">
    <p className="text-sm text-slate-500 dark:text-white">
      Showing{" "}
      <span className="font-medium text-slate-700 dark:text-white">
        {rangeStart === rangeEnd
          ? rangeStart.toLocaleString("en-PH")
          : `${rangeStart.toLocaleString("en-PH")}–${rangeEnd.toLocaleString("en-PH")}`}
      </span>{" "}
      of{" "}
      <span className="font-medium text-slate-700 dark:text-white">
        {totalCount.toLocaleString("en-PH")}
      </span>
    </p>

    <div className="flex items-center gap-2">
      {totalPages > 1 ? (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[2.5rem] text-center text-xs tabular-nums text-slate-500 dark:text-white">
            {currentPage}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}

      <span className="text-sm text-slate-500 dark:text-white">Show:</span>
      <FilterSelectMenu
        value={pageSize}
        options={[...PAGE_SIZE_OPTIONS]}
        onChange={onPageSizeChange}
        ariaLabel="Reminders per page"
        minWidthClass="min-w-[4.5rem]"
      />
    </div>
  </div>
);

export const REMINDER_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
