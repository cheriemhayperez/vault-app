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
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import { parseInputDate } from "@/utils/date/dateInput";
import { computeFloatingMenuPosition } from "@/utils/positionFloatingMenu";

const MENU_WIDTH = 288;
const ESTIMATED_MENU_HEIGHT = 320;

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export const DatePicker = ({
  value,
  onChange,
  id,
  className = "",
  placeholder = "Select date",
  disabled = false,
  "aria-label": ariaLabel = "Select date",
}: DatePickerProps) => {
  const { formatDate } = useVaultPreferences();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selectedDate = useMemo(() => parseInputDate(value), [value]);
  const today = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState(() =>
    selectedDate ? selectedDate.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDate ? selectedDate.getMonth() : today.getMonth(),
  );

  const displayValue = selectedDate
    ? formatDate(`${value}T12:00:00.000Z`)
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

  const openCalendar = () => {
    if (disabled) {
      return;
    }
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
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
              onSelectDate={(iso) => {
                onChange(iso);
                setIsOpen(false);
              }}
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
        onClick={openCalendar}
        className={`vault-field-control relative flex h-10 w-full items-center rounded-lg py-0 pl-3 pr-10 text-left text-sm outline-none ring-0 transition disabled:cursor-not-allowed ${
          isOpen ? "vault-field-control--open" : ""
        } ${selectedDate ? "" : "text-slate-400"} ${className}`}
      >
        <span className="truncate">{displayValue}</span>
        <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </button>
      {menuPortal}
    </>
  );
};
