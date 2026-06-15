"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Calendar, Check, ChevronDown } from "lucide-react";

import { useDashboardPeriod } from "@/contexts/dashboard-period-context";
import {
  PERIOD_MONTH_NAMES,
  PERIOD_YEAR_OPTIONS,
  type DashboardPeriodType,
} from "@/utils/periodFilter";

const PERIOD_TYPE_OPTIONS: { value: DashboardPeriodType; label: string }[] = [
  { value: "all-time", label: "All Time" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "range", label: "Range" },
];

const FILTER_MENU_PANEL =
  "fixed z-[100] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.12)] dark:border-vault-subtle dark:bg-vault-surface";

const FILTER_TRIGGER =
  "vault-field-control vault-select-trigger vault-period-filter-trigger flex h-9 w-full items-center rounded-lg py-0 pr-8 text-left text-sm font-medium tracking-tight outline-none focus:ring-0";

type FilterDropdownVariant = "violet" | "neutral";

const abbreviateMonth = (month: string): string => month.slice(0, 3);

interface FilterDropdownOption {
  value: string;
  label: string;
}

const FilterDropdown = ({
  id,
  ariaLabel,
  value,
  options,
  onChange,
  minWidth = "5.25rem",
  prefixIcon,
  triggerClassName = "",
  formatTriggerLabel,
  variant = "violet",
  menuAlign = "left",
}: {
  id: string;
  ariaLabel: string;
  value: string;
  options: FilterDropdownOption[];
  onChange: (value: string) => void;
  minWidth?: string;
  prefixIcon?: React.ReactNode;
  triggerClassName?: string;
  formatTriggerLabel?: (option: FilterDropdownOption) => string;
  variant?: FilterDropdownVariant;
  menuAlign?: "left" | "right";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const selected =
    options.find((option) => option.value === value) ?? options[0];

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, 168);
    const viewportPadding = 8;

    let left =
      menuAlign === "right" ? rect.right - menuWidth : rect.left;

    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - menuWidth - viewportPadding),
    );

    setMenuStyle({
      top: rect.bottom + 4,
      left,
      minWidth: menuWidth,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuStyle(null);
      return;
    }
    updatePosition();
  }, [isOpen]);

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

  const triggerBase = FILTER_TRIGGER;

  const menuPortal =
    isOpen && menuStyle && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={`${id}-menu`}
            role="listbox"
            aria-label={ariaLabel}
            className={FILTER_MENU_PANEL}
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              minWidth: menuStyle.minWidth,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="vault-combobox-option"
                >
                  <span className="truncate font-medium">{option.label}</span>
                  {isSelected ? (
                    <Check
                      className="vault-combobox-check size-4 shrink-0"
                      strokeWidth={2.5}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        className="relative shrink-0"
        style={{ minWidth }}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${id}-menu`}
          onClick={() => setIsOpen((open) => !open)}
          className={`${triggerBase} ${prefixIcon ? "pl-9" : "pl-3"} ${
            isOpen ? "vault-field-control--open" : ""
          } ${triggerClassName}`}
        >
          {prefixIcon}
          <span className="truncate">
            {formatTriggerLabel?.(selected) ?? selected.label}
          </span>
          <ChevronDown
            className={`vault-select-trigger-chevron pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {menuPortal}
    </>
  );
};

interface PeriodFiltersRowProps {
  className?: string;
}

export const PeriodFiltersRow = ({ className = "" }: PeriodFiltersRowProps) => {
  const {
    periodType,
    month,
    endMonth,
    year,
    setPeriodType,
    setMonth,
    setEndMonth,
    setYear,
  } = useDashboardPeriod();

  const monthOptions = PERIOD_MONTH_NAMES.map((label) => ({ value: label, label }));
  const yearOptions = PERIOD_YEAR_OPTIONS.map((label) => ({ value: label, label }));

  const showStartMonth = periodType === "month" || periodType === "range";
  const showEndMonth = periodType === "range";
  const showYear =
    periodType === "month" ||
    periodType === "year" ||
    periodType === "range";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <FilterDropdown
        id="dashboard-period-type"
        ariaLabel="Period type"
        value={periodType}
        minWidth="6.5rem"
        options={PERIOD_TYPE_OPTIONS}
        onChange={(value) => setPeriodType(value as DashboardPeriodType)}
        prefixIcon={
          <Calendar className="vault-period-filter-calendar pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        }
      />

      {showStartMonth ? (
        <FilterDropdown
          id="dashboard-period-month"
          ariaLabel={periodType === "range" ? "Start month" : "Month"}
          value={month}
          onChange={setMonth}
          options={monthOptions}
          formatTriggerLabel={(option) =>
            periodType === "range" ? option.label : abbreviateMonth(option.value)
          }
          minWidth={periodType === "range" ? "6.5rem" : "5.5rem"}
        />
      ) : null}

      {showEndMonth ? (
        <>
          <span className="px-0.5 text-sm font-medium text-slate-400">to</span>
          <FilterDropdown
            id="dashboard-period-end-month"
            ariaLabel="End month"
            value={endMonth}
            onChange={setEndMonth}
            options={monthOptions}
            minWidth="6.5rem"
          />
        </>
      ) : null}

      {showYear ? (
        <FilterDropdown
          id="dashboard-period-year"
          ariaLabel="Year"
          value={year}
          onChange={setYear}
          options={yearOptions}
          minWidth="5.25rem"
        />
      ) : null}
    </div>
  );
};

export type { DashboardPeriodType };

interface CompactPeriodFilterProps {
  className?: string;
}

/** Single period-type dropdown (All Time / Month / Year / Range) for compact headers. */
export const CompactPeriodFilter = ({
  className = "",
}: CompactPeriodFilterProps) => {
  const { periodType, setPeriodType } = useDashboardPeriod();

  return (
    <div className={className}>
      <FilterDropdown
        id="compact-period-type"
        ariaLabel="Period type"
        value={periodType}
        minWidth="7.5rem"
        menuAlign="right"
        options={PERIOD_TYPE_OPTIONS}
        onChange={(value) => setPeriodType(value as DashboardPeriodType)}
        prefixIcon={
          <Calendar className="vault-period-filter-calendar pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        }
      />
    </div>
  );
};
