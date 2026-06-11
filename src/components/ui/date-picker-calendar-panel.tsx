"use client";

import { useMemo, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  getCalendarDays,
  isSameDay,
  MONTH_NAMES,
  WEEKDAY_LABELS,
} from "@/utils/date/dateInput";

interface DatePickerCalendarPanelProps {
  viewYear: number;
  viewMonth: number;
  selectedDate: Date | null;
  today: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (iso: string) => void;
  footer?: ReactNode;
}

export const DatePickerCalendarPanel = ({
  viewYear,
  viewMonth,
  selectedDate,
  today,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
  footer,
}: DatePickerCalendarPanelProps) => {
  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
        <button
          type="button"
          onClick={onPreviousMonth}
          className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-semibold text-slate-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={onNextMonth}
          className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0 px-2 pt-2">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="py-1 text-center text-[11px] font-medium text-slate-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0 px-2 pb-3">
        {calendarDays.map((cell) => {
          const isSelected =
            selectedDate !== null && isSameDay(cell.date, selectedDate);
          const isToday = isSameDay(cell.date, today);

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelectDate(cell.iso)}
              className={`mx-auto my-0.5 flex size-8 items-center justify-center rounded-lg text-sm transition ${
                isSelected
                  ? "bg-violet-600 font-semibold text-white"
                  : cell.inMonth
                    ? "text-slate-900 hover:bg-violet-50 hover:text-violet-700"
                    : "text-slate-300 hover:bg-slate-50"
              } ${isToday && !isSelected ? "ring-1 ring-violet-300" : ""}`}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>

      {footer ? (
        <div className="border-t border-slate-100 px-3 py-3">{footer}</div>
      ) : null}
    </>
  );
};
