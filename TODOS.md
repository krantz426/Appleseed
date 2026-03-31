# TODOS — Appleseed

## Blocking Beta (must complete before April 20 beta launch)

### Infrastructure Setup
- [ ] **Create Supabase project** — Run `001_initial_schema.sql` migration against production Supabase. Without this, nothing works.
- [ ] **Set up Stripe account** — Get API keys (test + live), configure webhook endpoint pointing to `/api/webhooks/stripe`. Register for Stripe Checkout.
- [ ] **Sign up for Tremendous** — Self-serve at tremendous.com. Get API key + campaign ID. Fund account balance. Test sandbox gift card purchase. This has a KYB process that could take days, start immediately.
- [ ] **Configure Resend** — Set up sending domain (appleseed.com or similar), verify DNS. Get API key.
- [ ] **Acquire domain** — Check appleseed.com availability. Alternatives: useappleseed.com, getappleseed.com, appleseed.gift.
- [ ] **Deploy to Vercel** — Connect GitHub repo, set all env vars, configure Vercel Cron in vercel.json (hourly for close-pools and deliver-gifts).
- [ ] **Add CRON_SECRET** — Generate a random secret, set in Vercel env vars, used by cron route handlers for auth.

### Code Completions
- [ ] **Add vercel.json with cron config** — Define hourly cron jobs for `/api/cron/close-pools` and `/api/cron/deliver-gifts`.
- [ ] **Add .env.example updates** — Add TREMENDOUS_API_KEY, TREMENDOUS_CAMPAIGN_ID, TREMENDOUS_API_URL, CRON_SECRET, RESEND_FROM_EMAIL to .env.example.
- [ ] **Email templates** — Build proper React Email templates for: contribution confirmation, pool created (with shareable link), gift delivery to teacher, teacher claim reminder, pool extension notice, refund notice.
- [ ] **Card generator** — Implement the @vercel/og Satori-based PNG generator at `/api/card/generate`. 1080x1080 branded card with teacher name, classroom, child names, message.
- [ ] **Rate limiting** — Add rate limiting to public endpoints (`/api/contribute`, `/api/waitlist`) to prevent abuse.
- [ ] **Input validation** — Sanitize all user inputs (teacher name, child name, school name, messages) to prevent XSS.

### Testing
- [ ] **Unit tests for fee calculation** — Test calculateFee with various amounts including edge cases (1 cent, $500).
- [ ] **Unit tests for pool close logic** — Test the threshold, extension, and refund decision tree.
- [ ] **End-to-end test with Stripe test mode** — Create pool, contribute with test card 4242424242424242, verify webhook fires.
- [ ] **Mobile QA** — Test contribution page on iPhone Safari and Android Chrome.

### Demand Validation (parallel with code)
- [ ] **Talk to 5 room parents** — Post in local parents Facebook group or Nextdoor. Show the wireframes. Ask: "Would you send this link instead of opening Venmo?"
- [ ] **Research money transmission compliance** — Collecting pooled payments and distributing as gift cards may have state-by-state regulatory implications.

## V1.5 (May-August 2026, after beta validates demand)

- [ ] **Individual subscription flow** — Seed ($99), Bloom ($149), Harvest ($199) tiers with Stripe subscription billing. September setup, auto-delivery 3x/year.
- [ ] **Auto-delivery engine** — Vercel Cron or Inngest jobs that trigger gift card purchase + card generation on the three dates (December, May, June).
- [ ] **Parent-typed message** — Free text message that appears on the digital card. No AI yet.
- [ ] **Optional account after payment** — Success page offers "Create a free account" via magic link. Builds parent database for September upsell.
- [ ] **Per-pool OG images** — Dynamic social preview images for each pool link.
- [ ] **Real-time contribution updates** — Supabase Realtime subscription on contribution page.
- [ ] **Contributor nudge/reminder emails** — "3 days left" and "$X away from goal" emails to the room parent for re-sharing.

## V2 (Post-Validation)

- [ ] **Teacher preference profiles** — Teachers claim their profile, select preferred stores/brands.
- [ ] **AI-generated personalized notes** — Claude API generates age-appropriate teacher appreciation notes. Parent approves during setup.
- [ ] **Re-enrollment flow** — "New school year? Same teacher or new?" text in September.
- [ ] **Dark mode** — Design system defines it in DESIGN.md, just needs implementation.
- [ ] **Analytics dashboard** — Track pool creation rate, contribution conversion, delivery success rate.
- [ ] **School partnerships** — Partner with schools/PTAs directly for bulk adoption.

## Risks to Monitor

- **Tremendous KYB timeline** — Business verification could take 1-2 weeks. Start signup day 1.
- **Money transmission compliance** — Collecting and holding pooled funds may trigger state regulations. Research by Week 2.
- **Delivery partial failures** — Gift card purchased but email fails = lost gift card. Need idempotency keys and retry state machine.
- **Stripe refund window** — Pool deadline + 7-day extension could push past Stripe's easy refund window for some payment methods.
