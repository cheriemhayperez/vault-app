"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";

interface CountUpMetricProps {
  value: number;
  prefix?: string;
  duration?: number;
  className?: string;
}

export const CountUpMetric = ({
  value,
  prefix = "₱",
  duration = 1.5,
  className = "",
}: CountUpMetricProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (latest) =>
    `${prefix}${Math.floor(latest).toLocaleString("en-PH")}`,
  );

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });

    return () => {
      controls.stop();
    };
  }, [duration, isInView, motionValue, value]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
};
