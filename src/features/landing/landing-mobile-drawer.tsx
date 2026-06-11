"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

import { LandingLogoLink } from "@/features/landing/landing-logo-link";
import { LandingNavLinks } from "@/features/landing/landing-nav-links";

interface LandingMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

export const LandingMobileDrawer = ({
  isOpen,
  onClose,
  onNavigate,
}: LandingMobileDrawerProps) => (
  <AnimatePresence>
    {isOpen ? (
      <div
        key="landing-mobile-drawer"
        className="fixed inset-0 z-[60] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="landing-mobile-menu"
      >
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-slate-900/40"
          aria-label="Close menu"
          onClick={onClose}
        />

        <motion.nav
          id="landing-mobile-menu"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute right-0 top-0 flex h-full w-[min(85vw,20rem)] flex-col border-l border-slate-100 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <LandingLogoLink onClick={onClose} />
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="Close menu"
              onClick={onClose}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
            <LandingNavLinks variant="mobile" onNavigate={onNavigate} />

            <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-violet-600 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50"
                onClick={onClose}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="vault-btn-primary flex h-12 w-full items-center justify-center rounded-lg text-sm font-semibold text-white shadow-sm shadow-violet-600/25"
                onClick={onClose}
              >
                Get started free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </motion.nav>
      </div>
    ) : null}
  </AnimatePresence>
);
