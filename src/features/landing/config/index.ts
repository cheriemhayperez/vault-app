export const LANDING_CONTAINER =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export const LANDING_HERO = {
  mobileBadge: "Freelance Finance Tracker",
  desktopBadge: "Philippine Freelancer Tax & Budget Calculator",
} as const;

export const HERO_DASHBOARD = {
  url: "vault.app/dashboard",
  metrics: [
    {
      label: "Gross",
      value: 340000,
    },
    {
      label: "Deductions",
      value: 80000,
      footnote: "Gov't",
      footnoteClass: "text-slate-500",
    },
    {
      label: "Savings",
      value: 76,
      isPercent: true,
      showBar: true,
    },
    {
      label: "Net Pay",
      value: 260000,
      footnote: "+5.2%",
      footnoteClass: "text-violet-600 font-semibold",
    },
  ],
  records: [
    {
      id: "hero-record-1",
      label: "June 1-30 Cutoff",
      amount: 100000,
      dotClass: "bg-emerald-500",
    },
    {
      id: "hero-record-2",
      label: "May 1-15 Cutoff",
      amount: 95000,
      dotClass: "bg-violet-400",
    },
    {
      id: "hero-record-3",
      label: "Apr 16-30 Cutoff",
      amount: 92000,
      dotClass: "bg-sky-400",
    },
  ],
  floatingBadges: [
    {
      id: "sss",
      prefix: "SSS:",
      emphasis: "Auto-computed",
      icon: "calculator" as const,
      placement: "top-left" as const,
    },
    {
      id: "savings",
      prefix: "Savings",
      emphasis: "+5.2%",
      icon: "trending-up" as const,
      placement: "bottom-left" as const,
    },
    {
      id: "reminder",
      prefix: "Pay date",
      emphasis: "tomorrow",
      icon: "bell" as const,
      placement: "right-mid" as const,
      emphasisClass: "font-medium text-slate-500",
    },
  ],
} as const;

export const LANDING_FEATURE_SHOWCASE = {
  badge: "Features",
  title: "Everything You Need to Manage Your",
  titleAccent: "Freelance Finances",
  subtitle:
    "Built specifically for Filipino freelancers who want to understand where their money goes — and make it grow.",
  blocks: [
    {
      id: "pay-records",
      badge: "Pay Records",
      title: "Every Cutoff, Auto-",
      titleLine2: "Computed",
      description:
        "Log client payments, allowances, and voluntary contributions. Tax and government deductions compute instantly from the latest tables.",
      bullets: [
        {
          label: "SSS",
          description: "Auto-computed from latest contribution table",
          dot: "violet" as const,
        },
        {
          label: "PhilHealth",
          description: "Premium rate auto-applied",
          dot: "violet" as const,
        },
        {
          label: "Pag-IBIG",
          description: "Mandatory & MP2 contributions",
          dot: "violet" as const,
        },
        {
          label: "Withholding Tax",
          description: "BIR tax table integrated",
          dot: "violet" as const,
        },
      ],
      mockUrl: "vault.app/records/new",
      reverse: false,
    },
    {
      id: "budget",
      badge: "Budget Planning",
      title: "The 50/30/20 Rule, One",
      titleLine2: "Click",
      description:
        "Allocate every peso with purpose. Set up the 50/30/20 rule instantly, or customize categories to match your lifestyle.",
      bullets: [
        {
          label: "Needs (50%)",
          description: "Rent, utilities, groceries",
          dot: "violet" as const,
        },
        {
          label: "Wants (30%)",
          description: "Dining, entertainment, shopping",
          dot: "indigo" as const,
        },
        {
          label: "Savings (20%)",
          description: "Emergency fund, investments",
          dot: "violet" as const,
        },
        {
          label: "Custom splits",
          description: "Adjust percentages freely",
          dot: "indigo" as const,
        },
      ],
      mockUrl: "vault.app/budget",
      reverse: true,
    },
    {
      id: "investments",
      badge: "Investments & Reminders",
      title: "Track Growth, Never Miss a Deadline",
      description:
        "Monitor stocks, crypto, mutual funds, and real estate in one dashboard. Set recurring reminders so you never miss a payment.",
      bullets: [
        {
          label: "Multi-asset",
          description: "Stocks, crypto, mutual funds, real estate",
          dot: "violet" as const,
        },
        {
          label: "Reminders",
          description: "Bills, contributions, pay dates",
          dot: "indigo" as const,
        },
        {
          label: "Returns",
          description: "Track gains across all investments",
          dot: "violet" as const,
        },
        {
          label: "Timeline",
          description: "Full history of every transaction",
          dot: "indigo" as const,
        },
      ],
      mockUrl: "vault.app/investments",
      reverse: false,
    },
  ],
} as const;

export const LANDING_FEATURES = {
  badge: "Why Vault",
  title: "Stop Wrestling with",
  titleAccent: "Spreadsheets",
  subtitle:
    "Most Filipino freelancers track their pay in Google Sheets or Excel. Here's why that doesn't work.",
  spreadsheet: {
    title: "Spreadsheets",
    points: [
      {
        text: "Manually compute SSS, PhilHealth, Pag-IBIG every cutoff",
        icon: "clock" as const,
      },
      {
        text: "Formulas break when contribution tables update",
        icon: "alert" as const,
      },
      {
        text: "No budget tracking — just raw numbers",
        icon: "alert" as const,
      },
      {
        text: "Forget payment deadlines and due dates",
        icon: "clock" as const,
      },
      {
        text: "No visual trends or insights",
        icon: "alert" as const,
      },
    ],
  },
  vault: {
    title: "Vault",
    points: [
      "Government deductions auto-computed instantly",
      "Always up-to-date contribution tables",
      "Built-in 50/30/20 budget planner",
      "Reminders for every deadline",
      "Dashboard with trends, charts, and projections",
    ],
  },
} as const;

export const LANDING_HOW_IT_WORKS = {
  badge: "How It Works",
  title: "Get Started in",
  titleAccent: "Four Simple Steps",
  titleAccentLine1: "Four Simple",
  titleAccentLine2: "Steps",
  subtitle:
    "From signup to your first dashboard insight — built for Filipino freelancers.",
  steps: [
    {
      step: 1,
      title: "Create Your Account",
      description:
        "Sign up in seconds with your email. Free forever, no credit card required.",
    },
    {
      step: 2,
      title: "Record Your Pay",
      description:
        "Log income and deductions per cutoff. Government contributions and tax estimates compute instantly.",
    },
    {
      step: 3,
      title: "Set Your Budget",
      description:
        "Plan with 50/30/20 and split Needs, Wants, and Savings into custom categories.",
    },
    {
      step: 4,
      title: "Track Everything",
      description:
        "Use your dashboard for trends, log expenses and investments, and set recurring reminders.",
    },
  ],
} as const;

export const LANDING_NAV_ITEMS = [
  { label: "Features", sectionId: "features" },
  { label: "How It Works", sectionId: "how-it-works" },
  { label: "Pricing", sectionId: "pricing" },
  { label: "FAQ", sectionId: "faq" },
] as const;

export const LANDING_PRICING = {
  badge: "Pricing",
  title: "Simple Pricing.",
  titleAccent: "Free Forever.",
  titleAccentLine1: "Free",
  titleAccentLine2: "Forever.",
  subtitle:
    "No tiered pricing, no feature gates. Every feature is available to every user, always.",
  cardBadge: "Free Forever",
  price: "₱0",
  period: "forever",
  description:
    "Everything you need to manage your freelance finances. No hidden fees, no premium tiers.",
  features: [
    "Unlimited income & deduction records",
    "BIR, SSS, PhilHealth & Pag-IBIG estimates",
    "50/30/20 budget planner",
    "Custom pay & budget categories",
    "Lifestyle expense tracking",
    "Investment portfolio tracking",
    "Recurring reminders",
    "Dashboard with charts & trends",
    "Dark mode",
    "Mobile responsive",
    "Change display currency",
  ],
  ctaLabel: "Get Started Free",
};

export const LANDING_FAQ = {
  badge: "FAQ",
  title: "Frequently Asked",
  titleAccent: "Questions",
};

export const LANDING_FAQ_ITEMS = [
  {
    question: "Is Vault really free?",
    answer:
      "Yes. Vault is free to use for tracking take-home pay, deductions, and your 50/30/20 budget.",
  },
  {
    question: "Is my salary data secure?",
    answer:
      "Your data is stored securely with Supabase, which uses enterprise-grade encryption (AES-256) and row-level security. Your salary information is never shared with third parties.",
  },
  {
    question: "How does the SSS/PhilHealth/Pag-IBIG computation work?",
    answer:
      "Vault applies the latest published contribution schedules — SSS MSC brackets, PhilHealth premium rates, and Pag-IBIG fund salary caps — and computes your share automatically from gross income each cutoff.",
  },
  {
    question: "Can I use Vault on mobile?",
    answer:
      "Yes. Vault works in your browser on phone, tablet, and desktop — no install required.",
  },
  {
    question: "Can I track salary from multiple employers?",
    answer:
      "Yes. Log each client or employer payment as a separate pay record. Vault rolls them up on your dashboard so you can see totals, deductions, and budget in one place.",
  },
  {
    question: "What is the 50/30/20 budget rule?",
    answer:
      "It splits your true take-home pay into three buckets: 50% for needs (rent, bills, groceries), 30% for wants (dining, hobbies), and 20% for savings. Vault applies it in one click and lets you customize the split.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes. You can export your investment holdings as CSV from the Investments page. Your pay records and expenses stay in your private account and are always available from the dashboard.",
  },
];

export const LANDING_FOOTER = {
  tagline: "The salary tracker for Filipino freelancers.",
  copyright: "© 2026 Vault. All rights reserved.",
  cta: {
    title: "Start Tracking Your Vault Today",
    description:
      "Join Filipino freelancers who've taken control of their finances. Free forever.",
    buttonLabel: "Create Free Account",
    note: "No credit card required",
  },
  columns: {
    product: {
      title: "Product",
      links: LANDING_NAV_ITEMS.map(({ label, sectionId }) => ({
        label,
        sectionId,
      })),
    },
    legal: {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
      ],
    },
    account: {
      title: "Account",
      links: [
        { label: "Log in", href: "/login" },
        { label: "Sign up", href: "/signup" },
      ],
    },
  },
} as const;
