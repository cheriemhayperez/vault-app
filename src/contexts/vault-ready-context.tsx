"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface VaultReadyContextValue {
  isVaultReady: boolean;
  setVaultReady: (ready: boolean) => void;
}

const VaultReadyContext = createContext<VaultReadyContextValue | null>(null);

export const VaultReadyProvider = ({ children }: { children: ReactNode }) => {
  const [isVaultReady, setIsVaultReady] = useState(true);

  const value = useMemo(
    () => ({
      isVaultReady,
      setVaultReady: setIsVaultReady,
    }),
    [isVaultReady],
  );

  return (
    <VaultReadyContext.Provider value={value}>
      {children}
    </VaultReadyContext.Provider>
  );
};

export const useVaultReady = (): VaultReadyContextValue => {
  const context = useContext(VaultReadyContext);
  if (!context) {
    throw new Error("useVaultReady must be used within VaultReadyProvider");
  }
  return context;
};
