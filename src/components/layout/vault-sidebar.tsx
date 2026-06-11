"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { SidebarUserProfile } from "@/components/layout/sidebar-user-profile";
import {
  VAULT_NAV_ITEMS,
  isNavActive,
  type VaultNavItem,
} from "@/components/layout/config/vault-nav";

interface VaultSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface SidebarTooltipState {
  label: string;
  top: number;
  left: number;
}

const SidebarNavLink = ({
  item,
  isActive,
  navCollapsed,
  onMobileClose,
  onTooltipChange,
}: {
  item: VaultNavItem;
  isActive: boolean;
  navCollapsed: boolean;
  onMobileClose?: () => void;
  onTooltipChange: (tooltip: SidebarTooltipState | null) => void;
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const showTooltip = () => {
    if (!navCollapsed || !linkRef.current) {
      return;
    }

    const rect = linkRef.current.getBoundingClientRect();
    onTooltipChange({
      label: item.label,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const hideTooltip = () => {
    onTooltipChange(null);
  };

  return (
    <Link
      ref={linkRef}
      href={item.href}
      aria-label={navCollapsed ? item.label : undefined}
      onClick={onMobileClose}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-violet-50 text-violet-700"
          : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
      } ${navCollapsed ? "justify-center px-2" : ""}`}
    >
      {isActive ? (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-violet-600" />
      ) : null}
      <span className={isActive ? "text-violet-600" : "text-slate-500"}>
        <item.icon className="size-4" />
      </span>
      {!navCollapsed ? <span>{item.label}</span> : null}
    </Link>
  );
};

export const VaultSidebar = ({
  mobileOpen = false,
  onMobileClose,
}: VaultSidebarProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarTooltip, setSidebarTooltip] =
    useState<SidebarTooltipState | null>(null);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!isCollapsed) {
      setSidebarTooltip(null);
    }
  }, [isCollapsed]);

  const handleMobileDrawerExit = () => {
    document.body.style.overflow = "";
  };

  const renderNavLinks = (navCollapsed: boolean) => (
    <nav className="space-y-0.5">
      {VAULT_NAV_ITEMS.map((item) => (
        <SidebarNavLink
          key={item.href}
          item={item}
          isActive={isNavActive(pathname, item.href)}
          navCollapsed={navCollapsed}
          onMobileClose={onMobileClose}
          onTooltipChange={setSidebarTooltip}
        />
      ))}
    </nav>
  );

  const tooltipPortal =
    sidebarTooltip && typeof document !== "undefined"
      ? createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[200] -translate-y-1/2 whitespace-nowrap rounded-lg bg-violet-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg shadow-violet-900/20"
            style={{
              top: sidebarTooltip.top,
              left: sidebarTooltip.left,
            }}
          >
            {sidebarTooltip.label}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {tooltipPortal}
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-violet-100 bg-white transition-all duration-300 md:flex ${
          isCollapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-slate-100 ${
            isCollapsed
              ? "justify-center gap-1 px-2"
              : "justify-between gap-2 px-4"
          }`}
        >
          {isCollapsed ? (
            <Link
              href="/dashboard"
              className="text-base font-bold leading-none tracking-tight text-violet-600 transition-colors hover:text-violet-700"
            >
              V
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-violet-700"
            >
              Vault
            </Link>
          )}
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={() => setIsCollapsed((value) => !value)}
          >
            {isCollapsed ? (
              <ChevronsRight className="size-4" strokeWidth={2} />
            ) : (
              <ChevronsLeft className="size-4" strokeWidth={2} />
            )}
          </button>
        </div>

        <div
          className={`flex min-h-0 flex-1 flex-col pt-4 ${isCollapsed ? "px-2" : "px-4"}`}
        >
          {!isCollapsed ? (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Main
            </p>
          ) : null}

          {renderNavLinks(isCollapsed)}
        </div>

        <SidebarUserProfile isCollapsed={isCollapsed} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence onExitComplete={handleMobileDrawerExit}>
        {mobileOpen ? (
          <div
            key="mobile-drawer"
            className="fixed inset-0 z-40 md:hidden"
            data-mobile-drawer
          >
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 bg-slate-900/40"
              aria-label="Close navigation menu"
              onClick={onMobileClose}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute left-0 top-0 flex h-full w-[70vw] max-w-[18rem] flex-col border-r border-violet-100 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <Link
                  href="/dashboard"
                  onClick={onMobileClose}
                  className="text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-violet-700"
                >
                  Vault
                </Link>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  onClick={onMobileClose}
                >
                  <ChevronsLeft className="size-5" strokeWidth={2} />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Main
                </p>
                {renderNavLinks(false)}
              </div>

              <SidebarUserProfile isCollapsed={false} />
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
