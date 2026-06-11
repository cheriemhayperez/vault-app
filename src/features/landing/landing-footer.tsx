"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LANDING_FOOTER } from "@/features/landing/config";
import { LandingLogoLink } from "@/features/landing/landing-logo-link";

interface LandingFooterProps {
  onNavigate: (sectionId: string) => void;
}

const footerLinkClass =
  "text-sm text-slate-600 transition-colors hover:text-violet-700";

export const LandingFooter = ({ onNavigate }: LandingFooterProps) => {
  const { cta, columns, tagline, copyright } = LANDING_FOOTER;

  return (
    <footer className="w-full">
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-violet-100/70 to-indigo-50 px-4 py-16 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            {cta.description}
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-700 active:scale-[0.98]"
          >
            {cta.buttonLabel}
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <p className="mt-4 text-xs text-slate-500">{cta.note}</p>
        </div>
      </section>

      <div className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-10 gap-y-8 text-left lg:grid-cols-4 lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <LandingLogoLink className="inline-block" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              {tagline}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {columns.product.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {columns.product.links.map(({ label, sectionId }) => (
                <li key={sectionId}>
                  <button
                    type="button"
                    onClick={() => onNavigate(sectionId)}
                    className={footerLinkClass}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {columns.legal.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {columns.legal.links.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className={footerLinkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {columns.account.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {columns.account.links.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className={footerLinkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};
