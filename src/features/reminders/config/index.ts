import { Bell, CheckCircle2, XCircle } from "lucide-react";

export const REMINDER_STATS = [
  {
    key: "upcoming" as const,
    label: "Upcoming",
    icon: Bell,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    key: "dismissed" as const,
    label: "Dismissed",
    icon: XCircle,
    tone: "bg-slate-100 text-slate-500",
  },
];
