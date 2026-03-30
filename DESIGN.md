# Design System — Appleseed

## Product Context
- **What this is:** Automated teacher appreciation subscription service. Parents sign up once, Appleseed delivers gift cards + personalized digital cards to their child's teacher three times a year. Group gift flow lets room parents collect contributions from the whole class.
- **Who it's for:** Affluent parents ($500K+ households), room parents at private/public schools
- **Space/industry:** Gifting, parent-tech, teacher appreciation. Peers: GroupTogether, GiftCrowd, CheddarUp
- **Project type:** Web app (Next.js), mobile-first contribution page, desktop-friendly landing + dashboard

## Aesthetic Direction
- **Direction:** Warm Editorial — premium stationery brand that adults trust with their money. Not cutesy, not corporate. The feeling of handing someone a beautifully wrapped gift.
- **Decoration level:** Minimal with intentional touches — thin lines, generous whitespace, warm gold accents. Emoji accents allowed on contribution page and onboarding flows, NOT on landing page or marketing.
- **Mood:** A quiet confidence. Like walking into a well-designed gift shop where everything is already wrapped. Warm, trustworthy, effortless.
- **Reference sites:** Competitors (GroupTogether, GiftCrowd) are utility-first. Appleseed should feel like a gift, not a form.

## Typography
- **Display/Hero:** Playfair Display (500-700 weight) — classic serif with elegant proportions. Used for the logo ("appleseed."), teacher names, section headings. Signals quality and care.
- **Body:** DM Sans (400/500) — clean, modern, stays out of the way. Highly readable at small sizes on mobile.
- **UI/Labels:** DM Sans (600/700) — bold weights for buttons, labels, navigation.
- **Data/Tables:** DM Sans (tabular-nums, 500) — keeps numbers aligned in contribution tracking and pricing.
- **Code:** JetBrains Mono (400)
- **Loading:** Google Fonts CDN — `Playfair+Display:wght@400;500;600;700` and `DM+Sans:wght@400;500;600;700`
- **Scale:** 11px / 12px / 13px / 14px / 16px / 18px / 20px / 24px / 28px / 36px / 48px

## Color
- **Approach:** Restrained — green + gold + cream. Color is rare and meaningful.
- **Primary:** #3d6b3d — deep forest green. Growth, nature, trust. Used for CTAs, active states, progress bars.
- **Primary Dark:** #2d5a2d — hover state for primary.
- **Primary Light:** rgba(61,107,61,0.08) — subtle backgrounds, badges, selected states.
- **Accent:** #b8860b — warm gold. The dot in "appleseed.", secondary actions, urgency badges. Pairs with the cream to feel like real stationery.
- **Accent Light:** rgba(184,134,11,0.1) — subtle background for accent elements.
- **Warm Rose:** #c4956a — tertiary, used sparingly for warmth.
- **Background:** #faf8f4 — warm cream. Not white, not beige. The foundation of the brand.
- **Surface:** #ffffff — cards, modals, inputs. With thin warm borders.
- **Border:** #d4c5a9 — warm gold-gray for borders and dividers.
- **Border Light:** #ece8e0 — subtle separators within cards.
- **Text:** #2d2a26 — near-black with warm undertone.
- **Text Muted:** #7a7060 — secondary text, descriptions.
- **Text Light:** #a09880 — tertiary text, placeholders, captions.
- **Semantic:**
  - Success: #3d6b3d (same as primary — green means good)
  - Warning: #b8860b (same as accent — gold means attention)
  - Error: #c0392b (warm red, not harsh)
  - Info: #4a6fa5 (muted blue, not electric)
- **Dark mode strategy:** Invert surfaces (cream becomes #1a1814, surface becomes #242018). Reduce primary saturation slightly (#5a8a5a). Brighten accent to #d4a030. Maintain warm undertone throughout.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — generous padding, especially on mobile
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)
- **Mobile side margins:** 20-24px
- **Card internal padding:** 24-32px

## Layout
- **Approach:** Grid-disciplined on mobile (single column), hybrid on desktop
- **Grid:** 1 column mobile, 12 columns desktop (max-width: 960px)
- **Max content width:** 960px (landing), 390px (contribution page mockup)
- **Border radius:** sm:6px, md:8px, lg:10px, xl:12px, full:9999px (pills/badges)
- **Card style:** White surface, 1px solid #d4c5a9 (warm border) OR subtle shadow (0 1px 8px rgba(0,0,0,0.04))

## Motion
- **Approach:** Minimal-functional — subtle, restrained, no bouncing
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(100ms) short(200ms) medium(300ms)
- **Button hover:** translateY(-3px) + subtle shadow lift
- **Input focus:** border-color transition to primary
- **Card hover:** subtle shadow increase
- **No page transitions, no entrance animations, no bouncy transforms**

## Emoji Usage Policy
- **Allowed on:** Contribution page, onboarding flows, transactional emails, in-app notifications
- **Not allowed on:** Landing page, marketing site, pricing page, formal communications
- **Common emoji:** 🍎 (apple/brand), 🌱 (growing/progress), 💚 (heart/support), 🔒 (security), 🎒 (school)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-30 | Initial design system created | Created by /design-consultation. Warm Editorial direction chosen after exploring Playful School (Variant C), luxury variants (C1-C3), and Ghibli-inspired variants (G1-G3). User consistently preferred the original warm editorial wireframe over more playful options. |
| 2026-03-30 | Playfair Display + DM Sans font pairing | Serif display font signals premium quality and pairs with the "stationery brand" aesthetic. DM Sans for body keeps everything readable on mobile. |
| 2026-03-30 | Deep forest green (#3d6b3d) over bright green (#22c55e) | Deeper green feels more sophisticated and trustworthy for a payment flow. Bright green felt too "app-like" for the premium positioning. |
| 2026-03-30 | Emoji policy: contribution page yes, landing page no | Landing page needs to convert skeptical parents — premium editorial feel. Contribution page needs to feel warm and easy — emoji adds personality where trust is already established. |
