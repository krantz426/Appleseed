# Appleseed

Automated teacher appreciation subscription service. Parents sign up once in September, pick a tier, and Appleseed delivers a gift card + personalized digital card to their child's teacher three times a year. The group gift flow lets a room parent create a pool, share a link, and collect contributions from the whole class.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Hosting:** Vercel
- **Database + Auth:** Supabase
- **Payments:** Stripe (subscriptions + one-time group contributions)
- **Email:** Resend (transactional)
- **Gift Cards:** Tango Card API (or Tremendous, evaluate Week 1)
- **Scheduled Jobs:** Vercel Cron
- **AI Notes (V2):** Claude API

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # React components
  lib/           # Shared utilities, API clients, database queries
  styles/        # Global styles
```

## Key Concepts

- **Pool:** A group gift collection created by a room parent for a specific teacher + occasion
- **Contribution:** A parent's payment into a pool (includes child name for the card)
- **Subscription:** An individual parent's annual plan (Seed/Bloom/Harvest tier)
- **Delivery:** A scheduled gift card purchase + digital card generation for a specific occasion

## Development

```bash
npm install
npm run dev        # Start dev server at localhost:3000
```

Environment variables needed (see .env.example):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `TANGO_CARD_API_KEY`

## Design Doc

The approved design doc is at `~/.gstack/projects/krantz426-Appleseed/jayrosenkrantz-main-design-20260330-153324.md`. It contains the full product spec, data model, delivery flow, edge cases, and milestone calendar.

## Conventions

- TypeScript strict mode
- Tailwind CSS for styling
- Supabase Row Level Security for all tables
- Stripe webhooks for payment event handling
- All monetary amounts stored in cents (integer)
- Dates in UTC, displayed in user's local timezone

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
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
