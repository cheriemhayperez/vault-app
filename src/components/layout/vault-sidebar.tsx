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
      className={`relative flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
        navCollapsed ? "justify-center px-0 py-2" : "px-3"
      } ${
        isActive
          ? navCollapsed
            ? "vault-nav-active"
            : "vault-nav-active mr-2"
          : `vault-sidebar-nav-idle${navCollapsed ? "" : " hover:mr-2"}`
      }`}
    >
      {isActive && !navCollapsed ? (
        <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-600 dark:bg-violet-400" />
      ) : null}
      <span className={isActive ? "text-violet-600 dark:text-violet-400" : "inherit"}>
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
        className={`z-30 hidden h-full shrink-0 flex-shrink-0 flex-col overflow-hidden bg-vault-sidebar transition-all duration-300 md:flex ${
          isCollapsed ? "w-16" : "w-64 border-r border-vault-subtle"
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center ${
            isCollapsed
              ? "justify-center px-0"
              : "justify-between gap-2 border-b border-vault-subtle px-4"
          }`}
        >
          {!isCollapsed ? (
            <Link
              href="/dashboard"
              className="vault-brand-link text-lg font-bold tracking-tight"
            >
              Vault
            </Link>
          ) : null}
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="vault-header-icon-btn rounded-md p-1"
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
          className={`flex min-h-0 flex-1 flex-col overflow-hidden pt-4 ${isCollapsed ? "px-1.5" : "px-4"}`}
        >
          {!isCollapsed ? (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
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
            className="fixed inset-x-0 top-0 z-40 h-dvh max-h-dvh md:hidden"
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
              className="absolute left-0 top-0 flex h-dvh max-h-dvh w-[70vw] max-w-[18rem] flex-col border-r border-vault-subtle bg-vault-sidebar shadow-xl"
            >
              <div className="flex shrink-0 flex-shrink-0 items-center justify-between border-b border-vault-subtle px-4 py-4">
                <Link
                  href="/dashboard"
                  onClick={onMobileClose}
                  className="vault-brand-link text-lg font-bold tracking-tight"
                >
                  Vault
                </Link>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="vault-header-icon-btn rounded-lg p-1.5"
                  onClick={onMobileClose}
                >
                  <ChevronsLeft className="size-5" strokeWidth={2} />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
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
