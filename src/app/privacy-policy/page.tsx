import type { Metadata } from "next";

import { LegalPlaceholderPage } from "@/features/legal/legal-placeholder-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Vault",
  description: "Vault privacy policy.",
};

export default function PrivacyPolicyPage() {
  return <LegalPlaceholderPage title="Privacy Policy" />;
}
