import { Bell, CheckCircle2, XCircle } from "lucide-react";

export const REMINDER_STATS = [
  {
    key: "upcoming" as const,
    label: "Upcoming",
    icon: Bell,
    tone:
      "vault-reminder-stat-icon vault-reminder-stat-icon--upcoming bg-amber-50 text-amber-600 dark:text-amber-400",
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
    tone:
      "vault-reminder-stat-icon vault-reminder-stat-icon--completed bg-violet-50 text-violet-600 dark:text-violet-400",
  },
  {
    key: "dismissed" as const,
    label: "Dismissed",
    icon: XCircle,
    tone:
      "vault-reminder-stat-icon vault-reminder-stat-icon--dismissed bg-slate-100 text-slate-500 dark:text-zinc-400",
  },
];
