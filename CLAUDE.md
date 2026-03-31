# Appleseed

Automated teacher appreciation subscription service. V1 is the Group Gift MVP: a room parent creates a pool, shares a link, parents contribute via Stripe, and the teacher receives a gift card + branded digital card with all kids' names.

Full subscription flow (Seed $99 / Bloom $149 / Harvest $199 per year) ships for September 2026 enrollment.

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript strict)
- **Hosting:** Vercel
- **Database + Auth:** Supabase (Postgres + RLS + Magic Link auth)
- **Payments:** Stripe (Checkout Sessions for one-time contributions)
- **Email:** Resend (transactional, React Email templates)
- **Gift Cards:** Tremendous API (programmatic purchasing, 2000+ brands)
- **Card Generation:** @vercel/og (Satori) for branded PNG cards
- **Scheduled Jobs:** Vercel Cron (hourly pool deadline + delivery processing)
- **AI Notes (V2):** Claude API

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # root: Playfair Display + DM Sans, cream bg
│   ├── page.tsx                # landing page + waitlist
│   ├── globals.css             # Tailwind v4 + CSS vars from DESIGN.md
│   ├── p/[slug]/               # contribution page (public, mobile-first)
│   ├── pool/new/               # create pool (auth required)
│   ├── pool/[poolId]/manage/   # room parent dashboard (auth)
│   ├── auth/                   # magic link login + callback
│   ├── claim/[deliveryId]/     # teacher gift card claim
│   ├── dashboard/              # room parent pool list
│   └── api/                    # all API routes
│       ├── pool/               # CRUD + by-slug lookup
│       ├── contribute/         # Stripe Checkout Session creation
│       ├── webhooks/stripe/    # payment webhook handler
│       ├── waitlist/           # email collection
│       ├── cron/close-pools/   # hourly deadline processing
│       └── cron/deliver-gifts/ # gift card purchase + email delivery
├── components/ui/              # button, input, card, progress-bar, badge
├── lib/
│   ├── supabase/               # client.ts, server.ts, admin.ts
│   ├── stripe/                 # client.ts, checkout.ts, webhooks.ts
│   ├── resend/                 # client.ts
│   ├── tremendous/             # client.ts (with retry logic)
│   ├── constants.ts            # fee %, amounts, occasions
│   └── utils.ts                # formatCents, calculateFee, generateSlug
└── middleware.ts               # auth check on protected routes
```

## Key Concepts

- **Pool:** Group gift collection with a shareable slug URL at `/p/[slug]`
- **Contribution:** Anonymous parent payment into a pool (child name for the card, amounts private)
- **Delivery:** Gift card purchase + digital card generation + teacher email
- **Subscription (V1.5):** Individual parent annual plan (Seed/Bloom/Harvest)

## Database

Schema: `supabase/migrations/001_initial_schema.sql`
Tables: schools, teachers, parents, pools, contributions, deliveries, waitlist
All amounts in cents (integer). Pool slug for shareable URLs.
RLS: pools are public read, contributions never expose amounts to other parents.

## Development

```bash
npm install
npm run dev        # Start dev server
npm run build      # Production build
```

Environment variables (see .env.example):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `TREMENDOUS_API_KEY`, `TREMENDOUS_CAMPAIGN_ID`, `TREMENDOUS_API_URL`
- `CRON_SECRET` (for Vercel Cron auth)
- `NEXT_PUBLIC_APP_URL`

## Key Design Decisions (from eng review)

1. **Pool URLs:** `/p/[slug]` for short text-message-friendly links
2. **Gift card API:** Tremendous (self-serve signup, faster than Tango Card)
3. **Contributor auth:** Fully anonymous. No accounts for contributing parents.
4. **Pool minimum:** No minimum. Any amount collected gets delivered.
5. **Amount privacy:** Show running total + family count (accept inference risk for social proof)
6. **Schema:** Normalized (schools, teachers tables) for September subscription expansion
7. **Platform fee:** 5% on top of contribution, transparent at checkout

## Design Documents

- **Design doc:** `~/.gstack/projects/krantz426-Appleseed/jayrosenkrantz-main-design-20260330-153324.md`
- **Eng plan:** `~/.claude/plans/inherited-bouncing-matsumoto.md`
- **Test plan:** `~/.gstack/projects/krantz426-Appleseed/jayrosenkrantz-main-eng-review-test-plan-20260330-171718.md`
- **Design mockups:** `~/.gstack/projects/krantz426-Appleseed/designs/contribution-page-20260330/`

## Conventions

- TypeScript strict mode
- Tailwind CSS v4 with design tokens in globals.css
- Supabase Row Level Security on all tables
- Stripe webhooks for payment event handling
- All monetary amounts stored in cents (integer)
- Dates in UTC, displayed in user's local timezone
- Lazy initialization for API clients (Stripe, Tremendous) to avoid build-time env var errors

## Design System

Always read DESIGN.md before making any visual or UI decisions.
Fonts: Playfair Display (display/hero), DM Sans (body/UI).
Colors: primary #3d6b3d, accent #b8860b, bg #faf8f4, border #d4c5a9.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
