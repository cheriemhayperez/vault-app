"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyDocumentTheme,
  readStoredThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  writeThemeCookies,
  type ThemePreference,
  type VaultThemeMode,
} from "@/utils/theme";

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: VaultThemeMode;
  setTheme: (preference: ThemePreference) => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreference] = useState<ThemePreference>("light");
  const [resolvedTheme, setResolvedTheme] = useState<VaultThemeMode>("light");
  const [isReady, setIsReady] = useState(false);

  const syncTheme = useCallback((nextPreference: ThemePreference) => {
    const resolved = resolveTheme(nextPreference);
    setPreference(nextPreference);
    setResolvedTheme(resolved);
    applyDocumentTheme(resolved);
    localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    writeThemeCookies(nextPreference, resolved);
  }, []);

  useEffect(() => {
    const stored = readStoredThemePreference();
    syncTheme(stored);
    setIsReady(true);
  }, [syncTheme]);

  useEffect(() => {
    if (preference !== "system") {
      return undefined;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = resolveTheme("system");
      setResolvedTheme(resolved);
      applyDocumentTheme(resolved);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      setTheme: syncTheme,
      isReady,
    }),
    [preference, resolvedTheme, syncTheme, isReady],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
