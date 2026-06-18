"use client";

import { useEffect, type ReactNode } from "react";

import { useTheme } from "@/contexts/theme-provider";

interface PublicLightThemeScopeProps {
  children: ReactNode;
}

export const PublicLightThemeScope = ({ children }: PublicLightThemeScopeProps) => {
  const { setPublicLightScope } = useTheme();

  useEffect(() => {
    setPublicLightScope(true);
    return () => setPublicLightScope(false);
  }, [setPublicLightScope]);

  return children;
};
