"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { LANDING_CONTAINER } from "@/features/landing/config";
import { LandingLogoLink } from "@/features/landing/landing-logo-link";
import { LandingNavLinks } from "@/features/landing/landing-nav-links";
import { LandingMobileDrawer } from "@/features/landing/landing-mobile-drawer";

interface LandingHeaderProps {
  isNavScrolled: boolean;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  onNavigate: (sectionId: string) => void;
}

export const LandingHeader = ({
  isNavScrolled,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  onNavigate,
}: LandingHeaderProps) => {
  const showNavBackground = isNavScrolled;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isMobileMenuOpen ? "hidden lg:block" : ""
        } ${showNavBackground ? "px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6" : ""}`}
      >
        <div
          className={
            showNavBackground
              ? "mx-auto w-full max-w-6xl rounded-2xl border border-slate-100/90 bg-white/95 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md xl:max-w-7xl"
              : LANDING_CONTAINER
          }
        >
          <div
            className={`flex items-center justify-between gap-3 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4 ${
              showNavBackground
                ? "px-4 py-3.5 sm:px-5 sm:py-4 lg:px-6 lg:py-3.5"
                : "px-4 pt-5 pb-3.5 sm:px-6 sm:pt-6 sm:pb-4 lg:px-8 lg:pt-7 lg:pb-4"
            }`}
          >
            <LandingLogoLink
              className="shrink-0 text-slate-900 lg:justify-self-start"
              onClick={onCloseMobileMenu}
            />

            <div className="hidden justify-self-center lg:block">
              <LandingNavLinks onNavigate={onNavigate} />
            </div>

            <div className="hidden items-center justify-self-end gap-1 sm:gap-2 lg:flex">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="vault-btn-primary inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/25"
              >
                Get Started
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </div>

            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 lg:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={onToggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      <LandingMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={onCloseMobileMenu}
        onNavigate={onNavigate}
      />
    </>
  );
};
