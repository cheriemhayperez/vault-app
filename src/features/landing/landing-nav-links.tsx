"use client";

import { LANDING_NAV_ITEMS } from "@/features/landing/config";

interface LandingNavLinksProps {
  onNavigate: (sectionId: string) => void;
  variant?: "desktop" | "mobile";
}

const desktopNavLinkClass =
  "rounded-none border-b-2 border-transparent px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-violet-600 hover:text-slate-900 focus-visible:outline-none focus-visible:border-violet-600 focus-visible:text-slate-900";

const mobileNavLinkClass =
  "flex w-full items-center py-3.5 text-left text-base font-semibold text-slate-900 transition-colors hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";

export const LandingNavLinks = ({
  onNavigate,
  variant = "desktop",
}: LandingNavLinksProps) => (
  <ul className={variant === "mobile" ? "space-y-0.5" : "flex items-center"}>
    {LANDING_NAV_ITEMS.map(({ label, sectionId }) => (
      <li key={sectionId}>
        <button
          type="button"
          onClick={() => onNavigate(sectionId)}
          className={
            variant === "mobile" ? mobileNavLinkClass : desktopNavLinkClass
          }
        >
          {label}
        </button>
      </li>
    ))}
  </ul>
);
