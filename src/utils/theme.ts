export type ThemePreference = "light" | "dark" | "system";
export type VaultThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "vault-theme-preference";

export const THEME_MODE_COOKIE = "vault-theme-mode";

const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const readThemeModeFromCookie = (
  value: string | undefined,
): VaultThemeMode => (value === "dark" ? "dark" : "light");

export const writeThemeCookies = (
  preference: ThemePreference,
  resolved: VaultThemeMode,
): void => {
  if (typeof document === "undefined") {
    return;
  }
  const base = `path=/;max-age=${THEME_COOKIE_MAX_AGE_SECONDS};SameSite=Lax`;
  document.cookie = `${THEME_STORAGE_KEY}=${preference};${base}`;
  document.cookie = `${THEME_MODE_COOKIE}=${resolved};${base}`;
};

export const resolveTheme = (preference: ThemePreference): VaultThemeMode => {
  if (preference === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference === "dark" ? "dark" : "light";
};

export const applyDocumentTheme = (mode: VaultThemeMode): void => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = mode;
};

export const readStoredThemePreference = (): ThemePreference => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "system") {
    return stored;
  }
  return "light";
};

export interface VaultThemeTokens {
  root: string;
  header: string;
  title: string;
  subtitle: string;
  card: string;
  cardLabel: string;
  cardValue: string;
  panel: string;
  muted: string;
  input: string;
  select: string;
  ledgerWrap: string;
  ledgerRow: string;
  ledgerHeader: string;
  progressTrack: string;
  coachPositive: string;
  coachNeutral: string;
  coachWarning: string;
  toggleButton: string;
  accentProgress: string;
}

export const getVaultTheme = (mode: VaultThemeMode): VaultThemeTokens => {
  if (mode === "dark") {
    return {
      root: "bg-slate-950 text-slate-100",
      header:
        "border-slate-800 bg-linear-to-r from-slate-950 via-violet-950 to-slate-900",
      title: "text-slate-50",
      subtitle: "text-violet-200/80",
      card: "border-slate-800 bg-slate-900/80 shadow-[0_0_0_1px_rgba(124,58,237,0.15)]",
      cardLabel: "text-slate-400",
      cardValue: "text-slate-50",
      panel: "border-slate-800 bg-slate-950/70",
      muted: "text-slate-400",
      input:
        "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-violet-500",
      select: "border-slate-700 bg-slate-950 text-slate-100 focus:border-violet-500",
      ledgerWrap: "border-slate-800 bg-slate-950/80",
      ledgerRow: "border-slate-800 bg-slate-900/80 text-slate-200",
      ledgerHeader: "text-slate-400 border-slate-800",
      progressTrack: "bg-slate-800",
      coachPositive: "border-emerald-900/50 bg-emerald-950/40 text-emerald-200",
      coachNeutral: "border-violet-900/50 bg-violet-950/35 text-violet-100",
      coachWarning: "border-rose-900/50 bg-rose-950/35 text-rose-200",
      toggleButton: "border-violet-800 bg-violet-950 text-violet-100 hover:bg-violet-900",
      accentProgress: "bg-violet-500",
    };
  }

  return {
    root: "bg-slate-50 text-slate-900",
    header: "border-slate-200 bg-linear-to-r from-white via-violet-50/80 to-white",
    title: "text-slate-900",
    subtitle: "text-slate-600",
    card: "border-slate-200 bg-white shadow-sm",
    cardLabel: "text-slate-500",
    cardValue: "text-slate-900",
    panel: "border-slate-200 bg-white",
    muted: "text-slate-500",
    input:
      "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-600 focus:ring-1 focus:ring-violet-200",
    select:
      "border-slate-300 bg-white text-slate-900 focus:border-violet-600 focus:ring-1 focus:ring-violet-200",
    ledgerWrap: "border-slate-200 bg-white",
    ledgerRow: "border-slate-200 bg-white text-slate-700",
    ledgerHeader: "text-slate-500 border-slate-200",
    progressTrack: "bg-slate-200",
    coachPositive: "border-emerald-200 bg-emerald-50 text-emerald-900",
    coachNeutral: "border-violet-200 bg-violet-50 text-violet-900",
    coachWarning: "border-rose-200 bg-rose-50 text-rose-900",
    toggleButton: "border-violet-200 bg-white text-violet-700 hover:bg-violet-50",
    accentProgress: "bg-violet-600",
  };
};
