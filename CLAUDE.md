# DeepRest website

## Rules

- This repository builds DeepRest's website: the tech-addiction mentoring practice
  of Nick Finnemore, at https://deepestrest.com/, where clients book sessions
  through Calendly.
- This file is loaded into every session in this repository as standing
  context: keep it short, at most 15,000 characters.
- Every line is a concise fact or rule that is true now: no dated content and
  no history. Git keeps the history.
- Nick is a mentor. Never use "psychologist", "therapist", "counsellor" or any
  HCPC or BPS title for him, and make no clinical or medical claim; the site
  says mentoring is not therapy or medical care. `npm run verify:facts` fails on
  any of these words.
- His figures are used exactly as he gave them: a 100% satisfaction rate across
  23 clients, five years mentoring students and young adults, and the first five
  sessions free, as a diagnostic.
- No invented facts: never write a practice fact into page code; put it in
  `site.config.json` with its source under `_sources`, and render it through
  `F`. An unknown fact is left off the pages and listed under `_dropped`, not
  shown as a placeholder. No testimonials. A new figure in page text must be
  added, with its source, to the verified list in `scripts/verify/facts.mjs`.
- The repository is public: commit nothing private (secrets, tokens, personal
  data beyond what the site publishes). Commits use the GitHub noreply address
  set in this repository's git config.
- Calendly loads only after the visitor chooses it. The choice is remembered
  in localStorage under `deeprest-calendly-consent`. The header "Book a free
  session" button asks first, then opens Calendly's popup; the booking page has
  the inline calendar. Without JavaScript, the button links to the booking page.
- The Content Security Policy is a meta tag built in `scripts/build.mjs`. A new
  outside resource must be allowed there; the inline head script's hash is
  computed at build time.
- Every page's footer keeps the crisis signposting (999, NHS 111, Samaritans
  116 123) and states that DeepRest is not an emergency service.
- Links are relative, so the site works at any base path; 404.html links
  through a `<base>` taken from `site.url`.
- The booking frame is 1,130px tall below 68rem and 760px above, matching
  Calendly's stacked and two-column layouts, so the frame never scrolls inside
  and nothing shifts when the calendar loads.
- Test with taps, not clicks, inside Calendly on touch widths: Calendly
  ignores mouse clicks there. Tests never submit a booking.
- Stop servers and browsers you start by their own PID.

## START HERE

- Status: live at https://deepestrest.com/, served by GitHub Pages from `main`.
  Latest results: verification/REPORT.md. PLACEHOLDERS.md lists the facts left
  out for want of a source and the wording Nick should check.
- Publishing: `.github/workflows/publish.yml` runs only by hand (Actions >
  Publish to GitHub Pages > Run workflow, on `main`) and deploys the strict
  build. Settings > Pages has source "GitHub Actions", custom domain
  deepestrest.com and HTTPS enforced.
- Domain: deepestrest.com is on Nick's Cloudflare account, DNS only (not
  proxied): apex A and AAAA records to GitHub Pages, `www` CNAME to
  nickfinn-bit.github.io, and a GitHub Pages domain-verification TXT record.
  hello@deepestrest.com is a Cloudflare Email Routing address that forwards to
  Nick's Gmail.
- Booking: Calendly account in Nick's name (Google sign-in), event "Free
  diagnostic session", https://calendly.com/nicholas-finnemore/free-diagnostic,
  with Calendly's default length (30 minutes), location (Google Meet) and hours
  (weekdays 9am to 5pm UK time); Notetaker is off.
- `npm run build` renders `src/` into `dist/` (git-ignored) and regenerates
  PLACEHOLDERS.md. `npm run build:strict` refuses while any placeholder remains.
- `npm run serve` serves `dist/` as GitHub Pages would, at
  http://localhost:4173/.
- `npm run verify` builds, serves locally and runs every check in
  `scripts/verify/`, then writes verification/REPORT.md. `npm run verify:live`
  runs the same checks against the live site, plus `live.mjs` (DNS, HTTPS,
  redirects, every live page identical to `dist/`); build the deployed commit
  first. The checks are Calendly, layout and screenshots at 7 widths, the HTML
  validator, links, facts (placeholders, invented facts, protected titles,
  clinical claims), the strict build, Lighthouse and PDFs. The validator needs
  the Nu HTML Checker unpacked in `.tools/vnu-runtime-image` (vnu.windows.zip
  from github.com/validator/validator/releases; no Java).
- `node scripts/verify/pagespeed.mjs --live --browser-url=http://127.0.0.1:9222`
  is an extra check, not part of `verify`: PageSpeed Insights (Lighthouse on
  Google's servers) for every live page, through a tab of its own in a Chrome
  signed in to Google, since signed out it hits a shared quota. Lighthouse on
  this machine varies with its load; Google's result is the second opinion.

## Code map

- `src/pages/*.mjs`: one module per page (title, description, content);
  `src/pages/index.mjs` lists them in order. `not-found.mjs` is 404.html.
- `src/lib/layout.mjs`: head, header, footer and Calendly consent dialog;
  `src/lib/facts.mjs`: reads facts (`F.text`, `F.list`, `F.paras`, `F.plain`,
  `F.value`) and records where any placeholder appears; `src/lib/ui.mjs`:
  shared blocks (page head, figures panel, call-to-action band, `inWords`);
  `src/lib/icons.mjs`: inline SVG icons.
- `src/assets/`: `css/site.css` (mobile first; breakpoints 30rem, 48rem,
  60rem, 68rem), `js/site.js` (menu, Calendly loading), the self-hosted Source
  Serif 4 heading font (OFL), favicon and touch icon.
- `src/data/calendly-cookies.json`: cookies Calendly set when last tested
  locally, written by `scripts/verify/calendly.mjs` and listed on the cookie
  notice.
- `src/lib/review-notes.mjs`: wording beyond Nick's own words that he should
  confirm, listed at the end of PLACEHOLDERS.md.
