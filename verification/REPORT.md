# DeepRest website: verification report

Written by `scripts/verify/report.mjs` (the last step of `npm run verify`) on 2026-10-23 09:03 UTC, from the JSON results each check left in this folder.
The site was tested as built in `dist/`, served locally the way GitHub Pages serves it (`scripts/serve.mjs`, at http://localhost:4173/).

## Summary

| Check | Target | Result |
|---|---|---|
| Hosting: DNS, HTTPS, redirects, every page live and identical to the build | all pass | ✅ 22/22 |
| Lighthouse, mobile and desktop, 9 pages (local) | 95+ in Performance, Accessibility, Best Practices and SEO | ✅ 18/18 pass in every run; lowest score in any of 3 runs: **99**; 1 re-run after 1 failed attempts, shown below |
| PageSpeed Insights (Lighthouse on Google's servers), mobile and desktop, 9 pages (live) | 95+ in all four categories | ✅ 9/9 pages; lowest score: **100** |
| Horizontal scroll, 7 widths × 9 pages (local) | 0 | ✅ largest: **0 px** over 63 page-widths |
| Layout shift during load | under 0.1 | ✅ largest: **0.0000**; with the Calendly calendar auto-loading: 0.0000 |
| Layout faults: text cut off or overlapping, elements past the screen edge | 0 | ✅ **0**: 0 cut, 0 overlapping, 0 past the edge |
| Booking frame before the visitor chooses to load Calendly: tallest empty band (blank in all) | no band over 80 px | ✅ 360: **41 px** (146 of 539); 390: **41 px** (146 of 488); 768: **56 px** (178 of 450); 1024: **66 px** (201 of 507); 1280: **73 px** (215 of 521); 1440: **73 px** (215 of 521); 1920: **73 px** (215 of 521) |
| Calendly inline calendar, after consent: loads and opens its booking flow (local) | every width | ✅ 7/7 widths; 0 Calendly requests, 0 other outside requests and 0 cookies before consent: ✅ |
| “Book another session”, for booking all five free sessions one at a time | hidden before consent; shown after; says a session was booked when Calendly reports one; opens a fresh calendar | ✅ 7/7 widths |
| Calendly popup from the header button, after consent | every page, every width | ✅ 63/63 page-widths |
| HTML validator (W3C Nu HTML Checker, local) | 0 errors | ✅ **0 errors** in 10 files; 0 other warnings; 18 known CSP warnings, explained below |
| Broken links (local) | 0 | ✅ **0** broken of 336 references (61 distinct) |
| Placeholders | 0 | ✅ **0** |
| `npm run build:strict` | passes | ✅ builds 9 pages, none showing a placeholder, with the booking link https://calendly.com/nicholas-finnemore/free-diagnostic |
| Protected titles used for Nick (psychologist, therapist, counsellor, HCPC and BPS titles) | 0 | ✅ **0** on any page, in its text, title, description or sharing tags |
| Clinical or medical claims | 0 | ✅ **0** |
| Invented facts | 0 | ✅ **0** unexplained figures or contact details |
| Claims beyond Nick's three facts, of the kinds found and removed | 0 | ✅ **0** left; 11 kinds were found in 42 places, each listed below with its fix |
| Outside services the privacy policy names, and items the cookie notice lists, against those measured (local) | equal | ✅ services 12 named, 12 measured; items 14 listed, 14 measured; missing 0, extra 0 |
| Home page: headline figures and the free-diagnostic offer | shown | ✅ 100% satisfaction across 23 clients; five years; "Your first five sessions are free, as a diagnostic" |

## Hosting

Checked from this machine against https://deepestrest.com/, with DNS asked of 1.1.1.1 and 8.8.8.8.

| Check | Result | Detail |
|---|---|---|
| deepestrest.com A records are GitHub Pages' | ✅ | `["185.199.109.153","185.199.110.153","185.199.108.153","185.199.111.153"]` |
| deepestrest.com AAAA records are GitHub Pages' | ✅ | `["2606:50c0:8000::153","2606:50c0:8002::153","2606:50c0:8003::153","2606:50c0:8001::153"]` |
| www.deepestrest.com is a CNAME to nickfinn-bit.github.io | ✅ | `["nickfinn-bit.github.io"]` |
| deepestrest.com MX records are Cloudflare Email Routing's | ✅ | `[{"exchange":"route2.mx.cloudflare.net","priority":20,"type":"MX"},{"exchange":"route3.mx.cloudflare.net","priority":35,"type":"MX"},{"exchange":"route1.mx.cloudflare.net","priority":6,"type":"MX"}]` |
| deepestrest.com SPF record allows Cloudflare Email Routing | ✅ | `[["v=spf1 include:_spf.mx.cloudflare.net ~all"]]` |
| HTTPS certificate is valid for the domain | ✅ | `{"authorized":true,"subject":"deepestrest.com","altNames":"DNS:deepestrest.com, DNS:www.deepestrest.com","issuer":"Let's Encrypt","validTo":"Jan 18 00:29:23 2027 GMT"}` |
| http://deepestrest.com/ redirects to https://deepestrest.com/ | ✅ | `{"status":301,"location":"https://deepestrest.com/","final":"https://deepestrest.com/"}` |
| https://www.deepestrest.com/ redirects to https://deepestrest.com/ | ✅ | `{"status":301,"location":"https://deepestrest.com/","final":"https://deepestrest.com/"}` |
| http://www.deepestrest.com/ redirects to https://deepestrest.com/ | ✅ | `{"status":301,"location":"https://deepestrest.com/","final":"https://deepestrest.com/"}` |
| https://nickfinn-bit.github.io/DeepRest/ redirects to https://deepestrest.com/ | ✅ | `{"status":301,"location":"https://deepestrest.com/","final":"https://deepestrest.com/"}` |
| https://deepestrest.com/ answers 200 and matches dist/ | ✅ | `{"status":200,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/mentoring/ answers 200 and matches dist/ | ✅ | `{"status":200,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/about/ answers 200 and matches dist/ | ✅ | `{"status":200,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/faq/ answers 200 and matches dist/ | ✅ | `{"status":200,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/book/ answers 200 and matches dist/ | ✅ | `{"status":200,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/contact/ answers 200 and matches dist/ | ✅ | `{"status":200,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/privacy/ answers 200 and matches dist/ | ✅ | `{"status":200,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/cookies/ answers 200 and matches dist/ | ✅ | `{"status":200,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/no-such-page/ answers 404 and matches dist/ | ✅ | `{"status":404,"server":"GitHub.com","sameAsBuild":true}` |
| https://deepestrest.com/sitemap.xml answers 200 and matches dist/ | ✅ | `{"status":200,"sameAsBuild":true}` |
| https://deepestrest.com/robots.txt answers 200 and matches dist/ | ✅ | `{"status":200,"sameAsBuild":true}` |
| https://deepestrest.com/404.html answers 200 and matches dist/ | ✅ | `{"status":200,"sameAsBuild":true}` |

## PageSpeed Insights

Lighthouse run on Google's own servers through PageSpeed Insights (pagespeed.web.dev), against the live site, so this machine's load plays no part (`scripts/verify/pagespeed.mjs`). Scores: Performance / Accessibility / Best Practices / SEO. Each row links to Google's report.

| Page | Mobile | Desktop | Report |
|---|---|---|---|
| Home | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 2.3 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.3 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com/5ry5hpeuoj) |
| Mentoring | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.4 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-mentoring/qr2hfgnu4x) |
| About Nick | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 2.3 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.3 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-about/wq8vr7apul) |
| FAQ | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-faq/7whtkcgesj) |
| Book a free session | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.3 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-book/alu5q9ocvs) |
| Contact | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 2.3 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-contact/zqyp2wgu8e) |
| Privacy policy | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-privacy/jnbhblhxod) |
| Cookie notice | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-cookies/19lt1wgg8v) |
| Page not found (404) | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.3 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-404-html/fk1cnkmfnc) |

## Lighthouse

Lighthouse 13.5.0, default mobile settings (emulated phone, slow 4G, 4× slower CPU) and the desktop preset, against http://localhost:4173/. Each page and form factor ran 3 times; the table gives the median run (by Performance) and, after it, the lowest score in any run. Scores: Performance / Accessibility / Best Practices / SEO. Full reports of the median runs are in [lighthouse/](lighthouse/).

| Page | Mobile, median | Mobile, lowest | Desktop, median | Desktop, lowest |
|---|---|---|---|---|
| Home | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Mentoring | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| About Nick | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| FAQ | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Book a free session | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Contact | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Privacy policy | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Cookie notice | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Page not found (404) | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

**Failed attempts, and the re-runs that replaced them.** Nothing in the site changed between an attempt and its re-run. Every attempt is listed, oldest first. Each run is shown as Performance score (total blocking time, main-thread time).

| Page | Form factor | Attempt | Median; lowest | Each run |
|---|---|---|---|---|
| Home | mobile | 1 of 2: failed | 99 / 100 / 100 / 100; 91 / 100 / 100 / 100 | 99 (49 ms, 2,014 ms); 100 (0 ms, 383 ms); 91 (367 ms, 2,351 ms) |
| Home | mobile | 2 of 2: passed | 100 / 100 / 100 / 100; 99 / 100 / 100 / 100 | 99 (45 ms, 2,111 ms); 100 (0 ms, 900 ms); 100 (3 ms, 1,649 ms) |

Audits that did not score full marks in at least one run:

- Home, mobile: performance: first-contentful-paint (0.96)
- Home, mobile: performance: largest-contentful-paint (0.99)
- Home, mobile: performance: speed-index (0.97)
- Home, mobile: performance: first-contentful-paint (0.98)
- Home, mobile: performance: speed-index (0.99)
- Home, desktop: performance: speed-index (0.99)
- Mentoring, desktop: performance: speed-index (0.98)
- About Nick, desktop: performance: speed-index (0.99)
- About Nick, desktop: performance: speed-index (0.98)
- FAQ, mobile: performance: first-contentful-paint (0.99)
- FAQ, mobile: performance: total-blocking-time (0.98)
- FAQ, mobile: performance: speed-index (0.97)
- FAQ, mobile: performance: speed-index (0.99)
- Book a free session, mobile: performance: first-contentful-paint (0.99)
- Book a free session, desktop: performance: speed-index (0.99)
- Contact, mobile: performance: first-contentful-paint (0.99)
- Privacy policy, mobile: performance: first-contentful-paint (0.98)
- Privacy policy, mobile: performance: speed-index (0.99)
- Privacy policy, mobile: performance: first-contentful-paint (0.97)
- Privacy policy, mobile: performance: first-contentful-paint (0.96)
- Privacy policy, mobile: performance: largest-contentful-paint (0.99)
- Privacy policy, desktop: performance: speed-index (0.98)
- Cookie notice, mobile: performance: first-contentful-paint (0.98)
- Cookie notice, mobile: performance: first-contentful-paint (0.99)
- Cookie notice, desktop: performance: speed-index (0.99)

The 404 page was audited at `404.html`, the same file served with status 200: Lighthouse will not audit a page served with status 404.

**Supplementary: the booking page for a returning visitor who has already agreed to load Calendly**, so the calendar loads at once. This is not part of the pass mark: it shows what Calendly itself costs, and why it loads only when asked.

| Form factor | Median | Lowest | Audits below full marks |
|---|---|---|---|
| mobile | 99 / 100 / 77 / 100 | 94 / 100 / 77 / 100 | performance: first-contentful-paint (0.99); performance: largest-contentful-paint (0.99); best-practices: third-party-cookies (0); best-practices: inspector-issues (0); performance: first-contentful-paint (0.94); performance: largest-contentful-paint (0.98); performance: total-blocking-time (0.93); performance: speed-index (0.76); performance: total-blocking-time (0.99) |
| desktop | 100 / 100 / 77 / 100 | 96 / 100 / 77 / 100 | best-practices: third-party-cookies (0); best-practices: inspector-issues (0); performance: first-contentful-paint (0.9); performance: largest-contentful-paint (0.96); performance: speed-index (0.81) |

## Layout at every width

Each page was loaded fresh at each width from http://localhost:4173/ (360, 390 and 768 px emulated as touch phones and tablets; 1,024 px and up as desktops). After the page settled, the check measured: horizontal scroll (document width minus window width); layout shift, by adding up every `layout-shift` entry from the start of loading; every element reaching past the screen edge; every line of text clipped by the screen or by a box that hides overflow; and every pair of text lines covering each other. The FAQ was checked again with every answer open.

| Page | 360 | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|
| Home | ✅ [png](screenshots/home/360.png) | ✅ [png](screenshots/home/390.png) | ✅ [png](screenshots/home/768.png) | ✅ [png](screenshots/home/1024.png) | ✅ [png](screenshots/home/1280.png) | ✅ [png](screenshots/home/1440.png) | ✅ [png](screenshots/home/1920.png) |
| Mentoring | ✅ [png](screenshots/mentoring/360.png) | ✅ [png](screenshots/mentoring/390.png) | ✅ [png](screenshots/mentoring/768.png) | ✅ [png](screenshots/mentoring/1024.png) | ✅ [png](screenshots/mentoring/1280.png) | ✅ [png](screenshots/mentoring/1440.png) | ✅ [png](screenshots/mentoring/1920.png) |
| About Nick | ✅ [png](screenshots/about/360.png) | ✅ [png](screenshots/about/390.png) | ✅ [png](screenshots/about/768.png) | ✅ [png](screenshots/about/1024.png) | ✅ [png](screenshots/about/1280.png) | ✅ [png](screenshots/about/1440.png) | ✅ [png](screenshots/about/1920.png) |
| FAQ | ✅ [png](screenshots/faq/360.png) | ✅ [png](screenshots/faq/390.png) | ✅ [png](screenshots/faq/768.png) | ✅ [png](screenshots/faq/1024.png) | ✅ [png](screenshots/faq/1280.png) | ✅ [png](screenshots/faq/1440.png) | ✅ [png](screenshots/faq/1920.png) |
| Book a free session | ✅ [png](screenshots/book/360.png) | ✅ [png](screenshots/book/390.png) | ✅ [png](screenshots/book/768.png) | ✅ [png](screenshots/book/1024.png) | ✅ [png](screenshots/book/1280.png) | ✅ [png](screenshots/book/1440.png) | ✅ [png](screenshots/book/1920.png) |
| Contact | ✅ [png](screenshots/contact/360.png) | ✅ [png](screenshots/contact/390.png) | ✅ [png](screenshots/contact/768.png) | ✅ [png](screenshots/contact/1024.png) | ✅ [png](screenshots/contact/1280.png) | ✅ [png](screenshots/contact/1440.png) | ✅ [png](screenshots/contact/1920.png) |
| Privacy policy | ✅ [png](screenshots/privacy/360.png) | ✅ [png](screenshots/privacy/390.png) | ✅ [png](screenshots/privacy/768.png) | ✅ [png](screenshots/privacy/1024.png) | ✅ [png](screenshots/privacy/1280.png) | ✅ [png](screenshots/privacy/1440.png) | ✅ [png](screenshots/privacy/1920.png) |
| Cookie notice | ✅ [png](screenshots/cookies/360.png) | ✅ [png](screenshots/cookies/390.png) | ✅ [png](screenshots/cookies/768.png) | ✅ [png](screenshots/cookies/1024.png) | ✅ [png](screenshots/cookies/1280.png) | ✅ [png](screenshots/cookies/1440.png) | ✅ [png](screenshots/cookies/1920.png) |
| Page not found (404) | ✅ [png](screenshots/404/360.png) | ✅ [png](screenshots/404/390.png) | ✅ [png](screenshots/404/768.png) | ✅ [png](screenshots/404/1024.png) | ✅ [png](screenshots/404/1280.png) | ✅ [png](screenshots/404/1440.png) | ✅ [png](screenshots/404/1920.png) |

Every cell links to its full-page screenshot. The FAQ also has screenshots with every answer open (`screenshots/faq/<width>-answers-open.png`). Headings used the site's own serif font in 63 of 63 loads. Console errors: 0.

**The booking frame before the visitor chooses to load Calendly.** Until then the frame is only as tall as its message, so no empty panel shows. The check measured, in each fresh load of the booking page: the frame's height; the height its icon, heading, explanation, button and links cover; the blank remainder (its padding and the space between those lines); and the tallest empty band, at the top, at the bottom or between two of them, which must be no more than the limit.

| Width | Frame height | Covered | Blank | Tallest empty band (top; bottom) | Pass |
|---|---|---|---|---|---|
| 360 | 539 px | 394 px | **146 px** | 41 px (41; 41) | ✅ |
| 390 | 488 px | 342 px | **146 px** | 41 px (41; 41) | ✅ |
| 768 | 450 px | 272 px | **178 px** | 56 px (56; 56) | ✅ |
| 1024 | 507 px | 307 px | **201 px** | 66 px (66; 66) | ✅ |
| 1280 | 521 px | 307 px | **215 px** | 73 px (73; 73) | ✅ |
| 1440 | 521 px | 307 px | **215 px** | 73 px (73; 73) | ✅ |
| 1920 | 521 px | 307 px | **215 px** | 73 px (73; 73) | ✅ |

## Calendly

Tested with Puppeteer against http://localhost:4173/, with the booking link https://calendly.com/nicholas-finnemore/free-diagnostic. Calendly loads only after the visitor agrees, so each test first checks that nothing came from Calendly before that choice. The booking flow was followed to Calendly's details form and never submitted, so nothing was booked in Nick's calendar. On phone and tablet widths the test taps, as people do: Calendly ignores mouse clicks on touch screens. The details form asks for: full_name, email, question_0, g-recaptcha-response, ot-group-id-C0002, ot-group-id-C0003, ot-group-id-C0004, vendor-search-handler, checkbox, checkbox, checkbox, checkbox.

**Inline calendar on the booking page**

| Width | Calendly requests before consent | Other outside requests before consent | Cookies before consent | Calendar loaded | Booking flow opened | “Book another session”: hidden before, shown after, booked message, fresh calendar | Loads by itself when the choice is remembered | Layout shift then | Pass |
|---|---|---|---|---|---|---|---|---|---|
| 360 | 0 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 3:00pm → next → details form | ✅ ✅ ✅ ✅ | ✅ | 0.0000 | ✅ |
| 390 | 0 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 3:00pm → next → details form | ✅ ✅ ✅ ✅ | ✅ | 0.0000 | ✅ |
| 768 | 0 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 3:00pm → next → details form | ✅ ✅ ✅ ✅ | ✅ | 0.0000 | ✅ |
| 1024 | 0 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 3:00pm → next → details form | ✅ ✅ ✅ ✅ | ✅ | 0.0000 | ✅ |
| 1280 | 0 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 3:00pm → next → details form | ✅ ✅ ✅ ✅ | ✅ | 0.0000 | ✅ |
| 1440 | 0 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 3:00pm → next → details form | ✅ ✅ ✅ ✅ | ✅ | 0.0000 | ✅ |
| 1920 | 0 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 3:00pm → next → details form | ✅ ✅ ✅ ✅ | ✅ | 0.0000 | ✅ |

Screenshots of the details form reached at each width: [calendly/](calendly/) (`inline-<width>.png`). Content Security Policy violations recorded during these tests: 0.

Since tests never book, the message after a booking was tested by sending the page the message Calendly sends when a session is booked (`calendly.event_scheduled`, from `https://calendly.com`); “Book another session” was then pressed and had to bring back a fresh calendar.

**Popup from the header button**: on every page, the button first asks before loading Calendly, then opens Calendly's popup with the calendar drawn, which then closes; after a reload, with the choice remembered, the popup opens straight away.

| Page | 360 | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mentoring | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| About Nick | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FAQ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book a free session | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Privacy policy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cookie notice | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Page not found (404) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Without JavaScript: ✅ the header button is a plain link to the booking page, which explains that the calendar needs JavaScript and links to the booking page on Calendly's website.

**What the booking calendar loads.** Measured at 1,440 px on 2026-10-23T07:42:06.782Z, after loading the calendar and opening its details form: every outside host the browser contacted (from every frame, including Calendly's), every cookie, and every local and session storage item in every frame. Once with Calendly's cookie banner declined, and once, in a fresh browser context with nothing stored, accepted. The privacy policy and cookie notice are built from these measurements (`src/lib/third-parties.mjs`), and the facts check compares them, below.

| Banner answer | Outside hosts | Services | Cookies and stored items |
|---|---|---|---|
| Declined | 12: accounts.google.com, assets.calendly.com, calendly.com, cdn.cookielaw.org, dfp.calendly.com, geolocation.onetrust.com, js.stripe.com, m.stripe.com, m.stripe.network, notifier-configs.airbrake.io, www.gstatic.com, www.recaptcha.net | 6: Calendly, LLC, Cloudflare, Inc., OneTrust, LLC, Stripe, Google LLC, Airbrake | 11: `__cf_bm` (cookie, calendly.com), `_cfuvid` (cookie, calendly.com), `OptanonAlertBoxClosed` (cookie, calendly.com), `OptanonConsent` (cookie, calendly.com), `m` (cookie, m.stripe.com), `_cache` (local storage, calendly.com), `_ab` (session storage, m.stripe.network), `_mf` (session storage, m.stripe.network), `1` (session storage, m.stripe.network), `id` (session storage, m.stripe.network), `rc::a` (local storage, www.recaptcha.net) |
| Accepted | 20: accounts.google.com, api.sprig.com, assets.calendly.com, calendly.com, cdn.cookielaw.org, cdn.segment.io, cdn.sprig.com, connect.facebook.net, dfp.calendly.com, geolocation.onetrust.com, js.appboycdn.com, js.stripe.com, m.stripe.com, m.stripe.network, notifier-configs.airbrake.io, survey.survicate.com, www.google-analytics.com, www.googletagmanager.com, www.gstatic.com, www.recaptcha.net | 12: Calendly, LLC, Cloudflare, Inc., OneTrust, LLC, Stripe, Google LLC, Airbrake, Google Analytics and Google Tag Manager (Google LLC), Meta Platforms (the Meta Pixel), Segment (Twilio Inc.), Braze, Inc., Sprig, Survicate | 14: `__cf_bm` (cookie, calendly.com), `_cfuvid` (cookie, calendly.com), `OptanonAlertBoxClosed` (cookie, calendly.com), `OptanonConsent` (cookie, calendly.com), `m` (cookie, m.stripe.com), `_cache` (local storage, calendly.com), `ajs_anonymous_id` (local storage, calendly.com), `sprig.anon.env.vid.map` (local storage, calendly.com), `userleap.ids` (local storage, calendly.com), `_ab` (session storage, m.stripe.network), `_mf` (session storage, m.stripe.network), `1` (session storage, m.stripe.network), `id` (session storage, m.stripe.network), `rc::a` (local storage, www.recaptcha.net) |

Only when accepted: Google Analytics and Google Tag Manager (Google LLC), Meta Platforms (the Meta Pixel), Segment (Twilio Inc.), Braze, Inc., Sprig, Survicate, which stored `ajs_anonymous_id` (local storage, calendly.com), `sprig.anon.env.vid.map` (local storage, calendly.com), `userleap.ids` (local storage, calendly.com). Unidentified hosts or items: 0.

## HTML validation

Nu HTML Checker 26.10.12 (0a70d65), the engine behind validator.w3.org/nu, run locally on every page and the stylesheet in dist/.

| File | Errors | Warnings | Known CSP warnings |
|---|---|---|---|
| 404.html | 0 | 0 | 2 |
| index.html | 0 | 0 | 2 |
| about/index.html | 0 | 0 | 2 |
| book/index.html | 0 | 0 | 2 |
| contact/index.html | 0 | 0 | 2 |
| cookies/index.html | 0 | 0 | 2 |
| faq/index.html | 0 | 0 | 2 |
| mentoring/index.html | 0 | 0 | 2 |
| privacy/index.html | 0 | 0 | 2 |
| assets/css/site.css | 0 | 0 | 0 |

The known warnings are the checker's, not the browser's: checking files, it has no web origin for the page, so it cannot match the Content Security Policy's `'self'` and warns that the site's own stylesheet and script would be blocked. In Chrome the same policy blocked nothing: the Calendly tests record every violation and found none.

## Links

336 references on 9 pages (61 distinct), fetched from http://localhost:4173/: every link, stylesheet, script, icon and `#section` target, and each `#section` was found on its page. Broken: **0**.

External sites:

- ✅ 200 https://calendly.com/nicholas-finnemore/free-diagnostic
- ✅ 200 https://privacycenter.instagram.com/policy/
- ✅ 200 https://calendly.com/legal/privacy-notice
- ✅ 200 https://policies.google.com/privacy?hl=en-GB
- ✅ 200 https://www.cloudflare.com/privacypolicy/
- ✅ 200 https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- ✅ 200 https://www.onetrust.com/privacy-notice/
- ✅ 200 https://stripe.com/privacy
- ✅ 200 https://www.airbrake.io/privacy
- ✅ 200 https://ico.org.uk/make-a-complaint/

Telephone links: `tel:999`, `tel:111`, `tel:116123`, `tel:03031231113`. Email links: `mailto:hello@deepestrest.com`.

## Facts, claims, protected titles and clinical claims

**Placeholders: 0.** Facts that are not known were left out of the pages rather than shown as placeholders; [PLACEHOLDERS.md](../PLACEHOLDERS.md) lists them under "Left out for want of a fact".

| Page | Unexplained figures or contact details | Protected titles | Clinical claims | Claims beyond his three facts |
|---|---|---|---|---|
| Home | 0 | 0 | 0 | 0 |
| Mentoring | 0 | 0 | 0 | 0 |
| About Nick | 0 | 0 | 0 | 0 |
| FAQ | 0 | 0 | 0 | 0 |
| Book a free session | 0 | 0 | 0 | 0 |
| Contact | 0 | 0 | 0 | 0 |
| Privacy policy | 0 | 0 | 0 | 0 |
| Cookie notice | 0 | 0 | 0 | 0 |
| Page not found (404) | 0 | 0 | 0 | 0 |

**Protected titles: 0.** Each page's visible text, title, description and sharing tags were searched for: `/psycholog/i`, `/therapist/i`, `/counsel+or/i`, `/\bcounsel+ing\b/i`, `/psychiatr/i`, `/\bHCPC\b|Health and Care Professions Council/i`, `/\bBPS\b|British Psychological Society|\bCPsychol\b|\b[AM]?F?BPsS\b|\bchartered\b/i`, `/\b(dietitian|physiotherapist|paramedic|radiographer|podiatrist|chiropodist|orthoptist|prosthetist|orthotist|biomedical scientist|clinical scientist|hearing aid dispenser|operating department practitioner|social worker|nurse|doctor)\b/i`, `/\bDr\.?\s/`.

**Clinical claims: 0.** The same text was searched for: `/\bclinic(al|ian|s)?\b/i`, `/\bcur(e|es|ed|ing)\b/i`, `/\btreat(s|ed|ing|ment|ments)?\b/i`, `/\bpatients?\b/i`, `/\bdiagnos(e|es|ed|is|ing)\b/i`, `/\bprescri/i`, `/\bdisorder/i`, `/\bsymptom/i`. "Diagnostic" is Nick's own word for the free sessions; the site says plainly that mentoring is not therapy or medical care.

**Invented facts: 0.** The scan looks for money, percentages, email addresses, postcodes, long quotations and any figure at all. Every one left must be one of these, each checked against its source:

- `100%`: Nick's own words, his order of 19 October 2026 (site.config.json, _sources): "a 100% satisfaction rate across 23 clients"
- `23`: Nick's own words, his order of 19 October 2026 (site.config.json, _sources): 23 clients
- `5`: Nick's own words, his order of 19 October 2026 (site.config.json, _sources): five years of mentoring (shown as the figure 5 in the figures panel)
- `999`: UK emergency number
- `111`: NHS 111
- `116 123`: Samaritans, https://www.samaritans.org/how-we-can-help/contact-samaritan/ (free, day or night, 365 days a year)
- `365`: Samaritans page above: "365 days a year"
- `0303 123 1113`: ICO helpline, https://ico.org.uk/make-a-complaint/
- `2018`: Data Protection Act 2018 (UK statute)
- `6(1)(a)`: UK GDPR Article 6(1)(a), consent
- `6(1)(b)`: UK GDPR Article 6(1)(b), contract
- `6(1)(c)`: UK GDPR Article 6(1)(c), legal obligation
- `6(1)(d)`: UK GDPR Article 6(1)(d), vital interests
- `6(1)(f)`: UK GDPR Article 6(1)(f), legitimate interests
- `9(2)(a)`: UK GDPR Article 9(2)(a), explicit consent
- `Article 6`: UK GDPR
- `Article 9`: UK GDPR
- `404`: HTTP status of the error page
- `23 October 2026`: the date the privacy policy was last updated (site.config.json, privacy.lastUpdated)
- `© 2026`: year of the build
- `Article 6(1)(a)`: UK GDPR Article 6(1)(a), consent
- `Article 6(1)(b)`: UK GDPR Article 6(1)(b), contract
- `Article 6(1)(c)`: UK GDPR Article 6(1)(c), legal obligation
- `Article 6(1)(d)`: UK GDPR Article 6(1)(d), vital interests
- `Article 6(1)(f)`: UK GDPR Article 6(1)(f), legitimate interests
- `Article 9(2)(a)`: UK GDPR Article 9(2)(a), explicit consent
- `30 minutes`: how long a cookie on the cookie notice lasts, from the time it had left when scripts/verify/calendly.mjs measured it (src/data/calendly-third-parties.json)
- `1 year`: how long a cookie on the cookie notice lasts, from the time it had left when scripts/verify/calendly.mjs measured it (src/data/calendly-third-parties.json)
- `13 months`: how long a cookie on the cookie notice lasts, from the time it had left when scripts/verify/calendly.mjs measured it (src/data/calendly-third-parties.json)
- `23 October 2026`: date scripts/verify/calendly.mjs measured what the booking calendar loads (src/data/calendly-third-parties.json)
- `hello@deepestrest.com`: site.config.json, practice.email (Cloudflare Email Routing to Nick)

Long quotations, which the scan would otherwise take for testimonials, each from its source and found again in this run:

- ✅ “to improve and personalize your experience, to understand website interactions (including clicks, cursor movement and screen recordings), and for marketing”: Calendly’s cookie banner, inside the calendar

Statements in the text, and where each was checked:

- Nick's three facts (five years mentoring students and young adults; a 100% satisfaction rate across 23 clients; the first five sessions free, as a diagnostic): his order of 19 October 2026, recorded in site.config.json under _sources. His order also said that being young has played to his advantage, because he has seen many people go through tech addiction and been able to get them out of it; the site leaves those words off, as the brief limits it to his three facts, and PLACEHOLDERS.md asks him about them
- His full name, Nicholas Finnemore, used as data controller in the privacy policy: the name on his Google account
- The booking event, its optional question ("Please share anything that will help prepare for our meeting."), guests allowed, Google Calendar connection and Google Meet location: the Calendly event "Free diagnostic session" as configured on calendly.com/nicholas-finnemore/free-diagnostic
- Calendly confirmation emails carry links to cancel and reschedule: Calendly's standard invitee emails
- hello@deepestrest.com forwards to Nick's Gmail through Cloudflare Email Routing: the routing rule on his Cloudflare account
- Samaritans, 116 123, free from landlines and mobiles, day or night, 365 days a year: https://www.samaritans.org/how-we-can-help/contact-samaritan/
- ICO complaints and helpline 0303 123 1113: https://ico.org.uk/make-a-complaint/
- Calendly, LLC, Google LLC, Cloudflare, Inc. and GitHub, Inc. each state that they comply with the UK Extension to the EU-U.S. Data Privacy Framework: https://calendly.com/legal/privacy-notice, https://policies.google.com/privacy/frameworks, https://www.cloudflare.com/privacypolicy/, https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- UK law treats personal data sent to US organisations certified under the UK Extension as adequately protected: Data Protection (Adequacy) (United States of America) Regulations 2023, https://www.legislation.gov.uk/uksi/2023/1028/made
- GitHub Pages logs every visitor's IP address for security purposes: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Health information is special category data; the rights listed; a reply within one month, extendable by two further months, usually free: UK GDPR Articles 9, 12 and 15 to 21
- Calendly books one time per booking, so the five free sessions are booked one at a time: Calendly staff, 22 May 2024, "there is no way to book multiple time slots in one go via the Calendly booking flow", https://community.calendly.com/how-do-i-40/book-multiple-time-slots-at-once-1542
- The booking page learns that a session was booked from the message Calendly sends it, calendly.event_scheduled: https://developer.calendly.com/api-docs/overview/embedding/notifying-the-parent-window
- The purpose of Calendly’s optional cookies, quoted in the privacy policy: Calendly’s own cookie banner inside the calendar, as the test saw it
- What Calendly, LLC does and collects, in the privacy policy: Calendly Privacy Notice, effective 3 July 2026, "log data": https://calendly.com/legal/privacy-notice
- What Cloudflare, Inc. does and collects, in the privacy policy: Cloudflare cookies: https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/
- What OneTrust, LLC does and collects, in the privacy policy: Requests to geolocation.onetrust.com/cookieconsentpub/v1/geo/location seen in the test; OneTrust Cookies: https://my.onetrust.com/s/article/UUID-2dc719a8-4be5-8d16-1dc8-c7b4147b88e0
- What Stripe does and collects, in the privacy policy: Stripe, Advanced fraud detection: https://docs.stripe.com/disputes/prevention/advanced-fraud-detection
- What Google LLC does and collects, in the privacy policy: Google Cloud Service Specific Terms, reCAPTCHA: https://cloud.google.com/terms/service-terms; Sign in with Google client library (accounts.google.com/gsi/client): https://developers.google.com/identity/gsi/web/guides/client-library
- What Airbrake does and collects, in the privacy policy: Request to notifier-configs.airbrake.io (notifier airbrake-js/browser) seen in the test

There are no testimonials. Wording beyond Nick's three facts is listed for him to check at the end of PLACEHOLDERS.md.

**Claims beyond Nick's three facts: 0 left.** Every page was read against his three facts, and each claim found beyond them was removed or rewritten. The facts check searches every page's text, title, description and sharing tags for each kind of claim, with the pattern shown, so none can return:

| Claim | Where it was, and its words | Fix | Pattern | Left |
|---|---|---|---|---|
| That Nick got clients out of tech addiction | Home: “For five years he has mentored students and young adults through tech addiction, and helped them out of it.”<br>Home: “he has seen many people go through tech addiction, and has been able to help them get out of it.”<br>About Nick: “For five years, Nick has helped students and young adults get out of tech addiction.”<br>About Nick: “It has meant seeing many people go through tech addiction, and being able to help them get out of it.”<br>Mentoring: “has seen many people go through tech addiction and come out of it.”<br>Mentoring: “someone on your side, who has helped others through the same thing.” | Each says only that he has mentored students and young adults for five years. | `/\bout of (it\|tech)\|\b(has\|have\|had\|been able to) help(ed)?\b\|\bhelp(ed)? (them\|others\|students\|young)\b\|\bseen many people\b\|\bthrough the same thing\b/i` | ✅ 0 |
| That his five years of mentoring were for tech addiction | Home: “he has mentored students and young adults through tech addiction”<br>About Nick: “Nick Finnemore has mentored students and young adults through tech addiction for five years (description)” | “has mentored students and young adults for five years”; DeepRest is described separately as his tech-addiction mentoring practice. | `/\bthrough tech addiction\b/i` | ✅ 0 |
| That he has mentored 23 clients in all | Home: “Clients mentored: 23 (figures panel)”<br>About Nick: “Clients mentored: 23 (figures panel)”<br>Home: “A 100% satisfaction rate across the 23 clients Nick has mentored.”<br>About Nick: “Across the 23 clients he has mentored, Nick’s satisfaction rate is 100%.” | The figure is given only as he gave it: “Satisfaction rate across 23 clients: 100%”. | `/\bclients mentored\b\|\bclients (Nick\|he) (has )?mentored\b/i` | ✅ 0 |
| That he is young, and that being young is an advantage | Home: “Young, and that’s the advantage (heading)”<br>Home: “He is young, and that has played to his advantage”<br>About Nick: “He is young, and that has played to his advantage.” | Heading “Five years of mentoring”, over the three facts. | `/\bhe is young\b\|\byoung, and\b\|\badvantage\b/i` | ✅ 0 |
| Who the practice is for | Home: “Mentoring for students and young adults who want to break free from tech addiction (description)”<br>Mentoring: “One-to-one mentoring for students and young adults who want to break free from tech addiction (description and lead)”<br>Mentoring: “Who it’s for: DeepRest is for students and young adults who feel that their phone, games or time online have taken over more of their life than they would like”<br>About Nick: “set up to offer that mentoring to students and young adults who feel that tech has too much of a hold on them.”<br>FAQ: “Who is DeepRest for? Students and young adults who feel that tech has too much of a hold on them”<br>FAQ: “Answers to common questions … who it is for (description)”<br>footer: “Tech-addiction mentoring for students and young adults, with Nick Finnemore.” | Removed. The pages say whom he has mentored (students and young adults, for five years), not whom DeepRest is for; the footer reads “Tech-addiction mentoring with Nick Finnemore.” | `/\bbreak free\b\|\btaken over\b\|\bhold on (them\|you)\b\|\bwho (it is\|it’s\|it's\|DeepRest is) for\b\|\bwho is DeepRest for\b\|\bmentoring for students\b/i` | ✅ 0 |
| How sessions are held, and what mentoring is like | Home: “Mentoring is practical, one-to-one support from someone on your side.”<br>Mentoring: “Mentoring is practical, one-to-one support from someone on your side”<br>Mentoring: “One-to-one mentoring for students and young adults (lead)”<br>FAQ: “No. Mentoring is practical, one-to-one support.” | “Mentoring, not therapy”: mentoring is not therapy or medical care. How sessions are held is listed under _dropped in site.config.json. | `/\bone-to-one\b\|\bon your side\b\|\bpractical(,)? (one-to-one )?support\b/i` | ✅ 0 |
| What the five free diagnostic sessions cover | Home: “With Nick, you look at how tech fits into your days, what it is costing you and what you would like to change, and you find out whether mentoring is right for you.”<br>Home: “Over your first five sessions, which are free, you and Nick build a clear picture of your tech habits and what you want to change.”<br>Mentoring: “a chance to understand your tech habits and what you want to change, and to see whether mentoring with Nick suits you.”<br>Mentoring: “Over your first five sessions, you and Nick look at how tech fits into your days, what it is costing you and what you would like to change.”<br>FAQ: “so that you and Nick can understand your situation and decide whether mentoring is right for you.” | “Your first five sessions are free, as a diagnostic. There is nothing to pay for them.” What the diagnostic covers is listed under _dropped. | `/\bhow tech fits\b\|\bwhat it is costing you\b\|\bclear picture\b\|\bunderstand your (tech habits\|situation)\b\|\bfind out whether\b\|\bwhether mentoring with Nick suits you\b\|\bwhat you (want\|would like) to change\b/i` | ✅ 0 |
| What happens after the five free sessions | Home: “After the five free sessions, you decide together whether to carry on. There is no obligation to continue.”<br>Mentoring: “There is nothing to pay for them, and no obligation to continue afterwards.”<br>Mentoring: “When the five free sessions are over, you decide together whether to carry on. It is your choice.”<br>FAQ: “What happens after the five free sessions? You and Nick decide together whether to carry on. There is no obligation to continue.” | Removed; listed under _dropped until Nick says what happens after the five free sessions. | `/\bdecide together\b\|\bno obligation\b\|\bit is your choice\b\|\bafter the five free sessions\b\|\bcarry on\b/i` | ✅ 0 |
| His professional background | About Nick: “He is not a medical or mental health professional”<br>FAQ: “Nick is not a medical or mental health professional.” | “Nick is a mentor, and mentoring is not therapy or medical care.” His background is not one of his facts. | `/\bmental health professional\b/i` | ✅ 0 |
| That no Meta code can reach a visitor through the site | Privacy policy: “The website has no Meta code, such as Meta’s Pixel, and sends Meta nothing about your visit or your booking.”<br>Cookie notice: “The website has no Meta code, such as Meta’s Pixel, so Meta sets no cookies through it.” | The site’s own pages have no Meta code; Calendly’s page loads Meta’s code only if the visitor accepts Calendly’s optional cookies, as both pages now say. | `/\bMeta sets no cookies\b\|\bThe website has no Meta code\b/i` | ✅ 0 |
| That the booking calendar’s cookies all come from Calendly | Cookie notice: “Cookies are set only if you choose to load the booking calendar, and they come from Calendly.”<br>Cookie notice: “Once it is loaded, your browser connects to Calendly, which sets its own cookies.”<br>Privacy policy: “If you choose to load the booking calendar, Calendly collects information about your device and sets cookies” | Both pages name every service the calendar loads, as measured: Calendly, Cloudflare, OneTrust, Stripe, Google reCAPTCHA and Airbrake, and those that load only if Calendly’s optional cookies are accepted. | `/\bthey come from Calendly\.\|\bconnects to Calendly, which sets its own cookies\b\|\bCalendly collects information about your device and sets cookies\b/i` | ✅ 0 |

**Outside services and stored items: named on the pages against measured.** The privacy policy's services and the cookie notice's rows, read from the built pages, against the Calendly check's measurement of 2026-10-23T07:42:06.782Z (above). ✅

| What | When | Measured | Named | Missing from the page | On the page but not measured |
|---|---|---|---|---|---|
| Services, privacy policy | whatever the banner answer | 6 | 6 | 0 | 0 |
| Services, privacy policy | only if accepted | 6 | 6 | 0 | 0 |
| Cookies and stored items, cookie notice | whatever the banner answer | 11 | 11 | 0 | 0 |
| Cookies and stored items, cookie notice | only if accepted | 3 | 3 | 0 | 0 |

## PDFs for review

Made with Chrome's print-to-PDF (Puppeteer `page.pdf`) at a desktop width of 1,440 px, each page as one continuous sheet, with the screen styles so the PDF matches the site.

- All pages in one file: [verification/pdf/DeepRest-all-pages.pdf](pdf/DeepRest-all-pages.pdf)
- [verification/pdf/404.pdf](pdf/404.pdf)
- [verification/pdf/about.pdf](pdf/about.pdf)
- [verification/pdf/book-calendar-loaded.pdf](pdf/book-calendar-loaded.pdf)
- [verification/pdf/book.pdf](pdf/book.pdf)
- [verification/pdf/contact.pdf](pdf/contact.pdf)
- [verification/pdf/cookies.pdf](pdf/cookies.pdf)
- [verification/pdf/faq.pdf](pdf/faq.pdf)
- [verification/pdf/home.pdf](pdf/home.pdf)
- [verification/pdf/mentoring.pdf](pdf/mentoring.pdf)
- [verification/pdf/privacy.pdf](pdf/privacy.pdf)

## Approaches that failed, and what replaced them

- Calendly sign-up with "Continue with Google" on calendly.com/signup returned to the log-in page with "No account exists" for his Google address, twice. Typing the address into the sign-up form first led to a page offering "Sign up with Google" with a terms box; that created the account.
- Calendly's Google sign-in first offered calendar access as an optional box, which was left unticked; sign-up then required the full Google Calendar permission, with no option. The alternative, signing up with a password, was not used, because agents do not create passwords. The permission was granted, as signing up with Google requires.
- Calendly's onboarding switched its Notetaker (meeting recording and transcripts) on by default. It was switched off before finishing, and the account shows Notetaker as not in use.
- Clicking by screen position in Nick's Chrome missed its targets: that window runs at 125% scaling, so screenshot pixels are 1.25 times page pixels. Clicks now go to elements, or to positions divided by 1.25.
- The facts scan read the "0%" inside "100%" as a separate percentage, matched "Article 6" before "6(1)(b)" and so left "(1)(b)" unexplained, and flagged the legal sense of "treat" ("UK law treats personal data...") as a clinical claim. The patterns were fixed for the first two; for the third the scan stayed strict and the privacy policy says "regards" and "handle" instead.
- Finding Calendly's demo page for the earlier build (every calendly.com address answers 200, as a single-page app) took several tries; the real booking link has now replaced it.
- The first look inside the Calendly iframe came after a fixed 8 seconds and found it empty: Calendly takes about 6 seconds to draw. The tests wait for the calendar's day buttons instead.
- A 760 px booking frame made Calendly scroll inside the frame at tablet widths. The frame is 1,130 px tall below 68rem, matching Calendly's stacked layout, and 760 px above.
- Mouse clicks inside Calendly did nothing on touch-emulated widths, because Calendly listens for taps there. The test taps on phones and tablets, and taps a time again if one is lost while the list slides in.
- The layout check reported collapsed FAQ answers as overlapping, because Chrome keeps closed `<details>` content in the layout. It skips text that is not drawn, and checks the FAQ again with every answer open.
- Validating over HTTP, to avoid the checker's CSP warnings: the Nu checker refuses `localhost` ("Forbidden host"). Files are checked directly; with --live, copies downloaded from the live site.
- Printing the booking page with the calendar loaded gave a blank frame: print-to-PDF does not draw a cross-origin iframe in its own process. That PDF is printed by a Chrome started without site isolation.
- Lighthouse on this machine scored About on mobile below 95 in one of three runs, three times over (lowest 93, then 94, then 84), and FAQ on desktop once (92; its re-run scored 100 in every run). The slow runs had 1.4 to 6 times the main-thread time of the fast runs on the same page (2,728 ms against about 450 ms at worst), while this machine was also running other services, including two Colab runners, at about 40% CPU. A filmstrip of one slow run showed a blank screen until 4.0 s although the page had finished loading at 0.34 s, so Chrome was not getting to paint, not waiting for the site. Re-running stopped there; PageSpeed Insights, which runs Lighthouse on Google's servers, was used as the second opinion below.
- PageSpeed Insights' keyless API answered 429 (its shared daily quota used up), and its web page, opened signed out in a headless Chrome, answered "Unable to resolve" for the same reason. Run from a tab of its own in Nick's Chrome, signed in to Google, it worked; one page's mobile result timed out once and was re-run on its own.
- Two scripted edits (a Python find-and-replace) silently did nothing because of an escaping slip: the cookie comparison in the Calendly check, and the wrapping of result lists in the shared result writer. Both were found when result files lacked the expected fields (the layout rows of the report read "not run"), redone by hand, and the layout check re-run live. A third scripted edit broke a pattern in the PageSpeed check, which the syntax check caught at once. Every scripted edit is now checked with a search afterwards.
- On 22 October the live Calendly check failed once, inline at 768 px: Calendly lost the chosen time twice and showed no Next button. The same check alone passed straight after, and the whole live Calendly check, re-run, passed 71/71; the results above are from that re-run.
- On 22 October Lighthouse on this machine, against the live site, scored Home on mobile below 95 in one run of three, four times over (lowest 91, 86, 92 and 94, with medians of 99, 98, 94 and 98), while other sessions' Chrome processes used about two CPU cores. Re-running stopped there; PageSpeed Insights scored every live page 100 in all four categories, mobile and desktop.
- The cookie check before 23 October recorded only cookies, only until the calendar appeared, and only with Calendly's banner unanswered. It found 4 (Cloudflare's two, OneTrust's and Stripe's `m`), so the cookie notice listed those and the site said Meta set no cookies through it. Measuring every host, cookie and stored item in every frame, up to the details form, with the banner declined and then accepted, found Google reCAPTCHA, Airbrake and Stripe's storage whatever the answer, and, only if accepted, Google Analytics, Meta's Pixel, Segment, Braze, Sprig and Survicate. The privacy policy and cookie notice are now built from that measurement.
- Python edits run through the shell lose backslashes: a `\n` in a JavaScript string became a real line break and broke the privacy page's code, and escaped quotes in this report lost their backslashes. The syntax check caught the first and reading the line back the second; both were fixed in the editor, and edits with backslashes are now made there.
- Three source pages for the service descriptions answered 404 (calendly.com/legal/cookie-notice, docs.stripe.com/privacy-and-cookies and www.airbrake.io/privacy-policy); the descriptions rest on the pages listed under the facts instead.
- The first pattern for the retired claim that Nick helped clients out of tech addiction also matched the privacy policy's "adverts help people find us". It was narrowed to the forms the site had used, and checked against the old live text, where it still finds every one.

## Limits of these checks

- Only Chrome was used (Chrome for Testing, headless), with phones and tablets emulated. Safari, Firefox and real devices were not tested.
- Calendly is a third party: its layout, cookie list and cookie banner can change. The banner appeared from this machine's location, and may differ elsewhere.
- What Calendly's page loads was measured from this machine in the UK, in headless Chrome, up to the details form. What it loads after a booking is submitted, in other countries or in other browsers was not measured.
- The message shown after a booking was tested by sending the page the message Calendly sends, not by booking.
- No booking was submitted, so no session was booked in Nick's calendar and Calendly's confirmation step and emails were not exercised.
- No email was sent to hello@deepestrest.com, since nothing is sent outside this machine without Nick's yes: the routing rule and DNS records were checked, delivery was not.
- Lighthouse scores vary from run to run and from machine to machine; the table gives the lowest score of every run as well as the median.
- The privacy policy and cookie notice were drafted for UK GDPR and PECR from the sources above. They have not been reviewed by a lawyer, and Nick, as data controller, should check them against how he handles bookings and emails (PLACEHOLDERS.md lists the wording to check).

