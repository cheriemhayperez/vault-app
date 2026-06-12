import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LandingLogoLink } from "@/features/landing/landing-logo-link";

interface LegalPlaceholderPageProps {
  title: string;
}

export const LegalPlaceholderPage = ({ title }: LegalPlaceholderPageProps) => (
  <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <LandingLogoLink />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-violet-700"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>
      </div>
    </header>

    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
          Coming soon
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          This page is not available yet. We&apos;re preparing our legal
          documents and will publish them here soon.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-violet-600 px-6 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-700"
        >
          Return to Vault
        </Link>
      </div>
    </main>
  </div>
);
