"use client";

import { motion } from "framer-motion";

const CHART_WIDTH = 400;
const CHART_HEIGHT = 100;

const trendLinePath =
  "M 0 80 Q 50 70, 100 45 T 200 50 T 300 20 T 400 10";

const areaFillPath = `${trendLinePath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;

export const HeroTrendChart = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={`overflow-hidden rounded-xl border border-slate-100 bg-white ${
      compact ? "mt-3 p-2" : "mt-4 p-2"
    }`}
  >
    <p
      className={`px-0.5 font-semibold uppercase tracking-wide text-slate-500 ${
        compact ? "mb-1.5 text-[9px] sm:text-[10px]" : "mb-2 text-[10px]"
      }`}
    >
      Monthly Income Trend
    </p>
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className={`w-full ${compact ? "h-[4.5rem] sm:h-20" : "h-28"}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="heroTrendGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>

      <motion.path
        d={areaFillPath}
        fill="url(#heroTrendGradient)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
      />

      <motion.path
        d={trendLinePath}
        fill="none"
        stroke="#7c3aed"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
    </svg>
  </div>
);
