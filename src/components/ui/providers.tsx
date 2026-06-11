"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { ThemeProvider } from "@/contexts/theme-provider";
import { store } from "@/store";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
};
