import type { LucideIcon } from "lucide-react";
import {
  Bell,
  FileText,
  LayoutGrid,
  PiggyBank,
  Settings,
  Tags,
  TrendingUp,
  Wallet,
} from "lucide-react";

export interface VaultNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  breadcrumb: string;
}

export const VAULT_NAV_ITEMS: VaultNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    breadcrumb: "Dashboard",
  },
  {
    href: "/records",
    label: "Records",
    icon: FileText,
    breadcrumb: "Records",
  },
  {
    href: "/investments",
    label: "Investments",
    icon: TrendingUp,
    breadcrumb: "Investments",
  },
  {
    href: "/budget",
    label: "Budget",
    icon: PiggyBank,
    breadcrumb: "Budget",
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: Wallet,
    breadcrumb: "Expenses",
  },
  {
    href: "/categories",
    label: "Categories",
    icon: Tags,
    breadcrumb: "Categories",
  },
  {
    href: "/reminders",
    label: "Reminders",
    icon: Bell,
    breadcrumb: "Reminders",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    breadcrumb: "Settings",
  },
];

export const isNavActive = (pathname: string, href: string): boolean => {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

const PAGE_COPY: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description: "Track your income, deductions, and savings at a glance",
  },
  "/dashboard": {
    title: "Dashboard",
    description: "Track your income, deductions, and savings at a glance",
  },
  "/records": {
    title: "Pay Records",
    description: "Track and manage your income and deductions",
  },
  "/investments": {
    title: "Investments",
    description: "Track your investment portfolio and returns",
  },
  "/budget": {
    title: "Budget",
    description: "Track your spending with the 50/30/20 rule",
  },
  "/expenses": {
    title: "Expenses",
    description: "Track your spending by category",
  },
  "/categories": {
    title: "Manage Categories",
    description: "Create and organize categories for your pay records",
  },
  "/reminders": {
    title: "Reminders",
    description: "Never miss important salary and payroll dates",
  },
  "/settings": {
    title: "Settings",
    description: "Manage your account and app preferences",
  },
};

export const getPageMeta = (
  pathname: string,
): { title: string; description: string; breadcrumb: string } => {
  const navItem = VAULT_NAV_ITEMS.find((item) => isNavActive(pathname, item.href));
  const copy = PAGE_COPY[pathname] ?? PAGE_COPY["/dashboard"];
  const breadcrumb = navItem?.breadcrumb ?? "Dashboard";

  return {
    title: copy.title,
    description: copy.description,
    breadcrumb,
  };
};
