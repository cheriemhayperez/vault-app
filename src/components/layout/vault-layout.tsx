"use client";

import { useState } from "react";

import { VaultHeader } from "@/components/layout/vault-header";
import { VaultSidebar } from "@/components/layout/vault-sidebar";
import { VaultPageHeader } from "@/components/layout/vault-page-header";
import { PageLoadingSpinner } from "@/components/ui/page-loading-spinner";
import { DashboardPeriodProvider } from "@/contexts/dashboard-period-context";
import { VaultPageHeaderActionsProvider } from "@/contexts/vault-page-header-actions-context";
import { VaultProfileProvider } from "@/contexts/vault-profile-context";
import { VaultPreferencesProvider } from "@/contexts/vault-preferences-context";
import { VaultReadyProvider } from "@/contexts/vault-ready-context";
import { useVaultAuth } from "@/features/system/use-vault-auth";

import { ReminderNotificationSync } from "./reminder-notification-sync";
import { VaultDataLoader } from "./vault-data-loader";

interface VaultLayoutProps {
  children: React.ReactNode;
}

export const VaultLayout = ({ children }: VaultLayoutProps) => {
  const { isAuthenticated } = useVaultAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isAuthenticated) {
    return <PageLoadingSpinner />;
  }

  return (
    <VaultReadyProvider>
      <VaultProfileProvider>
        <VaultPreferencesProvider>
          <DashboardPeriodProvider>
            <VaultPageHeaderActionsProvider>
            <div className="flex h-dvh max-h-dvh min-h-0 w-full overflow-hidden bg-slate-50 font-sans tracking-tight text-slate-900 antialiased transition-colors duration-300">
              <VaultDataLoader />
              <ReminderNotificationSync />
              <VaultSidebar
                mobileOpen={mobileNavOpen}
                onMobileClose={() => setMobileNavOpen(false)}
              />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <VaultHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
                <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-4 pt-4 md:px-6 md:pb-6 md:pt-6">
                  <VaultPageHeader />
                  <div className="min-h-0 min-w-0 flex-1">{children}</div>
                </main>
              </div>
            </div>
            </VaultPageHeaderActionsProvider>
          </DashboardPeriodProvider>
        </VaultPreferencesProvider>
      </VaultProfileProvider>
    </VaultReadyProvider>
  );
};
