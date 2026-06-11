# Vault

**Freelancer finance dashboard for Filipino freelancers** — track take-home pay, government deductions (SSS, PhilHealth, Pag-IBIG, BIR), 50/30/20 budgeting, expenses, investments, and reminders in one place.

Free to use. No credit card required.

---

## Table of contents

- [For users](#for-users)
- [For developers](#for-developers)
- [Security & privacy](#security--privacy)
- [License](#license)

---

## For users

### What is Vault?

Vault helps Filipino freelancers understand where their money goes. Instead of juggling spreadsheets every cutoff, you log pay once and Vault handles the rest — deductions, budget splits, spending, and reminders.

### Who is it for?

- Freelancers and independent contractors in the Philippines
- Anyone paid per cutoff who needs SSS, PhilHealth, Pag-IBIG, and BIR estimates
- People who want a simple 50/30/20 budget without manual formulas

### What you can do

| Area | What Vault offers |
|---|---|
| **Dashboard** | See gross pay, deductions, net pay, savings rate, and trends |
| **Pay records** | Log income and deductions per cutoff; gov't contributions auto-computed |
| **Budget** | Plan with the 50/30/20 rule (Needs / Wants / Savings) or custom splits |
| **Expenses** | Track lifestyle spending by category |
| **Investments** | Monitor stocks, crypto, mutual funds, and other assets |
| **Reminders** | Get alerts for pay dates, bills, and contributions |
| **Settings** | Profile photo, dark mode, currency, and date format |

### How to get started (no coding)

1. Open the app in your browser
2. **Sign up** at `/signup` with your email
3. **Log in** at `/login`
4. Add your first pay record, then set up your budget from the sidebar

### Is my data safe?

Yes. Your salary and financial records are tied to your account only. Other users cannot see your data. See [Security & privacy](#security--privacy) below for details.

---

## For developers

### Tech stack

- [Next.js 16](https://nextjs.org/) · [React 19](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — auth, PostgreSQL, storage
- [Redux Toolkit](https://redux-toolkit.js.org/) · [Recharts](https://recharts.org/)

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/)
- A [Supabase](https://supabase.com/) project (free tier works)

### Local setup

**1. Clone and install**

```bash
git clone <your-repo-url>
cd vault-app
npm install
```

**2. Environment variables**

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get both values from Supabase → **Project Settings** → **API** (Project URL and the `anon` public key).

> Never commit `.env.local`. It is already in `.gitignore`.

**3. Database schema**

In Supabase → **SQL Editor**, run the full file:

```text
supabase/setup.sql
```

This creates all tables, row-level security (RLS) policies, and the avatars storage bucket. Run once on a fresh project.

Individual SQL files are in `supabase/` if you prefer to run migrations separately.

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/signup` | Create account |
| `/login` | Sign in |
| `/dashboard` | Main app (requires login) |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

### Project structure

```text
src/
├── app/              # Next.js routes (pages and layouts)
├── api/              # Supabase data access layer
├── components/       # Shared UI, layout, and auth components
├── contexts/         # React context providers
├── features/         # Feature modules (dashboard, budget, records, etc.)
├── lib/              # Supabase client and utilities
├── store/            # Redux store and slices
├── styles/           # Global CSS
├── types/            # TypeScript types
└── utils/            # Helpers (dates, currency, deductions, etc.)

supabase/             # SQL schema and migrations
public/               # Static assets
```

### Deploy

**Local production**

```bash
npm run build
npm run start
```

**Hosted (e.g. [Vercel](https://vercel.com/))**

1. Push the repo to GitHub
2. Import the project in your hosting provider
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Ensure `supabase/setup.sql` has been run on your Supabase project before going live.

### Troubleshooting

| Problem | Fix |
|---|---|
| "Missing Supabase environment variables" | Add `.env.local` with both `NEXT_PUBLIC_*` keys and restart the dev server |
| "Could not find the public.* table" | Run `supabase/setup.sql` in Supabase SQL Editor |
| Avatar upload fails | Confirm section 6 of `setup.sql` ran (avatars storage bucket + policies) |
| Redirected to `/login` on every page | Sign in first; protected routes require an active Supabase session |

---

## Security & privacy

- **Row-level security (RLS)** — Each table restricts access to `auth.uid() = user_id`, so users only read and write their own rows
- **Anon key only** — The frontend uses the Supabase `anon` public key. Never expose the service role key in client code
- **Encryption** — Data is encrypted in transit (HTTPS) and at rest on Supabase infrastructure
- **Secrets** — Keep `.env.local` out of version control

Profile avatars are stored in a public storage bucket (anyone with the URL can view them). Financial records are not public.

---

## License

Personal project — all rights reserved.
