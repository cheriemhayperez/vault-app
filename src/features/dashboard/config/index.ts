export const GOVERNMENT_ROWS = [
  {
    key: "sss" as const,
    label: "SSS",
    percent: "5%",
    dotClass: "bg-blue-500",
    barClass: "bg-blue-500",
  },
  {
    key: "philHealth" as const,
    label: "PhilHealth",
    percent: "2.5%",
    dotClass: "bg-emerald-500",
    barClass: "bg-emerald-500",
  },
  {
    key: "pagIbig" as const,
    label: "Pag-IBIG",
    percent: "2%",
    dotClass: "bg-orange-500",
    barClass: "bg-orange-500",
  },
  {
    key: "birTax" as const,
    label: "Withholding Tax",
    percent: "BIR 8%",
    dotClass: "bg-violet-500",
    barClass: "bg-violet-500",
  },
] as const;

export const REVENUE_METRICS = [
  {
    key: "income",
    label: "Total Income",
    valueClass: "text-emerald-600",
  },
  {
    key: "deductions",
    label: "Total Deductions",
    valueClass: "text-rose-500",
  },
  {
    key: "expenses",
    label: "Total Expenses",
    valueClass: "text-violet-600",
  },
  {
    key: "net",
    label: "Net Total",
    valueClass: "text-emerald-600",
  },
] as const;

export const SAVINGS_RING_ACTIVE = "#22c55e";
export const SAVINGS_DEDUCTION_RED = "#ef4444";
