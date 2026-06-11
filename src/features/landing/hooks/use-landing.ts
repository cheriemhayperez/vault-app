"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_NAV_THRESHOLD = 24;

const DESKTOP_NAV_BREAKPOINT = 1024;

export const useLanding = () => {
  const comparisonRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsNavScrolled(window.scrollY > SCROLL_NAV_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_NAV_BREAKPOINT) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((current) => !current);
  };

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    const header = document.querySelector("header");
    const headerOffset = (header?.getBoundingClientRect().height ?? 72) + 8;
    const top =
      target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    closeMobileMenu();
  };

  const scrollToSteps = () => {
    scrollToSection("how-it-works");
  };

  const scrollToComparison = () => {
    scrollToSection("features");
  };

  return {
    comparisonRef,
    stepsRef,
    isNavScrolled,
    isMobileMenuOpen,
    closeMobileMenu,
    toggleMobileMenu,
    scrollToSection,
    scrollToSteps,
    scrollToComparison,
  };
};
