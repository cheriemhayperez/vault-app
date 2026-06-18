"use client";

import { usePathname } from "next/navigation";
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
  shouldForcePublicLightTheme,
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
  setPublicLightScope: (active: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [preference, setPreference] = useState<ThemePreference>("light");
  const [resolvedTheme, setResolvedTheme] = useState<VaultThemeMode>("light");
  const [isReady, setIsReady] = useState(false);
  const [publicLightScope, setPublicLightScope] = useState(false);

  const forcePublicLight = shouldForcePublicLightTheme(pathname, publicLightScope);

  const applyThemeToDocument = useCallback(
    (nextPreference: ThemePreference, scopedLight = publicLightScope) => {
      const resolved = resolveTheme(nextPreference);

      if (shouldForcePublicLightTheme(pathname, scopedLight)) {
        applyDocumentTheme("light");
        return resolved;
      }

      applyDocumentTheme(resolved);
      return resolved;
    },
    [pathname, publicLightScope],
  );

  const syncTheme = useCallback(
    (nextPreference: ThemePreference) => {
      const resolved = applyThemeToDocument(nextPreference);
      setPreference(nextPreference);
      setResolvedTheme(resolved);
      localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
      writeThemeCookies(nextPreference, resolved);
    },
    [applyThemeToDocument],
  );

  useEffect(() => {
    const stored = readStoredThemePreference();
    const resolved = applyThemeToDocument(stored);
    setPreference(stored);
    setResolvedTheme(resolved);
    setIsReady(true);
  }, [applyThemeToDocument]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const resolved = applyThemeToDocument(preference);
    setResolvedTheme(resolved);
  }, [applyThemeToDocument, isReady, preference, pathname, publicLightScope]);

  useEffect(() => {
    if (!isReady || preference !== "system" || forcePublicLight) {
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
  }, [forcePublicLight, isReady, preference]);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme: forcePublicLight ? "light" : resolvedTheme,
      setTheme: syncTheme,
      isReady,
      setPublicLightScope,
    }),
    [forcePublicLight, preference, resolvedTheme, syncTheme, isReady],
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
