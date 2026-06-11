"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { LANDING_FAQ, LANDING_FAQ_ITEMS } from "@/features/landing/config";

export const LandingFaqSection = () => {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <>
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-violet-600">
          {LANDING_FAQ.badge}
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          <span className="md:hidden">
            {LANDING_FAQ.title}
            <br />
            <span className="text-violet-600">{LANDING_FAQ.titleAccent}</span>
          </span>
          <span className="hidden md:inline">
            {LANDING_FAQ.title}{" "}
            <span className="text-violet-600">{LANDING_FAQ.titleAccent}</span>
          </span>
        </h2>
      </div>

      <div className="mt-12 divide-y divide-slate-200">
        {LANDING_FAQ_ITEMS.map(({ question, answer }, index) => {
          const isOpen = openIndex === index;
          const panelId = `${baseId}-faq-panel-${index}`;
          const triggerId = `${baseId}-faq-trigger-${index}`;

          return (
            <article key={question} className="px-1 py-5">
              <h3 className="m-0">
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(index)}
                  className={`flex w-full items-center justify-between gap-4 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                    isOpen
                      ? "font-semibold text-violet-600"
                      : "font-semibold text-slate-900 hover:text-violet-700"
                  }`}
                >
                  <span className="text-base">{question}</span>
                  <ChevronDown
                    aria-hidden
                    className={`size-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-violet-600" : ""
                    }`}
                  />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                aria-hidden={!isOpen}
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-2xl pt-3 text-sm leading-relaxed text-slate-600">
                    {answer}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};
