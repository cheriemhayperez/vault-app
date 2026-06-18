"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";

interface InvestmentActionsMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReturn: () => void;
  onRecordIncome: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MENU_WIDTH = 208;
const MENU_VIEWPORT_PADDING = 8;
const ESTIMATED_MENU_HEIGHT = 184;

export const InvestmentActionsMenu = ({
  isOpen,
  onOpenChange,
  onAddReturn,
  onRecordIncome,
  onEdit,
  onDelete,
}: InvestmentActionsMenuProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuHeight =
      menuRef.current?.offsetHeight ?? ESTIMATED_MENU_HEIGHT;
    const maxTop = window.innerHeight - menuHeight - MENU_VIEWPORT_PADDING;

    let top = rect.bottom + 4;
    if (top > maxTop) {
      top = rect.top - menuHeight - 4;
    }
    top = Math.max(MENU_VIEWPORT_PADDING, Math.min(top, maxTop));

    const left = Math.max(
      MENU_VIEWPORT_PADDING,
      Math.min(
        rect.right - MENU_WIDTH,
        window.innerWidth - MENU_WIDTH - MENU_VIEWPORT_PADDING,
      ),
    );

    setMenuStyle({ top, left });
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuStyle(null);
      return;
    }
    updatePosition();
    const frame = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
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
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) {
        return;
      }
      if (menuRef.current?.contains(target)) {
        return;
      }
      onOpenChange(false);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const menuPortal =
    isOpen && menuStyle && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="vault-investment-actions-menu fixed z-[200] min-w-[13rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            style={{ top: menuStyle.top, left: menuStyle.left }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onAddReturn();
              }}
              className="vault-investment-actions-menu-item flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
            >
              <Plus className="vault-investment-actions-menu-icon size-4" />
              Add Return/Payout
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onRecordIncome();
              }}
              className="vault-investment-actions-menu-item flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
            >
              <Wallet className="vault-investment-actions-menu-icon size-4" />
              Record as Income
            </button>
            <div className="vault-investment-actions-menu-divider my-1 border-t border-slate-100" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
              className="vault-investment-actions-menu-item flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
            >
              <Pencil className="vault-investment-actions-menu-icon size-4" />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onDelete();
              }}
              className="vault-investment-actions-menu-delete flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!isOpen);
        }}
        className="vault-investment-actions-trigger flex items-center justify-center p-1"
        aria-label="Investment actions"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {menuPortal}
    </>
  );
};
