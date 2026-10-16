# DeepRest website: verification report

Written by `scripts/verify/report.mjs` (the last step of `npm run verify`) on 2026-10-16 19:55 UTC, from the JSON results each check left in this folder.
The site was tested as built in `dist/`, served locally the way GitHub Pages will serve it (`scripts/serve.mjs`: under `/DeepRest/`, gzip, 10-minute caching, the 404 page for missing addresses).
It is not published, so nothing was measured on the live site.

## Summary

| Check | Target | Result |
|---|---|---|
| Lighthouse, mobile and desktop, 10 pages | 95+ in Performance, Accessibility, Best Practices and SEO | ✅ 20/20 pass in every run; lowest score in any of 3 runs: **99**; 1 pair needed a re-run after an attempt slowed by other load on the machine, shown below |
| Horizontal scroll, 7 widths × 10 pages | 0 | ✅ largest: **0 px** over 70 page-widths |
| Layout shift during load | under 0.1 | ✅ largest: **0.0000**; with the Calendly calendar auto-loading: 0.0000 |
| Text cut off or overlapping | none | ✅ 0 cut, 0 overlapping, 0 elements past the screen edge |
| Calendly inline embed: loads and opens its booking flow | every width | ✅ 7/7 widths |
| Calendly popup from the header button | every page, every width | ✅ 70/70 page-widths |
| HTML validator (W3C Nu HTML Checker) | 0 errors | ✅ **0 errors** in 11 files; 0 other warnings; 20 known CSP warnings, explained below |
| Broken links | 0 | ✅ **0** broken of 365 references (56 distinct) |
| Placeholders | listed | **28**, every one in [PLACEHOLDERS.md](../PLACEHOLDERS.md) with where it appears |
| Invented facts | 0 | ✅ **0** unexplained figures or contact details on any page |
| Publishing guard | no publishing while placeholders remain | ✅ strict build refuses now; with every placeholder filled it builds 10 pages with no placeholder |

## Lighthouse

Lighthouse 13.5.0, default mobile settings (emulated phone, slow 4G, 4× slower CPU) and the desktop preset. Each page and form factor ran 3 times; the table gives the median run (by Performance) and, after it, the lowest score in any run. Scores: Performance / Accessibility / Best Practices / SEO. Full reports of the median runs are in [lighthouse/](lighthouse/).

| Page | Mobile, median | Mobile, lowest | Desktop, median | Desktop, lowest |
|---|---|---|---|---|
| Home | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| About | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Services and approach | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Fees and insurance | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| FAQ | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| Book a session | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Contact | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Privacy policy | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Cookie notice | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Page not found (404) | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

**Failed attempts, and the re-runs that replaced them.** Nothing in the site changed between an attempt and its re-run. This machine also runs other services: when they take the CPU, a page can get long main-thread tasks that are not its own work, and Lighthouse’s mobile setting multiplies them by four. Each run is shown as Performance score (total blocking time, main-thread time).

| Page | Form factor | Failed attempt: median; lowest | Each failed-attempt run | Re-run: median; lowest | Each re-run |
|---|---|---|---|---|---|
| Home | mobile | 100 / 100 / 100 / 100; 90 / 100 / 100 / 100 | 100 (0 ms, 1,518 ms); 100 (0 ms, 1,608 ms); 90 (237 ms, 1,420 ms) | 100 / 100 / 100 / 100; 99 / 100 / 100 / 100 | 100 (0 ms, 1,223 ms); 100 (0 ms, 1,516 ms); 99 (0 ms, 2,317 ms) |

Audits that did not score full marks in at least one run:

- Home, mobile: performance: first-contentful-paint (0.99)
- Home, mobile: performance: speed-index (0.99)
- Home, mobile: performance: first-contentful-paint (0.93)
- Home, mobile: performance: largest-contentful-paint (0.99)
- Home, mobile: performance: speed-index (0.97)
- Home, desktop: performance: speed-index (0.98)
- Home, desktop: performance: first-contentful-paint (0.99)
- Home, desktop: performance: speed-index (0.92)
- Home, desktop: performance: speed-index (0.99)
- About, mobile: performance: first-contentful-paint (0.99)
- About, mobile: performance: speed-index (0.98)
- About, mobile: performance: speed-index (0.97)
- About, desktop: performance: speed-index (0.99)
- About, desktop: performance: speed-index (0.98)
- Services and approach, mobile: performance: speed-index (0.99)
- Services and approach, mobile: performance: first-contentful-paint (0.98)
- Services and approach, mobile: performance: first-contentful-paint (0.99)
- Services and approach, desktop: performance: speed-index (0.99)
- Services and approach, desktop: performance: speed-index (0.98)
- Services and approach, desktop: performance: speed-index (0.96)
- Fees and insurance, mobile: performance: first-contentful-paint (0.99)
- Fees and insurance, mobile: performance: speed-index (0.98)
- Fees and insurance, desktop: performance: speed-index (0.96)
- FAQ, mobile: performance: speed-index (0.99)
- FAQ, mobile: performance: first-contentful-paint (0.99)
- FAQ, mobile: performance: speed-index (0.98)
- FAQ, desktop: performance: speed-index (0.9)
- FAQ, desktop: performance: speed-index (0.99)
- Book a session, mobile: performance: first-contentful-paint (0.99)
- Book a session, desktop: performance: speed-index (0.98)
- Book a session, desktop: performance: speed-index (0.95)
- Contact, mobile: performance: first-contentful-paint (0.99)
- Contact, desktop: performance: speed-index (0.98)
- Contact, desktop: performance: speed-index (0.99)
- Privacy policy, mobile: performance: first-contentful-paint (0.96)
- Privacy policy, mobile: performance: speed-index (0.99)
- Privacy policy, mobile: performance: first-contentful-paint (0.99)
- Privacy policy, mobile: performance: speed-index (0.98)
- Privacy policy, desktop: performance: speed-index (0.98)
- Privacy policy, desktop: performance: speed-index (0.99)
- Cookie notice, mobile: performance: first-contentful-paint (0.99)

The 404 page was audited at `/DeepRest/404.html`, the same file served with status 200: Lighthouse will not audit a page served with status 404.

**Supplementary: the booking page for a returning visitor who has already chosen to load Calendly**, so the calendar loads at once. This is not part of the pass mark: it shows what Calendly itself costs, and why it loads only when asked.

| Form factor | Median | Lowest | Audits below full marks |
|---|---|---|---|
| mobile | 99 / 100 / 77 / 100 | 99 / 100 / 77 / 100 | performance: first-contentful-paint (0.99); performance: largest-contentful-paint (0.99); best-practices: third-party-cookies (0); best-practices: inspector-issues (0); performance: first-contentful-paint (0.97); performance: speed-index (0.99); performance: first-contentful-paint (0.98); performance: total-blocking-time (0.99) |
| desktop | 100 / 100 / 77 / 100 | 100 / 100 / 77 / 100 | best-practices: third-party-cookies (0); best-practices: inspector-issues (0); performance: speed-index (0.98); performance: speed-index (0.99) |

## Layout at every width

Each page was loaded fresh at each width (360, 390 and 768 px emulated as touch phones and tablets; 1,024 px and up as desktops). After the page settled, the check measured: horizontal scroll (document width minus window width); layout shift, by adding up every `layout-shift` entry from the start of loading; every element reaching past the screen edge; every line of text clipped by the screen or by a box that hides overflow; and every pair of text lines covering each other. Pages with collapsed answers (the FAQ) were checked again with every answer open.

| Page | 360 | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|
| Home | ✅ [png](screenshots/home/360.png) | ✅ [png](screenshots/home/390.png) | ✅ [png](screenshots/home/768.png) | ✅ [png](screenshots/home/1024.png) | ✅ [png](screenshots/home/1280.png) | ✅ [png](screenshots/home/1440.png) | ✅ [png](screenshots/home/1920.png) |
| About | ✅ [png](screenshots/about/360.png) | ✅ [png](screenshots/about/390.png) | ✅ [png](screenshots/about/768.png) | ✅ [png](screenshots/about/1024.png) | ✅ [png](screenshots/about/1280.png) | ✅ [png](screenshots/about/1440.png) | ✅ [png](screenshots/about/1920.png) |
| Services and approach | ✅ [png](screenshots/services/360.png) | ✅ [png](screenshots/services/390.png) | ✅ [png](screenshots/services/768.png) | ✅ [png](screenshots/services/1024.png) | ✅ [png](screenshots/services/1280.png) | ✅ [png](screenshots/services/1440.png) | ✅ [png](screenshots/services/1920.png) |
| Fees and insurance | ✅ [png](screenshots/fees/360.png) | ✅ [png](screenshots/fees/390.png) | ✅ [png](screenshots/fees/768.png) | ✅ [png](screenshots/fees/1024.png) | ✅ [png](screenshots/fees/1280.png) | ✅ [png](screenshots/fees/1440.png) | ✅ [png](screenshots/fees/1920.png) |
| FAQ | ✅ [png](screenshots/faq/360.png) | ✅ [png](screenshots/faq/390.png) | ✅ [png](screenshots/faq/768.png) | ✅ [png](screenshots/faq/1024.png) | ✅ [png](screenshots/faq/1280.png) | ✅ [png](screenshots/faq/1440.png) | ✅ [png](screenshots/faq/1920.png) |
| Book a session | ✅ [png](screenshots/book/360.png) | ✅ [png](screenshots/book/390.png) | ✅ [png](screenshots/book/768.png) | ✅ [png](screenshots/book/1024.png) | ✅ [png](screenshots/book/1280.png) | ✅ [png](screenshots/book/1440.png) | ✅ [png](screenshots/book/1920.png) |
| Contact | ✅ [png](screenshots/contact/360.png) | ✅ [png](screenshots/contact/390.png) | ✅ [png](screenshots/contact/768.png) | ✅ [png](screenshots/contact/1024.png) | ✅ [png](screenshots/contact/1280.png) | ✅ [png](screenshots/contact/1440.png) | ✅ [png](screenshots/contact/1920.png) |
| Privacy policy | ✅ [png](screenshots/privacy/360.png) | ✅ [png](screenshots/privacy/390.png) | ✅ [png](screenshots/privacy/768.png) | ✅ [png](screenshots/privacy/1024.png) | ✅ [png](screenshots/privacy/1280.png) | ✅ [png](screenshots/privacy/1440.png) | ✅ [png](screenshots/privacy/1920.png) |
| Cookie notice | ✅ [png](screenshots/cookies/360.png) | ✅ [png](screenshots/cookies/390.png) | ✅ [png](screenshots/cookies/768.png) | ✅ [png](screenshots/cookies/1024.png) | ✅ [png](screenshots/cookies/1280.png) | ✅ [png](screenshots/cookies/1440.png) | ✅ [png](screenshots/cookies/1920.png) |
| Page not found (404) | ✅ [png](screenshots/404/360.png) | ✅ [png](screenshots/404/390.png) | ✅ [png](screenshots/404/768.png) | ✅ [png](screenshots/404/1024.png) | ✅ [png](screenshots/404/1280.png) | ✅ [png](screenshots/404/1440.png) | ✅ [png](screenshots/404/1920.png) |

Every cell links to its full-page screenshot. The FAQ also has screenshots with every answer open (`screenshots/faq/<width>-answers-open.png`). Headings used the site's own serif font in 70 of 70 loads.

## Calendly

Tested with Puppeteer against the demo scheduling page. These checks run first, because they record the cookies the cookie notice lists; the site is then rebuilt with that list, which changes only the cookie notice’s table, before every other check. Calendly loads only after the visitor chooses it, so each test first checks that nothing came from Calendly before that choice. The booking flow was followed to Calendly's details form and never submitted, so no demo meeting was booked. On phone and tablet widths the test taps, as people do: Calendly ignores mouse clicks on touch screens.

**Inline calendar on the booking page**

| Width | Calendly requests before the choice | Cookies before the choice | Calendar loaded | Booking flow opened | Loads by itself when the choice is remembered | Layout shift then | Pass |
|---|---|---|---|---|---|---|---|
| 360 | 0 | 0 | ✅ | ✅ day: Monday, October 19 - Times available → time: 5:00pm → next → details form | ✅ | 0.0000 | ✅ |
| 390 | 0 | 0 | ✅ | ✅ day: Monday, October 19 - Times available → time: 5:00pm → next → details form | ✅ | 0.0000 | ✅ |
| 768 | 0 | 0 | ✅ | ✅ day: Monday, October 19 - Times available → time: 5:00pm → next → details form | ✅ | 0.0000 | ✅ |
| 1024 | 0 | 0 | ✅ | ✅ day: Monday, October 19 - Times available → time: 5:00pm → next → details form | ✅ | 0.0000 | ✅ |
| 1280 | 0 | 0 | ✅ | ✅ day: Monday, October 19 - Times available → time: 5:00pm → next → details form | ✅ | 0.0000 | ✅ |
| 1440 | 0 | 0 | ✅ | ✅ day: Monday, October 19 - Times available → time: 5:00pm → next → details form | ✅ | 0.0000 | ✅ |
| 1920 | 0 | 0 | ✅ | ✅ day: Monday, October 19 - Times available → time: 5:00pm → next → details form | ✅ | 0.0000 | ✅ |

Screenshots of the details form reached at each width: [calendly/](calendly/) (`inline-<width>.png`). Content Security Policy violations recorded during these tests: 0.

**Popup from the header button**: on every page, the button first asks before loading Calendly, then opens Calendly's popup with the calendar drawn, which then closes; after a reload, with the choice remembered, the popup opens straight away.

| Page | 360 | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| About | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Services and approach | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fees and insurance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FAQ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book a session | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Privacy policy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cookie notice | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Page not found (404) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Without JavaScript: ✅ the header button is a plain link to the booking page, which explains that the calendar needs JavaScript and links to the booking page on Calendly's website.

## HTML validation

Nu HTML Checker 26.10.12 (0a70d65), the engine behind validator.w3.org/nu, run locally on every built page and the stylesheet.

| File | Errors | Warnings | Known CSP warnings |
|---|---|---|---|
| 404.html | 0 | 0 | 2 |
| index.html | 0 | 0 | 2 |
| about/index.html | 0 | 0 | 2 |
| book/index.html | 0 | 0 | 2 |
| contact/index.html | 0 | 0 | 2 |
| cookies/index.html | 0 | 0 | 2 |
| faq/index.html | 0 | 0 | 2 |
| fees/index.html | 0 | 0 | 2 |
| privacy/index.html | 0 | 0 | 2 |
| services/index.html | 0 | 0 | 2 |
| assets/css/site.css | 0 | 0 | 0 |

The known warnings are the checker's, not the browser's: checking files, it has no web origin for the page, so it cannot match the Content Security Policy's `'self'` and warns that the site's own stylesheet and script would be blocked. In Chrome the same policy blocked nothing: the Calendly tests record every violation and found none. Checking over HTTP instead was tried: the checker refuses `localhost` ("Forbidden host"), and through standard input the same warning appears.

## Links

365 references on 10 pages (56 distinct): every link, stylesheet, script, icon and `#section` target. Internal pages were fetched from the local server, and each `#section` was found on its page. Broken: **0**.

External sites:

- ✅ 200 https://www.hcpc-uk.org/check-the-register/
- ✅ 200 https://calendly.com/embed-demo-sales/discovery-call
- ✅ 200 https://www.hcpc-uk.org/standards/standards-of-conduct-performance-and-ethics/
- ✅ 200 https://www.hcpc-uk.org/concerns/
- ✅ 200 https://calendly.com/legal/privacy-notice
- ✅ 200 https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- ✅ 200 https://ico.org.uk/make-a-complaint/

Telephone links: `tel:999`, `tel:111`, `tel:116123`, `tel:03031231113`.

The site's own future public address (9 canonical and sharing addresses) cannot answer until the site is published, so each was checked against the same page on the local server.

## Placeholders and facts

**28 placeholders**, each listed with what is needed and where it appears in [PLACEHOLDERS.md](../PLACEHOLDERS.md): `site.url`, `practice.legalName`, `practice.icoRegistrationNumber`, `practice.email`, `practice.phone`, `practice.address`, `psychologist.name`, `psychologist.title`, `psychologist.qualifications`, `psychologist.hcpcNumber`, `psychologist.bpsMembership`, `psychologist.bio`, `psychologist.photo`, `psychologist.clientGroups`, `psychologist.specialisms`, `psychologist.approach`, `sessions.formats`, `fees.items.0.appointment`, `fees.items.0.length`, `fees.items.0.fee`, `fees.payment`, `fees.cancellation`, `fees.insurers`, `calendly.url`, `privacy.lastUpdated`, `privacy.retention`, `privacy.providers`, `privacy.security`.

| Page | Placeholder marks | Distinct placeholders | Unexplained figures or contact details |
|---|---|---|---|
| Home | 17 | 9 | 0 |
| About | 13 | 9 | 0 |
| Services and approach | 11 | 9 | 0 |
| Fees and insurance | 12 | 11 | 0 |
| FAQ | 11 | 7 | 0 |
| Book a session | 7 | 7 | 0 |
| Contact | 9 | 6 | 0 |
| Privacy policy | 18 | 12 | 0 |
| Cookie notice | 5 | 5 | 0 |
| Page not found (404) | 5 | 5 | 0 |

**Invented facts: 0.** The scan removes the placeholders from each page's visible text and then looks for money, percentages, email addresses, HCPC numbers, postcodes, long quotations and any figure at all. Every figure left must be one of these, each checked against its source:

- `999`: UK emergency number (given in the brief)
- `111`: NHS 111 (given in the brief)
- `116 123`: Samaritans, https://www.samaritans.org/how-we-can-help/contact-samaritan/ (free, day or night, 365 days a year)
- `365`: Samaritans page above: "365 days a year"
- `0303 123 1113`: ICO helpline, https://ico.org.uk/make-a-complaint/
- `2018`: Data Protection Act 2018 (UK statute)
- `6(1)(b)`: UK GDPR Article 6(1)(b), contract
- `6(1)(c)`: UK GDPR Article 6(1)(c), legal obligation
- `6(1)(d)`: UK GDPR Article 6(1)(d), vital interests
- `6(1)(f)`: UK GDPR Article 6(1)(f), legitimate interests
- `9(2)(a)`: UK GDPR Article 9(2)(a), explicit consent
- `9(2)(c)`: UK GDPR Article 9(2)(c), vital interests
- `9(2)(f)`: UK GDPR Article 9(2)(f), legal claims
- `9(2)(g)`: UK GDPR Article 9(2)(g), substantial public interest
- `9(2)(h)`: UK GDPR Article 9(2)(h), health or social care
- `Schedule 1, paragraph 2`: Data Protection Act 2018, Schedule 1 Part 1 paragraph 2, health or social care purposes
- `Schedule 1, paragraph 18`: Data Protection Act 2018, Schedule 1 Part 2 paragraph 18, safeguarding of children and individuals at risk
- `Article 6`: UK GDPR
- `Article 9`: UK GDPR
- `404`: HTTP status of the error page
- `© 2026`: year of the build
- `16 October 2026`: date scripts/verify/calendly.mjs recorded the Calendly cookies (src/data/calendly-cookies.json)

Statements in the text, and where each was checked:

- Titles such as clinical and counselling psychologist are protected by law; only people on the HCPC register may use them: HCPC, https://www.hcpc-uk.org/about-us/who-we-regulate/the-professions/
- Registrants must meet the HCPC standards of conduct, performance and ethics, including confidentiality (standard 5) and keeping knowledge and skills up to date (standard 3.4): https://www.hcpc-uk.org/standards/standards-of-conduct-performance-and-ethics/
- Practitioner psychologists' HCPC numbers begin PYL (used only in the instructions in site.config.json): https://www.hcpc-uk.org/check-the-register/how-to-check/
- Psychiatrists are doctors and can prescribe; psychologists do not prescribe: NHS Health Careers lists psychiatry among doctors' specialties (https://www.healthcareers.nhs.uk/explore-roles/doctors/roles-doctors/psychiatry); the HCPC's list of professions with prescribing rights does not include practitioner psychologists (https://www.hcpc-uk.org/standards/meeting-our-standards/scope-of-practice/medicines-and-prescribing-rights/our-professions-medicines-and-prescribing-rights/)
- Counsellors and psychotherapists are not regulated by law; many join voluntary registers: UKCP, https://www.psychotherapy.org.uk/policy-and-research/public-policy/statutory-regulation/
- Samaritans, 116 123, free from landlines and mobiles, day or night, 365 days a year: https://www.samaritans.org/how-we-can-help/contact-samaritan/
- ICO complaints and helpline 0303 123 1113: https://ico.org.uk/make-a-complaint/
- Calendly, LLC is in the United States, acts as a processor for its customers' invitee data, and complies with the UK Extension to the EU-U.S. Data Privacy Framework; its privacy notice covers cookies: https://calendly.com/legal/privacy-notice
- UK law treats personal data sent to US organisations certified under the UK Extension as adequately protected: Data Protection (Adequacy) (United States of America) Regulations 2023, https://www.legislation.gov.uk/uksi/2023/1028/made
- GitHub Pages logs every visitor's IP address for security purposes: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub adheres to the Data Privacy Framework principles for UK data under the UK Extension: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- Calendly's booking form asks for a name and email address; Calendly shows its own cookie settings in the calendar, to accept or decline optional cookies; loading the calendar sets the cookies listed on the cookie notice: observed by scripts/verify/calendly.mjs (see calendly/ screenshots)
- Health information is special category data; the rights listed; a reply within one month, extendable by two further months, usually free: UK GDPR Articles 9, 12 and 15 to 21

There are no testimonials, outcomes or statistics. General wording about how sessions work is listed for the psychologist to check at the end of PLACEHOLDERS.md.

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
- [verification/pdf/fees.pdf](pdf/fees.pdf)
- [verification/pdf/home.pdf](pdf/home.pdf)
- [verification/pdf/privacy.pdf](pdf/privacy.pdf)
- [verification/pdf/services.pdf](pdf/services.pdf)

## Approaches that failed, and what replaced them

- Finding Calendly's demo page by URL: every calendly.com address answers 200 (it is a single-page app), so candidates were loaded in Chrome. `acmesales` and `team-demo` showed no openings; `calendly-demo` worked, but nothing showed it is Calendly's own. Calendly's embed help pages give only YOURLINK examples. Calendly's blog links to its own demo site, calendly-embed.com, whose inline embed is `calendly.com/embed-demo-sales/discovery-call`, now the interim link.
- Calendly's cookie notice address, calendly.com/legal/cookie-notice, returns 404. The site links to Calendly's privacy notice, whose "Cookie and Local Storage Data" section covers cookies.
- The first look inside the Calendly iframe came after a fixed 8 seconds and found it empty: Calendly takes about 6 seconds to draw. The tests now wait for the calendar's day buttons, not for a fixed time.
- Calendly's loading spinner did not show: its `z-index: -1` put it behind the frame's white background. Fixed with `isolation: isolate` on the frame.
- A 760 px booking frame made Calendly scroll inside the frame at tablet widths. Calendly's content was measured: 1,058 to 1,114 px tall in its stacked layout, 758 px in two columns, switching when the frame is about 1,000 px wide. The frame is now 1,130 px tall below 1,088 px of viewport, and 760 px above.
- Mouse clicks inside Calendly did nothing on touch-emulated widths, because Calendly listens for taps there. The test now taps on phones and tablets. At 360 px one tap landed while the time list was still sliding in, and was lost; the test now lets it settle and taps again, up to 3 times.
- The layout check reported the FAQ answers as overlapping: Chrome keeps collapsed `<details>` content in the layout without drawing it. The check now skips text that is not drawn (`checkVisibility`), and checks the FAQ a second time with every answer open.
- Validating over HTTP, to avoid the checker's CSP warnings: the Nu checker refuses `localhost` ("Forbidden host"), and with standard input the same warnings appear. The files are checked directly, and the warnings are explained above.
- The Nu HTML Checker normally needs Java, which this machine does not have. The self-contained vnu.windows.zip build needed none.
- The link check reported the canonical addresses as broken, because the GitHub Pages site is not published yet. They are now checked against the same page on the local server.
- The facts scan first flagged the ICO's number, because removing "111" broke up "1113". Verified figures are now matched longest first.
- The first full Lighthouse batch stopped part-way (CHROME_INTERSTITIAL_ERROR on the FAQ page) when the local server it relied on ended with the session that had started it. A second batch, while this machine was busy, gave About on mobile a median Performance of 71 and a lowest of 43, with Chrome’s main thread at 4.3 seconds for a page that needs about 1 second elsewhere; it was stopped before finishing, and its results were not kept. The batch reported here was then run from the start, recording each run, and its one failed pair re-run with `--retry-failed`.
- Printing the booking page with the calendar loaded gave a blank frame: print-to-PDF does not draw a cross-origin iframe running in its own process. That one PDF is printed by a Chrome started without site isolation.

## Limits of these checks

- The site is not published, so every measurement is local. On GitHub Pages, the canonical addresses and sitemap start working only once the site is live there. At a project address such as nickfinn-bit.github.io/DeepRest/, search engines do not read robots.txt from the sub-folder; it takes effect only on a domain of the site's own.
- Only Chrome was used (Chrome for Testing, headless), with phones and tablets emulated. Safari, Firefox and real devices were not tested.
- Calendly is a third party: its demo account, layout, cookie list and cookie banner can change. The banner appeared from this machine's location, and may differ elsewhere.
- No booking was submitted, so Calendly's confirmation step was not exercised.
- Lighthouse scores vary from run to run and from machine to machine; the table gives the lowest score of every run as well as the median.
- The privacy policy and cookie notice were drafted for UK GDPR and PECR from the sources above. They have not been reviewed by a lawyer or by the data controller, and must be before publishing.

