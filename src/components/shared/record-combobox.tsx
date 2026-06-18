"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
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

const COMBOBOX_MENU_CLASS =
  "vault-combobox-menu fixed z-[130] max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white pt-1.5 pb-2.5 shadow-lg dark:border-vault-subtle dark:bg-vault-surface";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

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

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleReposition = () => updateMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) {
        return;
      }
      if (menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", handlePointerDown);
    }, 0);

    document.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  const menuPortal =
    isOpen && !disabled && menuStyle && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={menuRef}
            id={listboxId}
            role="listbox"
            className={COMBOBOX_MENU_CLASS}
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
            {options.length === 0 ? (
              <li className="px-4 py-2.5 text-sm text-slate-500 dark:text-zinc-400">
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
                      className="vault-combobox-option"
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
                        <Check className="vault-combobox-check size-4 shrink-0" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
          {label}
          {required ? <span className="text-rose-500"> *</span> : null}
        </label>

        <div className="relative">
          <button
            ref={triggerRef}
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
            className={`vault-field-control flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm ${
              disabled
                ? "vault-field-control--disabled cursor-not-allowed"
                : isOpen
                  ? "vault-field-control--open"
                  : ""
            }`}
          >
            <span
              className={`flex min-w-0 flex-1 items-center gap-2.5 ${
                isPlaceholder
                  ? "text-slate-400 dark:text-zinc-500"
                  : "font-medium text-slate-900 dark:text-zinc-50"
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
        </div>

        {helperText ? <div>{helperText}</div> : null}
      </div>
      {menuPortal}
    </>
  );
};
