import { PieChart, TrendingUp } from "lucide-react";

export const METRIC_CARDS = [
  {
    title: "Total Capital",
    subtext: "Amount invested",
    icon: PieChart,
    valueKey: "capital" as const,
  },
  {
    title: "Total Payouts",
    subtext: "Dividends & interest received",
    icon: TrendingUp,
    valueKey: "payouts" as const,
  },
  {
    title: "Net Profit",
    subtext: "Pending capital gains",
    icon: TrendingUp,
    valueKey: "profit" as const,
  },
  {
    title: "Investments",
    subtext: "Active positions",
    icon: PieChart,
    valueKey: "positions" as const,
  },
];
