"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { LogOut, Settings } from "lucide-react";

import { useVaultProfile } from "@/contexts/vault-profile-context";
import { supabase } from "@/lib/supabaseClient";
import { getVaultUserInitials } from "@/api/user";

interface SidebarUserProfileProps {
  isCollapsed: boolean;
}

const MENU_WIDTH = 240;
const MENU_GAP = 8;

export const SidebarUserProfile = ({ isCollapsed }: SidebarUserProfileProps) => {
  const router = useRouter();
  const { profile } = useVaultProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ bottom: number; left: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = profile.displayName;
  const initials = getVaultUserInitials(displayName);
  const email = profile.email;
  const avatarUrl = profile.avatarUrl;

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setMenuStyle({
      bottom: window.innerHeight - rect.top + MENU_GAP,
      left: Math.max(8, rect.left),
    });
  };

  useLayoutEffect(() => {
    if (!isMenuOpen) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
  }, [isMenuOpen, isCollapsed]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleReposition = () => updateMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isMenuOpen, isCollapsed]);

  useEffect(() => {
    if (!isMenuOpen) {
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
      setIsMenuOpen(false);
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setIsMenuOpen(false);

    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const menuPortal =
    isMenuOpen && menuStyle && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[100] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_8px_30px_-6px_rgba(76,29,149,0.18)]"
            style={{
              bottom: menuStyle.bottom,
              left: menuStyle.left,
              width: isCollapsed ? MENU_WIDTH : Math.max(MENU_WIDTH, triggerRef.current?.offsetWidth ?? MENU_WIDTH),
            }}
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              {email ? (
                <p className="mt-0.5 truncate text-xs text-slate-500">{email}</p>
              ) : null}
            </div>

            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center gap-2.5 border-b border-slate-100 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-violet-50"
            >
              <Settings className="size-4 shrink-0 text-violet-600" strokeWidth={2} />
              Settings
            </Link>

            <button
              type="button"
              role="menuitem"
              disabled={isSigningOut}
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="size-4 shrink-0" strokeWidth={2} />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={`shrink-0 border-t border-slate-100 pt-2.5 pb-4 max-md:pb-[calc(1rem+env(safe-area-inset-bottom,0px))] dark:border-slate-800 ${
        isCollapsed ? "px-2" : "px-4"
      }`}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label="Account menu"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        className={`flex w-full items-center gap-3 rounded-lg text-left transition ${
          isMenuOpen
            ? "bg-violet-50 text-violet-700"
            : "text-slate-600 hover:bg-violet-50 hover:text-slate-900"
        } ${isCollapsed ? "justify-center px-2 py-2" : "px-1 py-2.5"}`}
      >
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-600 text-xs font-bold text-white shadow-sm shadow-violet-500/20">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        {!isCollapsed ? (
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-tight text-slate-500">
              Account
            </p>
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
              {displayName}
            </p>
          </div>
        ) : null}
      </button>
      {menuPortal}
    </div>
  );
};
