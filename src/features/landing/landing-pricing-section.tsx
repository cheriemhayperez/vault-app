"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { LANDING_PRICING } from "@/features/landing/config";

export const LandingPricingSection = () => (
  <>
    <div className="text-center">
      <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-violet-600">
        {LANDING_PRICING.badge}
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {LANDING_PRICING.title}{" "}
        <span className="text-violet-600">
          <span className="md:hidden">
            {LANDING_PRICING.titleAccentLine1}
            <br />
            {LANDING_PRICING.titleAccentLine2}
          </span>
          <span className="hidden md:inline">{LANDING_PRICING.titleAccent}</span>
        </span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
        {LANDING_PRICING.subtitle}
      </p>
    </div>

    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-violet-200 bg-white p-6 shadow-lg shadow-violet-100/30 sm:mt-12 sm:p-8">
      <div className="flex justify-center md:justify-start">
        <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-600">
          {LANDING_PRICING.cardBadge}
        </span>
      </div>

      <div className="mt-5 text-center md:text-left">
        <p className="flex flex-col items-center gap-0 md:flex-row md:items-baseline md:gap-1.5">
          <span className="text-5xl font-bold tracking-tight text-slate-900">
            {LANDING_PRICING.price}
          </span>
          <span className="text-base text-slate-500">
            /{LANDING_PRICING.period}
          </span>
        </p>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {LANDING_PRICING.description}
        </p>
      </div>

      <ul className="mt-8 space-y-3.5">
        {LANDING_PRICING.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm text-slate-700"
          >
            <CheckCircle2
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-violet-600"
            />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="/signup"
        className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-700 active:scale-[0.98]"
      >
        {LANDING_PRICING.ctaLabel}
        <ArrowRight className="ml-2 size-4" />
      </Link>
    </div>
  </>
);
