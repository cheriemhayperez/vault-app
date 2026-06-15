"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

import {
  getCategoryColorSwatchClass,
  type PayCategoryColorId,
} from "@/types/categories";

export interface FilterSelectOption {
  value: string;
  label: string;
  menuLabel?: string;
  /** Shown before label in the trigger (e.g. currency symbol). */
  symbol?: string;
  colorId?: PayCategoryColorId;
}

interface FilterSelectMenuProps {
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  triggerPrefix?: ReactNode;
  ariaLabel: string;
  minWidthClass?: string;
  /** Keeps parent popovers open when this menu portals to document.body. */
  nestedPopover?: boolean;
  menuClassName?: string;
}

export const FilterSelectMenu = ({
  value,
  options,
  onChange,
  triggerPrefix,
  ariaLabel,
  minWidthClass = "min-w-48",
  nestedPopover = false,
  menuClassName = "",
}: FilterSelectMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const selected = options.find((option) => option.value === value) ?? options[0];
  const showColorBadge = Boolean(selected?.colorId && value !== "all");

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 4,
      left: rect.left,
      minWidth: rect.width,
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

    const timer = window.setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const menuPortal =
    isOpen && menuStyle && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            {...(nestedPopover ? { "data-nested-popover-menu": "" } : {})}
            className={`fixed ${nestedPopover ? "z-[130]" : "z-[100]"} w-max max-w-[min(100vw-1rem,24rem)] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-vault-subtle dark:bg-vault-surface ${menuClassName}`}
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
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="vault-combobox-option"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    {option.colorId ? (
                      <span
                        className={`size-2 shrink-0 rounded-full ${getCategoryColorSwatchClass(option.colorId)}`}
                      />
                    ) : null}
                    <span className="truncate font-medium">
                      {option.menuLabel ?? option.label}
                    </span>
                  </span>
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
      <div className={`relative ${minWidthClass}`}>
        <button
          ref={triggerRef}
          type="button"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((open) => !open);
          }}
          className={`vault-field-control vault-select-trigger flex h-9 w-full items-center gap-2 py-0 pr-8 text-left text-sm outline-none focus:ring-0 ${
            isOpen ? "vault-field-control--open" : ""
          } ${triggerPrefix ? "pl-9" : "pl-3"}`}
        >
          {triggerPrefix ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {triggerPrefix}
            </span>
          ) : null}
          {showColorBadge && selected?.colorId ? (
            <span
              className={`size-2 shrink-0 rounded-full ${getCategoryColorSwatchClass(selected.colorId)}`}
            />
          ) : null}
          <span className="flex min-w-0 flex-1 items-center truncate">
            {selected?.symbol ? (
              <>
                <span className="vault-select-trigger-symbol shrink-0">
                  {selected.symbol}
                </span>
                <span className="ml-1.5 truncate">{selected.label}</span>
              </>
            ) : (
              selected?.label
            )}
          </span>
          <ChevronDown
            className={`vault-select-trigger-chevron pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {menuPortal}
    </>
  );
};
