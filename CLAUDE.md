## START HERE

- Status: the site is built and verified but not published. 28 placeholders
  remain (PLACEHOLDERS.md); publishing waits for Nick's real details and
  Calendly link. Latest results: verification/REPORT.md.
- `site.config.json` holds every fact about the practice, and is the only place
  facts live. An unknown fact is a `{ "placeholder", "needs" }` object, shown on
  the site as a marked placeholder; `site.url` and `calendly.url` also carry an
  `interim` value (the GitHub Pages project address; Calendly's own demo page
  `calendly.com/embed-demo-sales/discovery-call`).
- `npm run build` renders `src/` into `dist/` (git-ignored) and regenerates
  PLACEHOLDERS.md. `npm run build:strict` refuses while any placeholder remains.
- `npm run serve` serves `dist/` as GitHub Pages would, at
  http://localhost:4173/DeepRest/.
- `npm run verify` builds, serves, runs every check in `scripts/verify/`, and
  writes verification/REPORT.md. The checks are Calendly, layout and
  screenshots, the HTML validator, links, facts, publish-readiness, Lighthouse
  and PDFs. It needs the Nu HTML Checker unpacked in `.tools/vnu-runtime-image`
  (vnu.windows.zip from github.com/validator/validator/releases; no Java).
- Publishing: `.github/workflows/publish.yml` runs only by hand and deploys the
  strict build to GitHub Pages. Settings > Pages > Source must be "GitHub
  Actions"; Pages from this private repository needs a paid GitHub plan.

## Code map

- `src/pages/*.mjs`: one module per page (title, description, content);
  `src/pages/index.mjs` lists them in order. `not-found.mjs` is 404.html.
- `src/lib/layout.mjs`: head, header, footer and Calendly consent dialog;
  `src/lib/facts.mjs`: reads facts (`F.text`, `F.list`, `F.paras`, `F.plain`,
  `F.value`) and records where each placeholder appears; `src/lib/ui.mjs`,
  `src/lib/icons.mjs`: shared blocks and inline SVG icons.
- `src/assets/`: `css/site.css` (mobile first; breakpoints 30rem, 48rem,
  60rem, 68rem), `js/site.js` (menu, Calendly loading), the self-hosted Source
  Serif 4 heading font (OFL), favicon and touch icon.
- `src/data/calendly-cookies.json`: cookies Calendly set when last tested,
  written by `scripts/verify/calendly.mjs` and listed on the cookie notice.
- `src/lib/review-notes.mjs`: general wording the psychologist must confirm,
  listed at the end of PLACEHOLDERS.md.

## Rules

- This repository builds the DeepRest website: the site of a professional
  psychologist, where clients book their appointments through Calendly.
- This file is loaded into every session in this repository as standing
  context: keep it short, at most 15,000 characters.
- Every line is a concise fact or rule that is true now: no dated content and
  no history. Git keeps the history.
- No invented facts: never write a practice fact into page code; add it to
  `site.config.json` as a placeholder and render it through `F`. No
  testimonials, outcomes or statistics. A new figure in page text must be
  added, with its source, to the verified list in `scripts/verify/facts.mjs`.
- Do not publish while any placeholder remains.
- Calendly loads only after the visitor chooses it. The choice is remembered
  in localStorage under `deeprest-calendly-consent`. The header "Book a session"
  button asks first, then opens Calendly's popup; the booking page has the
  inline calendar. Without JavaScript, the button links to the booking page.
- The Content Security Policy is a meta tag built in `scripts/build.mjs`. A new
  outside resource must be allowed there; the inline head script's hash is
  computed at build time.
- Every page's footer keeps the crisis signposting (999, NHS 111, Samaritans
  116 123) and states that DeepRest is not an emergency service.
- Links are relative, so the site works under `/DeepRest/` or on its own
  domain; 404.html links through a `<base>` taken from `site.url`.
- The booking frame is 1,130px tall below 68rem and 760px above, matching
  Calendly's stacked and two-column layouts, so the frame never scrolls inside
  and nothing shifts when the calendar loads.
- Test with taps, not clicks, inside Calendly on touch widths: Calendly
  ignores mouse clicks there.
- Stop servers and browsers you start by their own PID.
