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
  sessions free, as a diagnostic. The pages state only these three facts about
  him and his practice; `RETIRED` in `scripts/verify/claims.mjs` lists the claims
  removed for going beyond them, and `npm run verify:facts` fails if one returns.
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
- Advert link tags (`utm_*`) are copied onto the site's own links and Calendly's
  by `site.js`, and passed to Calendly's embed; nothing is stored. The site has
  no Meta code (no Pixel): Meta's Business Tools Terms §1.h forbid sharing data
  based on health information. Calendly's own page, inside the booking frame,
  loads Meta's Pixel and other tools only if the visitor accepts Calendly's
  optional cookies; the privacy policy and cookie notice say so.
- The privacy policy and cookie notice name what the booking calendar loads from
  `src/data/calendly-third-parties.json` (measured by `scripts/verify/calendly.mjs`)
  through `src/lib/third-parties.mjs`, which describes each service with its
  source; the build stops on any host or stored item it cannot identify.
- The Content Security Policy is a meta tag built in `scripts/build.mjs`. A new
  outside resource must be allowed there; the inline head script's hash is
  computed at build time.
- Every page's footer keeps the crisis signposting (999, NHS 111, Samaritans
  116 123) and states that DeepRest is not an emergency service.
- Links are relative, so the site works at any base path; 404.html links
  through a `<base>` taken from `site.url`.
- Once the visitor chooses Calendly (or a remembered choice), the booking frame
  is 1,130px tall below 68rem and 760px above, matching Calendly's stacked and
  two-column layouts, so the frame never scrolls inside and nothing shifts when
  the calendar loads; before the choice it is only as tall as its message, with
  no empty band over 80px (`scripts/verify/layout.mjs`).
- Calendly books one session per booking, so the booking page explains how to
  book all five free sessions one at a time. After the choice, "Book another
  session" under the calendar reloads it, and Calendly's
  `calendly.event_scheduled` message marks a booking.
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
  validator, links, punctuation and spacing, facts (placeholders, invented
  facts, protected titles, clinical claims, retired claims on the pages and in
  the Calendly event's description, third parties named against those the
  Calendly check measured in the same run), the strict build, Lighthouse and
  PDFs. `typography.mjs` and `facts.mjs` take `--self-test`, against the pages
  saved in `scripts/verify/fixtures/`. The validator needs
  the Nu HTML Checker unpacked in `.tools/vnu-runtime-image` (vnu.windows.zip
  from github.com/validator/validator/releases; no Java).
- `node scripts/verify/pagespeed.mjs --live --browser-url=http://127.0.0.1:9222`
  is an extra check, not part of `verify`: PageSpeed Insights (Lighthouse on
  Google's servers) for every live page, through a tab of its own in a Chrome
  signed in to Google, since signed out it hits a shared quota. Lighthouse on
  this machine varies with its load; Google's result is the second opinion.
- A change is finished only after `node scripts/verify/human-pass.mjs [--live]`,
  also outside `verify`: every page at 7 widths scrolled at 800 px a second,
  with every FAQ answer, the menu, the booking question and the calendar
  opened, a capture at each stop in verification/human-pass/. Every capture is
  looked at; what was seen goes in verification/human-pass-review.json, and
  both go into REPORT.md.

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
- `src/data/calendly-third-parties.json`: the outside hosts, cookies and
  stored items the booking calendar loaded, up to its details form, with
  Calendly's banner declined and accepted, when last measured locally;
  `src/lib/third-parties.mjs` identifies and describes each.
- `src/lib/review-notes.mjs`: wording beyond Nick's own words that he should
  confirm, listed at the end of PLACEHOLDERS.md.
