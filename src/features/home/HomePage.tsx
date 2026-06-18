"use client";

import { VaultLayout } from "@/components/layout/vault-layout";
import { PublicLightThemeScope } from "@/components/theme/public-light-theme-scope";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { PageLoadingSpinner } from "@/components/ui/page-loading-spinner";
import { useHome } from "@/features/home/hooks/use-home";

export const HomePage = () => {
  const { isLoading, isAuthenticated } = useHome();

  if (isLoading) {
    return (
      <PublicLightThemeScope>
        <PageLoadingSpinner />
      </PublicLightThemeScope>
    );
  }

  if (isAuthenticated) {
    return (
      <VaultLayout>
        <DashboardPage />
      </VaultLayout>
    );
  }

  return (
    <PublicLightThemeScope>
      <LandingPage />
    </PublicLightThemeScope>
  );
};
