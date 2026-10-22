# DeepRest website: verification report

Written by `scripts/verify/report.mjs` (the last step of `npm run verify`) on 2026-10-22 18:44 UTC, from the JSON results each check left in this folder.
The site was tested as built in `dist/`, served locally the way GitHub Pages serves it (`scripts/serve.mjs`, at http://localhost:4173/).

## Summary

| Check | Target | Result |
|---|---|---|
| Hosting: DNS, HTTPS, redirects, every page live and identical to the build | all pass | ✅ 22/22 |
| Lighthouse, mobile and desktop, 9 pages (local) | 95+ in Performance, Accessibility, Best Practices and SEO | ✅ 18/18 pass in every run; lowest score in any of 3 runs: **95**; 4 re-run after 7 failed attempts, shown below |
| PageSpeed Insights (Lighthouse on Google's servers), mobile and desktop, 9 pages (live) | 95+ in all four categories | ✅ 9/9 pages; lowest score: **100** |
| Horizontal scroll, 7 widths × 9 pages (local) | 0 | ✅ largest: **0 px** over 63 page-widths |
| Layout shift during load | under 0.1 | ✅ largest: **0.0000**; with the Calendly calendar auto-loading: 0.0000 |
| Layout faults: text cut off or overlapping, elements past the screen edge | 0 | ✅ **0**: 0 cut, 0 overlapping, 0 past the edge |
| Calendly inline calendar, after consent: loads and opens its booking flow (local) | every width | ✅ 7/7 widths; 0 Calendly requests and 0 cookies before consent: ✅ |
| Calendly popup from the header button, after consent | every page, every width | ✅ 63/63 page-widths |
| HTML validator (W3C Nu HTML Checker, local) | 0 errors | ✅ **0 errors** in 10 files; 0 other warnings; 18 known CSP warnings, explained below |
| Broken links (local) | 0 | ✅ **0** broken of 320 references (55 distinct) |
| Placeholders | 0 | ✅ **0** |
| `npm run build:strict` | passes | ✅ builds 9 pages, none showing a placeholder, with the booking link https://calendly.com/nicholas-finnemore/free-diagnostic |
| Protected titles used for Nick (psychologist, therapist, counsellor, HCPC and BPS titles) | 0 | ✅ **0** on any page, in its text, title, description or sharing tags |
| Clinical or medical claims | 0 | ✅ **0** |
| Invented facts | 0 | ✅ **0** unexplained figures or contact details |
| Home page: headline figures and the free-diagnostic offer | shown | ✅ 100% satisfaction across 23 clients; five years; "Your first five sessions are free, as a diagnostic" |

## Hosting

Checked from this machine against https://deepestrest.com/, with DNS asked of 1.1.1.1 and 8.8.8.8.

| Check | Result | Detail |
|---|---|---|
| deepestrest.com A records are GitHub Pages' | ✅ | `["185.199.108.153","185.199.110.153","185.199.109.153","185.199.111.153"]` |
| deepestrest.com AAAA records are GitHub Pages' | ✅ | `["2606:50c0:8001::153","2606:50c0:8002::153","2606:50c0:8000::153","2606:50c0:8003::153"]` |
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
| Home | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 2.3 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.3 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com/wkdwo260e5) |
| How mentoring works | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-mentoring/3rpcuqk0ka) |
| About Nick | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.3 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-about/ina9k6nwvz) |
| FAQ | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.3 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-faq/dx2bx9nh16) |
| Book a free session | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-book/m5hrhrwx20) |
| Contact | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-contact/2shbokcsx6) |
| Privacy policy | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.3 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-privacy/0vsa9n154v) |
| Cookie notice | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-cookies/q8cg3ck3lk) |
| Page not found (404) | 100 / 100 / 100 / 100 (LCP 1.1 s, SI 0.8 s) | 100 / 100 / 100 / 100 (LCP 0.3 s, SI 0.2 s) | [pagespeed.web.dev](https://pagespeed.web.dev/analysis/https-deepestrest-com-404-html/c1vq5iteeu) |

## Lighthouse

Lighthouse 13.5.0, default mobile settings (emulated phone, slow 4G, 4× slower CPU) and the desktop preset, against http://localhost:4173/. Each page and form factor ran 3 times; the table gives the median run (by Performance) and, after it, the lowest score in any run. Scores: Performance / Accessibility / Best Practices / SEO. Full reports of the median runs are in [lighthouse/](lighthouse/).

| Page | Mobile, median | Mobile, lowest | Desktop, median | Desktop, lowest |
|---|---|---|---|---|
| Home | 99 / 100 / 100 / 100 | 97 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 98 / 100 / 100 / 100 |
| How mentoring works | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 98 / 100 / 100 / 100 |
| About Nick | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 97 / 100 / 100 / 100 |
| FAQ | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| Book a free session | 100 / 100 / 100 / 100 | 95 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 98 / 100 / 100 / 100 |
| Contact | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Privacy policy | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| Cookie notice | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Page not found (404) | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

**Failed attempts, and the re-runs that replaced them.** Nothing in the site changed between an attempt and its re-run. Every attempt is listed, oldest first. Each run is shown as Performance score (total blocking time, main-thread time).

| Page | Form factor | Attempt | Median; lowest | Each run |
|---|---|---|---|---|
| Home | mobile | 1 of 4: failed | 100 / 100 / 100 / 100; 94 / 100 / 100 / 100 | 94 (0 ms, 1,418 ms); 100 (0 ms, 464 ms); 100 (58 ms, 761 ms) |
| Home | mobile | 2 of 4: failed | 90 / 100 / 100 / 100; 74 / 100 / 100 / 100 | 98 (0 ms, 795 ms); 90 (398 ms, 1,781 ms); 74 (978 ms, 3,465 ms) |
| Home | mobile | 3 of 4: failed | 100 / 100 / 100 / 100; 94 / 100 / 100 / 100 | 94 (0 ms, 2,186 ms); 100 (29 ms, 543 ms); 100 (0 ms, 423 ms) |
| Home | mobile | 4 of 4: passed | 99 / 100 / 100 / 100; 97 / 100 / 100 / 100 | 99 (0 ms, 804 ms); 97 (100 ms, 1,872 ms); 99 (0 ms, 803 ms) |
| How mentoring works | mobile | 1 of 3: failed | 100 / 100 / 100 / 100; 77 / 100 / 100 / 100 | 100 (0 ms, 361 ms); 100 (0 ms, 372 ms); 77 (1,019 ms, 2,644 ms) |
| How mentoring works | mobile | 2 of 3: failed | 97 / 100 / 100 / 100; 86 / 100 / 100 / 100 | 86 (403 ms, 2,026 ms); 98 (113 ms, 1,375 ms); 97 (168 ms, 1,361 ms) |
| How mentoring works | mobile | 3 of 3: passed | 100 / 100 / 100 / 100; 100 / 100 / 100 / 100 | 100 (0 ms, 479 ms); 100 (0 ms, 430 ms); 100 (0 ms, 559 ms) |
| FAQ | mobile | 1 of 2: failed | 91 / 100 / 100 / 100; 90 / 100 / 100 / 100 | 91 (285 ms, 1,496 ms); 96 (188 ms, 1,891 ms); 90 (339 ms, 1,557 ms) |
| FAQ | mobile | 2 of 2: passed | 100 / 100 / 100 / 100; 100 / 100 / 100 / 100 | 100 (0 ms, 345 ms); 100 (0 ms, 361 ms); 100 (0 ms, 540 ms) |
| Contact | desktop | 1 of 2: failed | 100 / 100 / 100 / 100; 94 / 100 / 100 / 100 | 94 (0 ms, 222 ms); 100 (0 ms, 110 ms); 100 (0 ms, 122 ms) |
| Contact | desktop | 2 of 2: passed | 100 / 100 / 100 / 100; 100 / 100 / 100 / 100 | 100 (0 ms, 92 ms); 100 (0 ms, 105 ms); 100 (0 ms, 94 ms) |

Audits that did not score full marks in at least one run:

- Home, mobile: performance: first-contentful-paint (0.98)
- Home, mobile: performance: speed-index (0.96)
- Home, mobile: performance: total-blocking-time (0.98)
- Home, mobile: performance: speed-index (0.8)
- Home, mobile: performance: first-contentful-paint (0.99)
- Home, mobile: performance: speed-index (0.9)
- Home, desktop: performance: speed-index (0.78)
- Home, desktop: performance: speed-index (0.98)
- How mentoring works, mobile: performance: speed-index (0.99)
- How mentoring works, desktop: performance: speed-index (0.81)
- About Nick, desktop: performance: speed-index (0.99)
- About Nick, desktop: performance: speed-index (0.66)
- FAQ, desktop: performance: speed-index (0.91)
- FAQ, desktop: performance: speed-index (0.87)
- FAQ, desktop: performance: speed-index (0.94)
- Book a free session, mobile: performance: speed-index (0.48)
- Book a free session, desktop: performance: speed-index (0.88)
- Book a free session, desktop: performance: speed-index (0.75)
- Book a free session, desktop: performance: speed-index (0.92)
- Contact, mobile: performance: speed-index (0.91)
- Contact, desktop: performance: speed-index (0.96)
- Privacy policy, mobile: performance: first-contentful-paint (0.99)
- Privacy policy, desktop: performance: speed-index (0.9)
- Cookie notice, mobile: performance: first-contentful-paint (0.99)
- Page not found (404), mobile: performance: first-contentful-paint (0.99)

The 404 page was audited at `404.html`, the same file served with status 200: Lighthouse will not audit a page served with status 404.

**Supplementary: the booking page for a returning visitor who has already agreed to load Calendly**, so the calendar loads at once. This is not part of the pass mark: it shows what Calendly itself costs, and why it loads only when asked.

| Form factor | Median | Lowest | Audits below full marks |
|---|---|---|---|
| mobile | 57 / 100 / 77 / 100 | 57 / 100 / 77 / 100 | performance: first-contentful-paint (0.92); performance: largest-contentful-paint (0.85); performance: speed-index (0.53); best-practices: third-party-cookies (0); best-practices: inspector-issues (0); performance: first-contentful-paint (0); performance: largest-contentful-paint (0); performance: speed-index (0.18); performance: speed-index (0.19) |
| desktop | 95 / 100 / 73 / 100 | 93 / 100 / 73 / 100 | performance: first-contentful-paint (0.98); performance: largest-contentful-paint (0.88); performance: speed-index (0.85); best-practices: third-party-cookies (0); best-practices: errors-in-console (0); best-practices: inspector-issues (0); performance: speed-index (0.99); performance: first-contentful-paint (0.96); performance: largest-contentful-paint (0.82); performance: speed-index (0.82) |

## Layout at every width

Each page was loaded fresh at each width from http://localhost:4173/ (360, 390 and 768 px emulated as touch phones and tablets; 1,024 px and up as desktops). After the page settled, the check measured: horizontal scroll (document width minus window width); layout shift, by adding up every `layout-shift` entry from the start of loading; every element reaching past the screen edge; every line of text clipped by the screen or by a box that hides overflow; and every pair of text lines covering each other. The FAQ was checked again with every answer open.

| Page | 360 | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|
| Home | ✅ [png](screenshots/home/360.png) | ✅ [png](screenshots/home/390.png) | ✅ [png](screenshots/home/768.png) | ✅ [png](screenshots/home/1024.png) | ✅ [png](screenshots/home/1280.png) | ✅ [png](screenshots/home/1440.png) | ✅ [png](screenshots/home/1920.png) |
| How mentoring works | ✅ [png](screenshots/mentoring/360.png) | ✅ [png](screenshots/mentoring/390.png) | ✅ [png](screenshots/mentoring/768.png) | ✅ [png](screenshots/mentoring/1024.png) | ✅ [png](screenshots/mentoring/1280.png) | ✅ [png](screenshots/mentoring/1440.png) | ✅ [png](screenshots/mentoring/1920.png) |
| About Nick | ✅ [png](screenshots/about/360.png) | ✅ [png](screenshots/about/390.png) | ✅ [png](screenshots/about/768.png) | ✅ [png](screenshots/about/1024.png) | ✅ [png](screenshots/about/1280.png) | ✅ [png](screenshots/about/1440.png) | ✅ [png](screenshots/about/1920.png) |
| FAQ | ✅ [png](screenshots/faq/360.png) | ✅ [png](screenshots/faq/390.png) | ✅ [png](screenshots/faq/768.png) | ✅ [png](screenshots/faq/1024.png) | ✅ [png](screenshots/faq/1280.png) | ✅ [png](screenshots/faq/1440.png) | ✅ [png](screenshots/faq/1920.png) |
| Book a free session | ✅ [png](screenshots/book/360.png) | ✅ [png](screenshots/book/390.png) | ✅ [png](screenshots/book/768.png) | ✅ [png](screenshots/book/1024.png) | ✅ [png](screenshots/book/1280.png) | ✅ [png](screenshots/book/1440.png) | ✅ [png](screenshots/book/1920.png) |
| Contact | ✅ [png](screenshots/contact/360.png) | ✅ [png](screenshots/contact/390.png) | ✅ [png](screenshots/contact/768.png) | ✅ [png](screenshots/contact/1024.png) | ✅ [png](screenshots/contact/1280.png) | ✅ [png](screenshots/contact/1440.png) | ✅ [png](screenshots/contact/1920.png) |
| Privacy policy | ✅ [png](screenshots/privacy/360.png) | ✅ [png](screenshots/privacy/390.png) | ✅ [png](screenshots/privacy/768.png) | ✅ [png](screenshots/privacy/1024.png) | ✅ [png](screenshots/privacy/1280.png) | ✅ [png](screenshots/privacy/1440.png) | ✅ [png](screenshots/privacy/1920.png) |
| Cookie notice | ✅ [png](screenshots/cookies/360.png) | ✅ [png](screenshots/cookies/390.png) | ✅ [png](screenshots/cookies/768.png) | ✅ [png](screenshots/cookies/1024.png) | ✅ [png](screenshots/cookies/1280.png) | ✅ [png](screenshots/cookies/1440.png) | ✅ [png](screenshots/cookies/1920.png) |
| Page not found (404) | ✅ [png](screenshots/404/360.png) | ✅ [png](screenshots/404/390.png) | ✅ [png](screenshots/404/768.png) | ✅ [png](screenshots/404/1024.png) | ✅ [png](screenshots/404/1280.png) | ✅ [png](screenshots/404/1440.png) | ✅ [png](screenshots/404/1920.png) |

Every cell links to its full-page screenshot. The FAQ also has screenshots with every answer open (`screenshots/faq/<width>-answers-open.png`). Headings used the site's own serif font in 63 of 63 loads. Console errors: 0.

## Calendly

Tested with Puppeteer against http://localhost:4173/, with the booking link https://calendly.com/nicholas-finnemore/free-diagnostic. Calendly loads only after the visitor agrees, so each test first checks that nothing came from Calendly before that choice. The booking flow was followed to Calendly's details form and never submitted, so nothing was booked in Nick's calendar. On phone and tablet widths the test taps, as people do: Calendly ignores mouse clicks on touch screens. The details form asks for: full_name, email, question_0, g-recaptcha-response, ot-group-id-C0002, ot-group-id-C0003, ot-group-id-C0004, vendor-search-handler, checkbox, checkbox, checkbox, checkbox.

**Inline calendar on the booking page**

| Width | Calendly requests before consent | Cookies before consent | Calendar loaded | Booking flow opened | Loads by itself when the choice is remembered | Layout shift then | Pass |
|---|---|---|---|---|---|---|---|
| 360 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 9:30am → next → details form | ✅ | 0.0000 | ✅ |
| 390 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 9:30am → time pressed again → next → details form | ✅ | 0.0000 | ✅ |
| 768 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 9:30am → next → details form | ✅ | 0.0000 | ✅ |
| 1024 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 9:30am → next → details form | ✅ | 0.0000 | ✅ |
| 1280 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 9:30am → time pressed again → next → details form | ✅ | 0.0000 | ✅ |
| 1440 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 9:30am → next → details form | ✅ | 0.0000 | ✅ |
| 1920 | 0 | 0 | ✅ | ✅ day: Friday, October 23 - Times available → time: 9:30am → time pressed again → next → details form | ✅ | 0.0000 | ✅ |

Screenshots of the details form reached at each width: [calendly/](calendly/) (`inline-<width>.png`). Content Security Policy violations recorded during these tests: 0.

Cookies after loading the calendar, compared with the cookie notice's list: 0 not listed; 0 listed but not seen this time.

**Popup from the header button**: on every page, the button first asks before loading Calendly, then opens Calendly's popup with the calendar drawn, which then closes; after a reload, with the choice remembered, the popup opens straight away.

| Page | 360 | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| How mentoring works | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| About Nick | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FAQ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book a free session | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Privacy policy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cookie notice | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Page not found (404) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Without JavaScript: ✅ the header button is a plain link to the booking page, which explains that the calendar needs JavaScript and links to the booking page on Calendly's website.

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

320 references on 9 pages (55 distinct), fetched from http://localhost:4173/: every link, stylesheet, script, icon and `#section` target, and each `#section` was found on its page. Broken: **0**.

External sites:

- ✅ 200 https://calendly.com/nicholas-finnemore/free-diagnostic
- ✅ 200 https://privacycenter.instagram.com/policy/
- ✅ 200 https://calendly.com/legal/privacy-notice
- ✅ 200 https://policies.google.com/privacy?hl=en-GB
- ✅ 200 https://www.cloudflare.com/privacypolicy/
- ✅ 200 https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- ✅ 200 https://ico.org.uk/make-a-complaint/

Telephone links: `tel:999`, `tel:111`, `tel:116123`, `tel:03031231113`. Email links: `mailto:hello@deepestrest.com`.

## Facts, protected titles and clinical claims

**Placeholders: 0.** Facts that are not known were left out of the pages rather than shown as placeholders; [PLACEHOLDERS.md](../PLACEHOLDERS.md) lists them under "Left out for want of a fact".

| Page | Unexplained figures or contact details | Protected titles | Clinical claims |
|---|---|---|---|
| Home | 0 | 0 | 0 |
| How mentoring works | 0 | 0 | 0 |
| About Nick | 0 | 0 | 0 |
| FAQ | 0 | 0 | 0 |
| Book a free session | 0 | 0 | 0 |
| Contact | 0 | 0 | 0 |
| Privacy policy | 0 | 0 | 0 |
| Cookie notice | 0 | 0 | 0 |
| Page not found (404) | 0 | 0 | 0 |

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
- `22 October 2026`: the date the privacy policy was last updated (site.config.json, privacy.lastUpdated)
- `© 2026`: year of the build
- `Article 6(1)(a)`: UK GDPR Article 6(1)(a), consent
- `Article 6(1)(b)`: UK GDPR Article 6(1)(b), contract
- `Article 6(1)(c)`: UK GDPR Article 6(1)(c), legal obligation
- `Article 6(1)(d)`: UK GDPR Article 6(1)(d), vital interests
- `Article 6(1)(f)`: UK GDPR Article 6(1)(f), legitimate interests
- `Article 9(2)(a)`: UK GDPR Article 9(2)(a), explicit consent
- `22 October 2026`: date scripts/verify/calendly.mjs recorded the Calendly cookies (src/data/calendly-cookies.json)
- `hello@deepestrest.com`: site.config.json, practice.email (Cloudflare Email Routing to Nick)

Statements in the text, and where each was checked:

- Nick's figures and words (five years mentoring students and young adults; young, which has played to his advantage because he has seen many people go through tech addiction and been able to get them out of it; a 100% satisfaction rate across 23 clients; the first five sessions free, as a diagnostic): his order of 19 October 2026, recorded in site.config.json under _sources
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

There are no testimonials. General wording about how mentoring works, beyond Nick's own words, is listed for him to check at the end of PLACEHOLDERS.md.

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

## Limits of these checks

- Only Chrome was used (Chrome for Testing, headless), with phones and tablets emulated. Safari, Firefox and real devices were not tested.
- Calendly is a third party: its layout, cookie list and cookie banner can change. The banner appeared from this machine's location, and may differ elsewhere.
- No booking was submitted, so no session was booked in Nick's calendar and Calendly's confirmation step and emails were not exercised.
- No email was sent to hello@deepestrest.com, since nothing is sent outside this machine without Nick's yes: the routing rule and DNS records were checked, delivery was not.
- Lighthouse scores vary from run to run and from machine to machine; the table gives the lowest score of every run as well as the median.
- The privacy policy and cookie notice were drafted for UK GDPR and PECR from the sources above. They have not been reviewed by a lawyer, and Nick, as data controller, should check them against how he handles bookings and emails (PLACEHOLDERS.md lists the wording to check).

