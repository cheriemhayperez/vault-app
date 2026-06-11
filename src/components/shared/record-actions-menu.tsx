"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface RecordActionsMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  triggerClassName?: string;
}

const MENU_WIDTH = 120;

const DEFAULT_TRIGGER_CLASS =
  "flex items-center justify-center p-1 text-slate-400 transition hover:text-slate-600";

export const RecordActionsMenu = ({
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
  triggerClassName = DEFAULT_TRIGGER_CLASS,
}: RecordActionsMenuProps) => {
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
    setMenuStyle({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
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
            className="fixed z-[100] min-w-[7.5rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            style={{ top: menuStyle.top, left: menuStyle.left }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="size-4 text-slate-500" />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-500 transition hover:bg-rose-50"
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
        className={triggerClassName}
        aria-label="Record actions"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {menuPortal}
    </>
  );
};
