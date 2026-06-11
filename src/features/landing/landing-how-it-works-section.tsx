"use client";

import { motion } from "framer-motion";

import { LANDING_HOW_IT_WORKS } from "@/features/landing/config";

export const LandingHowItWorksSection = () => (
  <>
    <div className="text-center">
      <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-violet-600">
        {LANDING_HOW_IT_WORKS.badge}
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {LANDING_HOW_IT_WORKS.title}{" "}
        <span className="text-violet-600">
          <span className="md:hidden">
            {LANDING_HOW_IT_WORKS.titleAccentLine1}
            <br />
            {LANDING_HOW_IT_WORKS.titleAccentLine2}
          </span>
          <span className="hidden md:inline">
            {LANDING_HOW_IT_WORKS.titleAccent}
          </span>
        </span>
      </h2>
    </div>

    <div className="relative mt-12 md:mt-16">
      <motion.div
        className="absolute left-[12%] right-[12%] top-7 hidden h-0.5 origin-left bg-violet-300 md:block"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      <div
        className="pointer-events-none absolute bottom-6 left-6 top-6 w-px bg-violet-200 md:hidden"
        aria-hidden
      />

      <div className="relative flex flex-col gap-8 md:grid md:grid-cols-4 md:gap-6">
        {LANDING_HOW_IT_WORKS.steps.map((item, index) => (
          <motion.div
            key={item.step}
            className="relative z-10 flex gap-4 text-left md:flex-col md:items-center md:gap-0 md:text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.12 }}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-base font-bold text-white shadow-md shadow-violet-600/30 md:size-14 md:text-lg">
              {item.step}
            </div>
            <div className="min-w-0 flex-1 pt-0.5 md:flex-none md:pt-0">
              <h3 className="text-base font-bold text-slate-900 md:mt-5">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 md:mt-2">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </>
);
