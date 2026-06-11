"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  getPageListItems,
  getShowingRange,
  getTotalPages,
} from "@/utils/pagination";

const numberFormatter = new Intl.NumberFormat("en-PH");

interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  showingRangeStart?: number;
  showingRangeEnd?: number;
  onPageChange: (page: number) => void;
}

export const TablePagination = ({
  currentPage,
  pageSize,
  totalItems,
  showingRangeStart,
  showingRangeEnd,
  onPageChange,
}: TablePaginationProps) => {
  const totalPages = getTotalPages(totalItems, pageSize);
  const derivedRange = getShowingRange(currentPage, pageSize, totalItems);
  const rangeStart = showingRangeStart ?? derivedRange.start;
  const rangeEnd = showingRangeEnd ?? derivedRange.end;
  const pageItems = getPageListItems(currentPage, totalPages);

  if (totalItems === 0) {
    return null;
  }

  const goToPage = (page: number) => {
    onPageChange(Math.min(Math.max(1, page), totalPages));
  };

  const hasMultiplePages = totalPages > 1;

  return (
    <div className="flex flex-col gap-4 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
      {hasMultiplePages ? (
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>

          <div className="flex items-center gap-0.5 px-1">
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex size-9 items-center justify-center text-sm text-slate-500"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToPage(item)}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={`flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    item === currentPage
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : (
        <div />
      )}

      <p className="text-sm text-slate-600">
        Showing{" "}
        <span className="font-medium text-slate-900">
          {rangeStart === 0 && rangeEnd === 0
            ? "0"
            : rangeStart === rangeEnd
              ? numberFormatter.format(rangeStart)
              : `${numberFormatter.format(rangeStart)}-${numberFormatter.format(rangeEnd)}`}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-900">
          {numberFormatter.format(totalItems)}
        </span>{" "}
        results
      </p>
    </div>
  );
};
