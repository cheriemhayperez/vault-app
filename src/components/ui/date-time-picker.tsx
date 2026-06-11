"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Calendar } from "lucide-react";

import { DatePickerCalendarPanel } from "@/components/ui/date-picker-calendar-panel";
import { FilterSelectMenu } from "@/components/shared/filter-select-menu";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import {
  parseDatetimeLocal,
  parseInputDate,
  toDatetimeLocalInput,
  toInputDate,
} from "@/utils/date/dateInput";
import { formatReminderTime } from "@/utils/reminderFormat";
import { computeFloatingMenuPosition } from "@/utils/positionFloatingMenu";

const MENU_WIDTH = 288;
const ESTIMATED_MENU_HEIGHT = 420;

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

type DayPeriod = "AM" | "PM";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

const HOUR_SELECT_OPTIONS = HOUR_OPTIONS.map((hour) => ({
  value: String(hour),
  label: String(hour),
}));

const MINUTE_SELECT_OPTIONS = MINUTE_OPTIONS.map((minute) => ({
  value: String(minute),
  label: String(minute).padStart(2, "0"),
}));

const PERIOD_SELECT_OPTIONS: { value: DayPeriod; label: string }[] = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

const to12HourParts = (
  date: Date,
): { hour12: number; minute: number; period: DayPeriod } => {
  const period: DayPeriod = date.getHours() >= 12 ? "PM" : "AM";
  let hour12 = date.getHours() % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  return { hour12, minute: date.getMinutes(), period };
};

const apply12HourParts = (
  date: Date,
  hour12: number,
  minute: number,
  period: DayPeriod,
): Date => {
  const next = new Date(date);
  let hours24 = hour12 % 12;
  if (period === "PM") {
    hours24 += 12;
  }
  if (hour12 === 12 && period === "AM") {
    hours24 = 0;
  }
  next.setHours(hours24, minute, 0, 0);
  return next;
};

export const DateTimePicker = ({
  value,
  onChange,
  id,
  className = "",
  placeholder = "Select date and time",
  disabled = false,
  "aria-label": ariaLabel = "Select date and time",
}: DateTimePickerProps) => {
  const { formatDate } = useVaultPreferences();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selectedDateTime = useMemo(() => parseDatetimeLocal(value), [value]);
  const selectedDate = selectedDateTime;
  const today = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState(() =>
    selectedDateTime ? selectedDateTime.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDateTime ? selectedDateTime.getMonth() : today.getMonth(),
  );

  const timeParts = useMemo(
    () => to12HourParts(selectedDateTime ?? today),
    [selectedDateTime, today],
  );

  const displayValue = selectedDateTime
    ? `${formatDate(toInputDate(selectedDateTime))} · ${formatReminderTime(selectedDateTime.toISOString())}`
    : placeholder;

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const menuHeight =
      menuRef.current?.offsetHeight ?? ESTIMATED_MENU_HEIGHT;

    setMenuStyle(
      computeFloatingMenuPosition(
        trigger.getBoundingClientRect(),
        menuHeight,
        { width: MENU_WIDTH },
      ),
    );
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuStyle(null);
      return;
    }
    updatePosition();
    const frameId = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, viewYear, viewMonth]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) {
        return;
      }
      if (menuRef.current?.contains(target)) {
        return;
      }
      if (
        target instanceof Element &&
        target.closest("[data-nested-popover-menu]")
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const openPicker = () => {
    if (disabled) {
      return;
    }
    if (selectedDateTime) {
      setViewYear(selectedDateTime.getFullYear());
      setViewMonth(selectedDateTime.getMonth());
    } else {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
    setIsOpen(true);
  };

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
      return;
    }
    setViewMonth((month) => month - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
      return;
    }
    setViewMonth((month) => month + 1);
  };

  const updateDateTime = (next: Date) => {
    onChange(toDatetimeLocalInput(next));
  };

  const handleSelectDate = (iso: string) => {
    const dateOnly = parseInputDate(iso);
    if (!dateOnly) {
      return;
    }

    const base = selectedDateTime ?? today;
    const next = new Date(
      dateOnly.getFullYear(),
      dateOnly.getMonth(),
      dateOnly.getDate(),
      base.getHours(),
      base.getMinutes(),
      0,
      0,
    );
    updateDateTime(next);
  };

  const handleTimeChange = (
    hour12: number,
    minute: number,
    period: DayPeriod,
  ) => {
    const base = selectedDateTime ?? today;
    updateDateTime(apply12HourParts(base, hour12, minute, period));
  };

  const handleSetToday = () => {
    updateDateTime(new Date());
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const menuPortal =
    isOpen && menuStyle && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[120] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)]"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
            <DatePickerCalendarPanel
              viewYear={viewYear}
              viewMonth={viewMonth}
              selectedDate={selectedDate}
              today={today}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onSelectDate={handleSelectDate}
              footer={
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-xs font-medium text-slate-600">
                      Time
                    </span>
                    <FilterSelectMenu
                      ariaLabel="Hour"
                      value={String(timeParts.hour12)}
                      options={HOUR_SELECT_OPTIONS}
                      minWidthClass="min-w-0 flex-1"
                      nestedPopover
                      onChange={(nextHour) =>
                        handleTimeChange(
                          Number(nextHour),
                          timeParts.minute,
                          timeParts.period,
                        )
                      }
                    />
                    <span className="text-slate-400">:</span>
                    <FilterSelectMenu
                      ariaLabel="Minute"
                      value={String(timeParts.minute)}
                      options={MINUTE_SELECT_OPTIONS}
                      minWidthClass="min-w-0 flex-1"
                      nestedPopover
                      menuClassName="max-h-48 overflow-y-auto"
                      onChange={(nextMinute) =>
                        handleTimeChange(
                          timeParts.hour12,
                          Number(nextMinute),
                          timeParts.period,
                        )
                      }
                    />
                    <FilterSelectMenu
                      ariaLabel="AM or PM"
                      value={timeParts.period}
                      options={PERIOD_SELECT_OPTIONS}
                      minWidthClass="min-w-[4.5rem]"
                      nestedPopover
                      onChange={(nextPeriod) =>
                        handleTimeChange(
                          timeParts.hour12,
                          timeParts.minute,
                          nextPeriod as DayPeriod,
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onChange("")}
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-700"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleSetToday}
                      className="text-xs font-medium text-violet-600 transition hover:text-violet-700"
                    >
                      Now
                    </button>
                  </div>
                </div>
              }
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={openPicker}
        className={`relative flex h-10 w-full items-center rounded-lg border bg-white py-0 pl-3 pr-10 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 ${
          isOpen
            ? "border-violet-500"
            : "border-slate-300 hover:border-slate-400"
        } ${selectedDateTime ? "text-slate-900" : "text-slate-400"} ${className}`}
      >
        <span className="truncate">{displayValue}</span>
        <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </button>
      {menuPortal}
    </>
  );
};
