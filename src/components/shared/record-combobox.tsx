"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface RecordComboboxOption {
  value: string;
  label: string;
  colorSwatchClass?: string;
}

const ColorSwatch = ({ className }: { className: string }) => (
  <span
    className={`size-2.5 shrink-0 rounded-full ${className}`}
    aria-hidden
  />
);

interface RecordComboboxProps {
  label: string;
  placeholder: string;
  value: string;
  options: RecordComboboxOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  emptyValue?: string;
  hasUserSelection?: boolean;
  required?: boolean;
}

export const RecordCombobox = ({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  helperText,
  isOpen: controlledOpen,
  onOpenChange,
  emptyValue,
  hasUserSelection = false,
  required = false,
}: RecordComboboxProps) => {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const selectedOption = options.find((option) => option.value === value);
  const isEmptySelection =
    emptyValue !== undefined ? value === emptyValue : false;
  const showAsUnset = isEmptySelection && !hasUserSelection;
  const displayLabel = showAsUnset
    ? placeholder
    : (selectedOption?.label ?? placeholder);
  const isPlaceholder = !selectedOption || showAsUnset;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={() => {
            if (!disabled) {
              setOpen(!isOpen);
            }
          }}
          className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-left text-sm transition ${
            disabled
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : isOpen
                ? "border-violet-500 bg-white text-slate-900"
                : "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
          }`}
        >
          <span
            className={`flex min-w-0 flex-1 items-center gap-2.5 ${
              isPlaceholder ? "text-slate-400" : "font-medium text-slate-900"
            }`}
          >
            {!isPlaceholder && selectedOption?.colorSwatchClass ? (
              <ColorSwatch className={selectedOption.colorSwatchClass} />
            ) : null}
            <span className="truncate">{displayLabel}</span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && !disabled ? (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {options.length === 0 ? (
              <li className="px-4 py-2.5 text-sm text-slate-500">
                No categories available
              </li>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-900 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-2.5">
                        {option.colorSwatchClass ? (
                          <ColorSwatch className={option.colorSwatchClass} />
                        ) : null}
                        <span className="truncate font-medium">
                          {option.label}
                        </span>
                      </span>
                      {isSelected ? (
                        <Check className="size-4 shrink-0 text-violet-600" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        ) : null}
      </div>

      {helperText ? <div>{helperText}</div> : null}
    </div>
  );
};
