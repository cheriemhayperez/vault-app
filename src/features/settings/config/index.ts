import {
  Monitor,
  Moon,
  Palette,
  SlidersHorizontal,
  Sun,
  Tags,
  User,
  type LucideIcon,
} from "lucide-react";

import type { ThemePreference } from "@/utils/theme";

export const SETTINGS_SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    description: "Manage your personal information",
    icon: User,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Customize the app theme",
    icon: Palette,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Currency, dates, and more",
    icon: SlidersHorizontal,
  },
  {
    id: "categories",
    label: "Categories",
    description: "Income and deduction types",
    icon: Tags,
  },
] as const;

export const THEME_OPTIONS: {
  id: ThemePreference;
  label: string;
  description: string;
  icon: LucideIcon;
  previewClass: string;
}[] = [
  {
    id: "light",
    label: "Light",
    description: "Classic light appearance",
    icon: Sun,
    previewClass: "bg-slate-50",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
    previewClass: "bg-slate-800",
  },
  {
    id: "system",
    label: "System",
    description: "Match device settings",
    icon: Monitor,
    previewClass: "bg-gradient-to-r from-slate-50 via-slate-200 to-slate-800",
  },
];
