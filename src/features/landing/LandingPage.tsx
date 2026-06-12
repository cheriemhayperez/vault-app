"use client";

import { useLanding } from "@/features/landing/hooks/use-landing";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { HeroDashboardMockup } from "./hero-dashboard-mockup";
import { FADE_UP, LANDING_CONTAINER, LANDING_HERO } from "@/features/landing/config";
import { LandingFaqSection } from "@/features/landing/landing-faq-section";
import { LandingFeatureShowcaseSection } from "@/features/landing/landing-feature-showcase-section";
import { LandingFeaturesSection } from "@/features/landing/landing-features-section";
import { LandingFooter } from "@/features/landing/landing-footer";
import { LandingHowItWorksSection } from "@/features/landing/landing-how-it-works-section";
import { LandingHeader } from "@/features/landing/landing-header";
import { LandingPricingSection } from "@/features/landing/landing-pricing-section";

export const LandingPage = () => {
  const {
    comparisonRef,
    stepsRef,
    isNavScrolled,
    isMobileMenuOpen,
    closeMobileMenu,
    toggleMobileMenu,
    scrollToSection,
    scrollToSteps,
  } = useLanding();

  return (
    <div className="w-full min-h-dvh bg-slate-50 text-slate-900">
      <LandingHeader
        isNavScrolled={isNavScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
        onCloseMobileMenu={closeMobileMenu}
        onNavigate={scrollToSection}
      />

      <section className="relative -mt-[4.5rem] w-full overflow-x-hidden pt-[6.5rem] pb-12 sm:-mt-[4.75rem] sm:pt-[7rem] sm:pb-14 lg:-mt-20 lg:pt-28 lg:pb-16">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className={`relative ${LANDING_CONTAINER}`}>
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl text-left md:mx-auto md:text-center lg:mx-0 lg:text-left"
          >
            <p className="mb-4 inline-flex max-w-full items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-600 md:mx-auto lg:mx-0 lg:hidden">
              {LANDING_HERO.mobileBadge}
            </p>
            <p className="mb-4 hidden max-w-full items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700 shadow-sm sm:px-3.5 sm:text-xs lg:inline-flex">
              <Sparkles className="size-3.5 shrink-0" />
              {LANDING_HERO.desktopBadge}
            </p>
            <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-[3rem]">
              Track Your Earnings.
              <br />
              Accelerate Your
              <br />
              <span className="bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                Savings.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-[15px] md:mx-auto md:text-base">
              The all-in-one financial vault for Filipino VAs, freelancers, and
              remote contractors. Instantly calculate your true take-home pay,
              automate government contributions, and manage your income with smart
              50/30/20 budgeting.
            </p>
            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-4 md:justify-center lg:justify-start">
              <Link
                href="/signup"
                className="vault-btn-primary inline-flex h-10 items-center justify-center rounded-full px-5 text-xs font-semibold text-white sm:h-11 sm:px-6 sm:text-sm"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="ml-1.5 size-3.5 sm:ml-2 sm:size-4" />
              </Link>
              <button
                type="button"
                onClick={scrollToSteps}
                className="vault-btn-outline inline-flex h-10 items-center justify-center rounded-full border border-violet-300 bg-white px-5 text-xs font-semibold text-violet-600 hover:border-violet-400 hover:bg-violet-50 sm:h-11 sm:px-6 sm:text-sm"
              >
                See How It Works
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 md:text-center lg:text-left">
              Free forever · No credit card required
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto w-full max-w-xl sm:max-w-2xl lg:mx-0 lg:ml-auto lg:max-w-none"
          >
            <HeroDashboardMockup />
          </motion.div>
          </div>
        </div>
      </section>

      <section
        ref={comparisonRef}
        id="features"
        className="w-full scroll-mt-24 pt-8 pb-14 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20"
      >
        <div className={LANDING_CONTAINER}>
          <LandingFeatureShowcaseSection />

          <motion.div className="mt-32" {...FADE_UP}>
            <LandingFeaturesSection />
          </motion.div>
        </div>
      </section>

      <section
        ref={stepsRef}
        id="how-it-works"
        className="w-full scroll-mt-24 bg-slate-50/80 px-4 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8"
      >
        <motion.div className="mx-auto max-w-7xl" {...FADE_UP}>
          <LandingHowItWorksSection />
        </motion.div>
      </section>

      <section
        id="pricing"
        className="w-full scroll-mt-24 px-4 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8"
      >
        <motion.div className="mx-auto max-w-7xl" {...FADE_UP}>
          <LandingPricingSection />
        </motion.div>
      </section>

      <section
        id="faq"
        className="w-full scroll-mt-24 bg-white px-4 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8"
      >
        <motion.div className="mx-auto max-w-3xl" {...FADE_UP}>
          <LandingFaqSection />
        </motion.div>
      </section>

      <LandingFooter onNavigate={scrollToSection} />
    </div>
  );
};
