"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface VaultPageHeaderActionsContextValue {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

const VaultPageHeaderActionsContext =
  createContext<VaultPageHeaderActionsContextValue | null>(null);

export const VaultPageHeaderActionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [actions, setActions] = useState<ReactNode>(null);
  const value = useMemo(
    () => ({
      actions,
      setActions,
    }),
    [actions],
  );

  return (
    <VaultPageHeaderActionsContext.Provider value={value}>
      {children}
    </VaultPageHeaderActionsContext.Provider>
  );
};

export const useVaultPageHeaderActions = () => {
  const context = useContext(VaultPageHeaderActionsContext);
  if (!context) {
    throw new Error(
      "useVaultPageHeaderActions must be used within VaultPageHeaderActionsProvider",
    );
  }
  return context;
};
