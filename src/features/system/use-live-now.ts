"use client";

import { useEffect, useState } from "react";

/** Re-renders every `intervalMs` so relative times and due checks stay fresh. */
export const useLiveNow = (intervalMs = 30_000): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const intervalId = setInterval(tick, intervalMs);
    return () => clearInterval(intervalId);
  }, [intervalMs]);

  return now;
};
