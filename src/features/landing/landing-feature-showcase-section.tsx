"use client";

import { motion } from "framer-motion";

import { LANDING_FEATURE_SHOWCASE } from "@/features/landing/config";
import {
  BudgetMockup,
  FeatureBrowserMockup,
  InvestmentsMockup,
  PayRecordMockup,
} from "@/features/landing/landing-feature-mockups";

const MOCKUP_BY_ID = {
  "pay-records": PayRecordMockup,
  budget: BudgetMockup,
  investments: InvestmentsMockup,
} as const;

const DOT_COLORS = {
  violet: "bg-violet-500",
  indigo: "bg-indigo-400",
} as const;

const bulletContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
  viewport: { once: true, margin: "-40px" },
};

const bulletItem = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export const LandingFeatureShowcaseSection = () => (
  <>
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-violet-600">
        {LANDING_FEATURE_SHOWCASE.badge}
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {LANDING_FEATURE_SHOWCASE.title}{" "}
        <span className="text-violet-600">
          {LANDING_FEATURE_SHOWCASE.titleAccent}
        </span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
        {LANDING_FEATURE_SHOWCASE.subtitle}
      </p>
    </motion.div>

    <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-24 lg:mt-24 lg:space-y-32">
      {LANDING_FEATURE_SHOWCASE.blocks.map((block) => {
        const Mockup = MOCKUP_BY_ID[block.id as keyof typeof MOCKUP_BY_ID];
        const textMotion = {
          initial: { opacity: 0, x: block.reverse ? 40 : -40 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.05 },
        };
        const mockupMotion = {
          initial: { opacity: 0, x: block.reverse ? -40 : 40 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.65, ease: "easeOut" as const, delay: 0.12 },
        };

        return (
          <div
            key={block.id}
            className={`grid items-center gap-8 sm:gap-10 md:justify-items-center lg:grid-cols-2 lg:justify-items-stretch lg:gap-16 ${
              block.reverse ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <motion.div
              {...textMotion}
              className="w-full max-w-lg text-left md:mx-auto md:text-center lg:mx-0 lg:text-left"
            >
              <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-600 md:mx-auto lg:mx-0">
                {block.badge}
              </span>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {block.title}
                {"titleLine2" in block && block.titleLine2 ? (
                  <>
                    <br />
                    {block.titleLine2}
                  </>
                ) : null}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {block.description}
              </p>

              <motion.div
                className="mt-8 grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-4 md:mx-auto md:max-w-lg lg:mx-0 lg:max-w-none"
                variants={bulletContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, margin: "-40px" }}
              >
                {block.bullets.map((bullet) => (
                  <motion.div
                    key={bullet.label}
                    variants={bulletItem}
                    className="flex min-w-0 gap-2 sm:gap-3"
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${DOT_COLORS[bullet.dot]}`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 sm:text-sm">
                        {bullet.label}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:text-sm">
                        {bullet.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              {...mockupMotion}
              className="w-full md:max-w-xl md:mx-auto lg:mx-0 lg:max-w-none"
            >
              <FeatureBrowserMockup url={block.mockUrl}>
                <Mockup />
              </FeatureBrowserMockup>
            </motion.div>
          </div>
        );
      })}
    </div>
  </>
);
