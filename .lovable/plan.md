# CertKeep — Marketing Landing Page + Pilot Signup

A single, polished marketing page for CertKeep with a working pilot application form. No dashboard, no customer logins, no payments, no document storage.

## What gets built

**One main page** (`/`) with a sticky top bar and these sections in order:

1. **Navigation** — CertKeep wordmark with an original shield/check mark; center links (How it works, Features, Pricing, Security, FAQ) that smooth-scroll; "Log in" as a plain link that goes nowhere functional; orange "Join the Pilot" button that jumps to the pilot form. Mobile gets a slide-in drawer.
2. **Hero** — two columns: eyebrow, large headline "Stop chasing subcontractor certificates.", supporting copy, two buttons, and the reassurance line. Right side is a hand-built dashboard mockup (84% compliance score, 24 subcontractors, 3 expiring, 2 missing, a small table with Apex Electrical / Northline Concrete / Summit Fire Systems, status pills, and a "Send upload link" action). It fades and lifts in gently on load.
3. **Audience strip** — one quiet line of text, no fake logos.
4. **Problem** — split layout with the three pain points, written plainly.
5. **How it works** — three large numbered steps joined by a thin connecting line on desktop, stacked on mobile.
6. **Magic link** — dark ink section, white text, orange accent, with a realistic phone mockup of the subcontractor upload screen.
7. **Features** — asymmetrical bento grid with the six cards, deliberately mixed sizes; the compliance-board card holds a mini table, the alerts card a 30-day timeline. Icons come from one set (Lucide), no emoji.
8. **Comparison** — old workflow vs. CertKeep, side by side and concise.
9. **Pricing** — single Starter card, $49/month, the included list, and the pilot CTA. No checkout.
10. **Pilot signup** — visually distinct section with the full form and a polished success state.
11. **FAQ** — accessible accordion with the six questions as written.
12. **Footer** — logo, short description, section links, Privacy, Terms, Contact, current year.

Plus two thin placeholder pages at `/privacy` and `/terms` that say the policies are being prepared — no invented legal text. A `/security` anchor section lives on the main page covering how links expire and are revocable, and that contractors approve every document (no certification claims).

## Pilot form

Fields: full name, work email, phone, company, state, job title, approximate number of active subcontractors, current tracking method, biggest compliance problem. Required fields are validated in the browser and again on the server; email format is checked. Every field has a visible label, errors are announced, and the submit button shows a loading state.

Submissions are saved using Lovable Cloud (built-in database) in a single `pilot_applications` table — the minimum needed to capture leads. Nothing else is stored, and no one can read the submissions from the public site; only you, through the project's backend view.

## Design system

- Colors exactly as specified: ink #111827, warm white #FAFAF8, white cards, soft gray #F3F4F6, orange #F05A28 (hover #D94716), green #167A5A, amber #C68118, body #374151, borders #E5E7EB. Orange stays reserved for buttons, small highlights, and status.
- Manrope for headings and body, loaded in the page head.
- Content max width 1240px, desktop section spacing ~112px and mobile ~72px, card padding ~32px, 14px corner radius, subtle borders instead of heavy shadows.
- Scroll-reveal and hover motion are light and turn off entirely when the visitor prefers reduced motion.

## Technical notes

- TanStack Start routes: rewrite `src/routes/index.tsx` as the landing page, add `privacy.tsx` and `terms.tsx`.
- Design tokens added to `src/styles.css` under `@theme inline` — no hardcoded color utilities in components.
- Section components split under `src/components/landing/` (Nav, Hero, DashboardMockup, PhoneMockup, Problem, HowItWorks, MagicLink, Features, Comparison, Pricing, PilotForm, FAQ, Footer).
- Form submit goes through a server function with Zod validation, inserting into the Cloud table; the table has row-level security allowing anonymous inserts only, no public reads.
- Scroll reveal via a small IntersectionObserver hook — no animation library.
- SEO title/description as specified plus Open Graph and Twitter card tags; no social image generated.

## Not included

Dashboard, contractor accounts, payments, real document storage, subcontractor portal, social preview image.

## After the first version

Connecting the project to GitHub is done from Lovable's GitHub button in the top bar — I'll remind you when the build is done.
