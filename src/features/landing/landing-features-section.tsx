"use client";

import {
  AlertTriangle,
  Calculator,
  Check,
  Clock,
  FileSpreadsheet,
} from "lucide-react";

import { LANDING_FEATURES } from "@/features/landing/config";

const PainIcon = ({ type }: { type: "clock" | "alert" }) => {
  const Icon = type === "clock" ? Clock : AlertTriangle;
  return <Icon className="size-4 shrink-0 text-rose-500" aria-hidden />;
};

export const LandingFeaturesSection = () => (
  <>
    <div className="text-center">
      <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-violet-600">
        {LANDING_FEATURES.badge}
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {LANDING_FEATURES.title}{" "}
        <span className="text-violet-600">{LANDING_FEATURES.titleAccent}</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
        {LANDING_FEATURES.subtitle}
      </p>
    </div>

    <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2 lg:gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100">
            <FileSpreadsheet
              className="size-5 text-slate-500"
              aria-hidden
            />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            {LANDING_FEATURES.spreadsheet.title}
          </h3>
        </div>
        <ul className="mt-6 space-y-4">
          {LANDING_FEATURES.spreadsheet.points.map(({ text, icon }) => (
            <li
              key={text}
              className="flex items-start gap-3 text-sm leading-relaxed text-slate-600"
            >
              <PainIcon type={icon} />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border-2 border-violet-300 bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50">
            <Calculator className="size-5 text-violet-600" aria-hidden />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {LANDING_FEATURES.vault.title}
          </h3>
        </div>
        <ul className="mt-6 space-y-4">
          {LANDING_FEATURES.vault.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-sm leading-relaxed text-slate-800"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-violet-600"
                aria-hidden
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </>
);
