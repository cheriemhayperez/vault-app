"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  buildPeriodFilter,
  getDefaultPeriodMonth,
  getDefaultPeriodState,
  type DashboardPeriodFilter,
  type DashboardPeriodType,
} from "@/utils/periodFilter";

interface DashboardPeriodContextValue {
  periodType: DashboardPeriodType;
  month: string;
  endMonth: string;
  year: string;
  filter: DashboardPeriodFilter;
  setPeriodType: (value: DashboardPeriodType) => void;
  setMonth: (value: string) => void;
  setEndMonth: (value: string) => void;
  setYear: (value: string) => void;
}

const DashboardPeriodContext = createContext<DashboardPeriodContextValue | null>(
  null,
);

export const DashboardPeriodProvider = ({ children }: { children: ReactNode }) => {
  const defaults = getDefaultPeriodState();
  const [periodType, setPeriodType] = useState<DashboardPeriodType>(
    () => defaults.periodType,
  );
  const [month, setMonth] = useState<string>(() => defaults.month);
  const [endMonth, setEndMonth] = useState<string>(() => defaults.endMonth);
  const [year, setYear] = useState<string>(() => defaults.year);

  const handlePeriodTypeChange = (next: DashboardPeriodType) => {
    setPeriodType(next);

    if (next === "month" || next === "range") {
      setMonth(getDefaultPeriodMonth());
      setEndMonth("December");
    }
  };

  const filter = useMemo(
    () =>
      buildPeriodFilter({
        periodType,
        month,
        endMonth,
        year,
      }),
    [periodType, month, endMonth, year],
  );

  const value = useMemo(
    () => ({
      periodType,
      month,
      endMonth,
      year,
      filter,
      setPeriodType: handlePeriodTypeChange,
      setMonth,
      setEndMonth,
      setYear,
    }),
    [periodType, month, endMonth, year, filter],
  );

  return (
    <DashboardPeriodContext.Provider value={value}>
      {children}
    </DashboardPeriodContext.Provider>
  );
};

export const useDashboardPeriod = (): DashboardPeriodContextValue => {
  const context = useContext(DashboardPeriodContext);
  if (!context) {
    throw new Error(
      "useDashboardPeriod must be used within DashboardPeriodProvider",
    );
  }
  return context;
};
