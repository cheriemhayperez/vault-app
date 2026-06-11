import type { Metadata } from "next";

import { LegalPlaceholderPage } from "@/features/legal/legal-placeholder-page";

export const metadata: Metadata = {
  title: "Terms of Service — Vault",
  description: "Vault terms of service.",
};

export default function TermsOfServicePage() {
  return <LegalPlaceholderPage title="Terms of Service" />;
}
