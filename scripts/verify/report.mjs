// Writes verification/REPORT.md from the JSON results the other checks leave in verification/.
import fs from 'node:fs';
import path from 'node:path';
import { OUT, PAGES, WIDTHS } from './common.mjs';

// Statements in the site's text that rest on outside facts, and where each was checked.
const TEXT_SOURCES = [
  'Titles such as clinical and counselling psychologist are protected by law; only people on the HCPC register may use them: HCPC, https://www.hcpc-uk.org/about-us/who-we-regulate/the-professions/',
  'Registrants must meet the HCPC standards of conduct, performance and ethics, including confidentiality (standard 5) and keeping knowledge and skills up to date (standard 3.4): https://www.hcpc-uk.org/standards/standards-of-conduct-performance-and-ethics/',
  'Practitioner psychologists\' HCPC numbers begin PYL (used only in the instructions in site.config.json): https://www.hcpc-uk.org/check-the-register/how-to-check/',
  'Psychiatrists are doctors and can prescribe; psychologists do not prescribe: NHS Health Careers lists psychiatry among doctors\' specialties (https://www.healthcareers.nhs.uk/explore-roles/doctors/roles-doctors/psychiatry); the HCPC\'s list of professions with prescribing rights does not include practitioner psychologists (https://www.hcpc-uk.org/standards/meeting-our-standards/scope-of-practice/medicines-and-prescribing-rights/our-professions-medicines-and-prescribing-rights/)',
  'Counsellors and psychotherapists are not regulated by law; many join voluntary registers: UKCP, https://www.psychotherapy.org.uk/policy-and-research/public-policy/statutory-regulation/',
  'Samaritans, 116 123, free from landlines and mobiles, day or night, 365 days a year: https://www.samaritans.org/how-we-can-help/contact-samaritan/',
  'ICO complaints and helpline 0303 123 1113: https://ico.org.uk/make-a-complaint/',
  'Calendly, LLC is in the United States, acts as a processor for its customers\' invitee data, and complies with the UK Extension to the EU-U.S. Data Privacy Framework; its privacy notice covers cookies: https://calendly.com/legal/privacy-notice',
  'UK law treats personal data sent to US organisations certified under the UK Extension as adequately protected: Data Protection (Adequacy) (United States of America) Regulations 2023, https://www.legislation.gov.uk/uksi/2023/1028/made',
  'GitHub Pages logs every visitor\'s IP address for security purposes: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages',
  'GitHub adheres to the Data Privacy Framework principles for UK data under the UK Extension: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
  'Calendly\'s booking form asks for a name and email address; Calendly shows its own cookie settings in the calendar, to accept or decline optional cookies; loading the calendar sets the cookies listed on the cookie notice: observed by scripts/verify/calendly.mjs (see calendly/ screenshots)',
  'Health information is special category data; the rights listed; a reply within one month, extendable by two further months, usually free: UK GDPR Articles 9, 12 and 15 to 21',
];

const FAILED = [
  'Finding Calendly\'s demo page by URL: every calendly.com address answers 200 (it is a single-page app), so candidates were loaded in Chrome. `acmesales` and `team-demo` showed no openings; `calendly-demo` worked, but nothing showed it is Calendly\'s own. Calendly\'s embed help pages give only YOURLINK examples. Calendly\'s blog links to its own demo site, calendly-embed.com, whose inline embed is `calendly.com/embed-demo-sales/discovery-call`, now the interim link.',
  'Calendly\'s cookie notice address, calendly.com/legal/cookie-notice, returns 404. The site links to Calendly\'s privacy notice, whose "Cookie and Local Storage Data" section covers cookies.',
  'The first look inside the Calendly iframe came after a fixed 8 seconds and found it empty: Calendly takes about 6 seconds to draw. The tests now wait for the calendar\'s day buttons, not for a fixed time.',
  'Calendly\'s loading spinner did not show: its `z-index: -1` put it behind the frame\'s white background. Fixed with `isolation: isolate` on the frame.',
  'A 760 px booking frame made Calendly scroll inside the frame at tablet widths. Calendly\'s content was measured: 1,058 to 1,114 px tall in its stacked layout, 758 px in two columns, switching when the frame is about 1,000 px wide. The frame is now 1,130 px tall below 1,088 px of viewport, and 760 px above.',
  'Mouse clicks inside Calendly did nothing on touch-emulated widths, because Calendly listens for taps there. The test now taps on phones and tablets. At 360 px one tap landed while the time list was still sliding in, and was lost; the test now lets it settle and taps again, up to 3 times.',
  'The layout check reported the FAQ answers as overlapping: Chrome keeps collapsed `<details>` content in the layout without drawing it. The check now skips text that is not drawn (`checkVisibility`), and checks the FAQ a second time with every answer open.',
  'Validating over HTTP, to avoid the checker\'s CSP warnings: the Nu checker refuses `localhost` ("Forbidden host"), and with standard input the same warnings appear. The files are checked directly, and the warnings are explained above.',
  'The Nu HTML Checker normally needs Java, which this machine does not have. The self-contained vnu.windows.zip build needed none.',
  'The link check reported the canonical addresses as broken, because the GitHub Pages site is not published yet. They are now checked against the same page on the local server.',
  'The facts scan first flagged the ICO\'s number, because removing "111" broke up "1113". Verified figures are now matched longest first.',
  'The first full Lighthouse batch stopped part-way (CHROME_INTERSTITIAL_ERROR on the FAQ page) when the local server it relied on ended with the session that had started it. A second batch, while this machine was busy, gave About on mobile a median Performance of 71 and a lowest of 43, with Chrome’s main thread at 4.3 seconds for a page that needs about 1 second elsewhere; it was stopped before finishing, and its results were not kept. The batch reported here was then run from the start, recording each run, and its one failed pair re-run with `--retry-failed`.',
  'Printing the booking page with the calendar loaded gave a blank frame: print-to-PDF does not draw a cross-origin iframe running in its own process. That one PDF is printed by a Chrome started without site isolation.',
];

const LIMITS = [
  'The site is not published, so every measurement is local. On GitHub Pages, the canonical addresses and sitemap start working only once the site is live there. At a project address such as nickfinn-bit.github.io/DeepRest/, search engines do not read robots.txt from the sub-folder; it takes effect only on a domain of the site\'s own.',
  'Only Chrome was used (Chrome for Testing, headless), with phones and tablets emulated. Safari, Firefox and real devices were not tested.',
  'Calendly is a third party: its demo account, layout, cookie list and cookie banner can change. The banner appeared from this machine\'s location, and may differ elsewhere.',
  'No booking was submitted, so Calendly\'s confirmation step was not exercised.',
  'Lighthouse scores vary from run to run and from machine to machine; the table gives the lowest score of every run as well as the median.',
  'The privacy policy and cookie notice were drafted for UK GDPR and PECR from the sources above. They have not been reviewed by a lawyer or by the data controller, and must be before publishing.',
];

const read = (name) => {
  const file = path.join(OUT, name);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
};
const lh = read('lighthouse.json');
const layout = read('layout.json');
const cal = read('calendly.json');
const html = read('html-validation.json');
const links = read('links.json');
const facts = read('facts.json');
const ready = read('publish-ready.json');

const yes = (b) => (b ? '✅' : '❌');
// A summary row, or 'not run' when that check left no results.
const row = (data, text) => (data ? text : text.replace(/^(\| [^|]+\| [^|]+\| ).*$/, '$1not run |'));
const name = (slug) => PAGES.find((p) => p.slug === slug)?.name ?? slug;
const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];
const scores = (s) => CATS.map((c) => s[c]).join(' / ');
const lines = [];
const out = (...l) => lines.push(...l);

out(
  '# DeepRest website: verification report',
  '',
  `Written by \`scripts/verify/report.mjs\` (the last step of \`npm run verify\`) on ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC, from the JSON results each check left in this folder.`,
  'The site was tested as built in `dist/`, served locally the way GitHub Pages will serve it (`scripts/serve.mjs`: under `/DeepRest/`, gzip, 10-minute caching, the 404 page for missing addresses).',
  'It is not published, so nothing was measured on the live site.',
  '',
);

// Summary.
const lhAll = lh?.results ?? [];
const lhLowest = lhAll.length ? Math.min(...lhAll.flatMap((r) => CATS.map((c) => r.lowest[c]))) : null;
const lay = layout ?? [];
const inline = cal?.inline ?? [];
const popup = cal?.popup ?? [];
const htmlErrors = html ? html.results.reduce((n, r) => n + r.errors.length, 0) : null;
const htmlWarnings = html ? html.results.reduce((n, r) => n + r.warnings.length, 0) : null;
const htmlKnown = html ? html.results.reduce((n, r) => n + r.knownCspWarnings.length, 0) : null;
out(
  '## Summary',
  '',
  '| Check | Target | Result |',
  '|---|---|---|',
  row(lh, `| Lighthouse, mobile and desktop, ${lhAll.length / 2} pages | 95+ in Performance, Accessibility, Best Practices and SEO | ${yes(lhAll.length && lhAll.every((r) => r.pass))} ${lhAll.filter((r) => r.pass).length}/${lhAll.length} pass in every run; lowest score in any of ${lh?.runsPerPage} runs: **${lhLowest}**${lhAll.some((r) => r.failedAttempt) ? `; ${lhAll.filter((r) => r.failedAttempt).length} ${lhAll.filter((r) => r.failedAttempt).length === 1 ? 'pair' : 'pairs'} needed a re-run after an attempt slowed by other load on the machine, shown below` : ''} |`),
  row(layout, `| Horizontal scroll, ${WIDTHS.length} widths × ${PAGES.length} pages | 0 | ${yes(lay.length && lay.every((r) => r.horizontalScroll === 0))} largest: **${Math.max(...lay.map((r) => r.horizontalScroll))} px** over ${lay.length} page-widths |`),
  row(layout, `| Layout shift during load | under 0.1 | ${yes(lay.length && lay.every((r) => r.cls < 0.1))} largest: **${Math.max(...lay.map((r) => r.cls)).toFixed(4)}**; with the Calendly calendar auto-loading: ${Math.max(...inline.map((r) => r.clsWhenRemembered ?? 0)).toFixed(4)} |`),
  row(layout, `| Text cut off or overlapping | none | ${yes(lay.length && lay.every((r) => !r.cut.length && !r.overlaps.length && !r.offenders.length))} ${lay.reduce((n, r) => n + r.cut.length, 0)} cut, ${lay.reduce((n, r) => n + r.overlaps.length, 0)} overlapping, ${lay.reduce((n, r) => n + r.offenders.length, 0)} elements past the screen edge |`),
  row(cal, `| Calendly inline embed: loads and opens its booking flow | every width | ${yes(inline.length && inline.every((r) => r.pass))} ${inline.filter((r) => r.pass).length}/${inline.length} widths |`),
  row(cal, `| Calendly popup from the header button | every page, every width | ${yes(popup.length && popup.every((r) => r.pass))} ${popup.filter((r) => r.pass).length}/${popup.length} page-widths |`),
  row(html, `| HTML validator (W3C Nu HTML Checker) | 0 errors | ${yes(htmlErrors === 0)} **${htmlErrors} errors** in ${html?.results.length} files; ${htmlWarnings} other warnings; ${htmlKnown} known CSP warnings, explained below |`),
  row(links, `| Broken links | 0 | ${yes(links && links.broken.length === 0)} **${links?.broken.length}** broken of ${links?.checked} references (${links?.distinct} distinct) |`),
  row(facts, `| Placeholders | listed | **${facts?.placeholders}**, every one in [PLACEHOLDERS.md](../PLACEHOLDERS.md) with where it appears |`),
  row(facts, `| Invented facts | 0 | ${yes(facts?.inventedFacts === 0)} **${facts?.inventedFacts}** unexplained figures or contact details on any page |`),
  row(ready, `| Publishing guard | no publishing while placeholders remain | ${yes(ready?.pass)} strict build refuses now; with every placeholder filled it builds ${ready?.pages} pages with no placeholder |`),
  '',
);

// Lighthouse.
if (lh) {
  out(
    '## Lighthouse',
    '',
    `Lighthouse ${lhAll[0]?.lighthouseVersion}, default mobile settings (emulated phone, slow 4G, 4× slower CPU) and the desktop preset. Each page and form factor ran ${lh.runsPerPage} times; the table gives the median run (by Performance) and, after it, the lowest score in any run. Scores: Performance / Accessibility / Best Practices / SEO. Full reports of the median runs are in [lighthouse/](lighthouse/).`,
    '',
    '| Page | Mobile, median | Mobile, lowest | Desktop, median | Desktop, lowest |',
    '|---|---|---|---|---|',
  );
  for (const p of PAGES) {
    const m = lhAll.find((r) => r.page === p.slug && r.formFactor === 'mobile');
    const d = lhAll.find((r) => r.page === p.slug && r.formFactor === 'desktop');
    if (!m || !d) continue;
    out(`| ${p.name} | ${scores(m.median)} | ${scores(m.lowest)} | ${scores(d.median)} | ${scores(d.lowest)} |`);
  }
  const retried = lhAll.filter((r) => r.failedAttempt);
  if (retried.length) {
    out(
      '',
      '**Failed attempts, and the re-runs that replaced them.** Nothing in the site changed between an attempt and its re-run. This machine also runs other services: when they take the CPU, a page can get long main-thread tasks that are not its own work, and Lighthouse’s mobile setting multiplies them by four. Each run is shown as Performance score (total blocking time, main-thread time).',
      '',
      '| Page | Form factor | Failed attempt: median; lowest | Each failed-attempt run | Re-run: median; lowest | Each re-run |',
      '|---|---|---|---|---|---|',
    );
    const each = (runs) =>
      runs ? runs.map((x) => `${x.scores.performance} (${x.tbtMs} ms, ${x.mainThreadMs.toLocaleString('en-GB')} ms)`).join('; ') : 'not recorded';
    for (const r of retried) {
      out(
        `| ${name(r.page)} | ${r.formFactor} | ${scores(r.failedAttempt.median)}; ${scores(r.failedAttempt.lowest)} | ${each(r.failedAttempt.eachRun)} | ${scores(r.median)}; ${scores(r.lowest)} | ${each(r.eachRun)} |`,
      );
    }
  }
  out('', 'Audits that did not score full marks in at least one run:', '');
  const notes = lhAll.flatMap((r) => r.failingAudits.map((a) => `${name(r.page)}, ${r.formFactor}: ${a}`));
  out(...(notes.length ? notes.map((n) => `- ${n}`) : ['- none']), '');
  out(
    'The 404 page was audited at `/DeepRest/404.html`, the same file served with status 200: Lighthouse will not audit a page served with status 404.',
    '',
  );
  if (lh.supplementary?.length) {
    out(
      '**Supplementary: the booking page for a returning visitor who has already chosen to load Calendly**, so the calendar loads at once. This is not part of the pass mark: it shows what Calendly itself costs, and why it loads only when asked.',
      '',
      '| Form factor | Median | Lowest | Audits below full marks |',
      '|---|---|---|---|',
      ...lh.supplementary.map((r) => `| ${r.formFactor} | ${scores(r.median)} | ${scores(r.lowest)} | ${r.failingAudits.join('; ') || 'none'} |`),
      '',
    );
  }
}

// Layout.
if (layout) {
  out(
    '## Layout at every width',
    '',
    'Each page was loaded fresh at each width (360, 390 and 768 px emulated as touch phones and tablets; 1,024 px and up as desktops). After the page settled, the check measured: horizontal scroll (document width minus window width); layout shift, by adding up every `layout-shift` entry from the start of loading; every element reaching past the screen edge; every line of text clipped by the screen or by a box that hides overflow; and every pair of text lines covering each other. Pages with collapsed answers (the FAQ) were checked again with every answer open.',
    '',
    `| Page | ${WIDTHS.map((w) => `${w}`).join(' | ')} |`,
    `|---|${WIDTHS.map(() => '---').join('|')}|`,
  );
  for (const p of PAGES) {
    const cells = WIDTHS.map((w) => {
      const r = layout.find((x) => x.page === p.slug && x.width === w);
      return r ? `${yes(r.pass)} [png](screenshots/${p.slug}/${w}.png)` : '–';
    });
    out(`| ${p.name} | ${cells.join(' | ')} |`);
  }
  out(
    '',
    `Every cell links to its full-page screenshot. The FAQ also has screenshots with every answer open (\`screenshots/faq/<width>-answers-open.png\`). Headings used the site's own serif font in ${layout.filter((r) => r.serifLoaded).length} of ${layout.length} loads.`,
    '',
  );
}

// Calendly.
if (cal) {
  out(
    '## Calendly',
    '',
    'Tested with Puppeteer against the demo scheduling page. These checks run first, because they record the cookies the cookie notice lists; the site is then rebuilt with that list, which changes only the cookie notice’s table, before every other check. Calendly loads only after the visitor chooses it, so each test first checks that nothing came from Calendly before that choice. The booking flow was followed to Calendly\'s details form and never submitted, so no demo meeting was booked. On phone and tablet widths the test taps, as people do: Calendly ignores mouse clicks on touch screens.',
    '',
    '**Inline calendar on the booking page**',
    '',
    '| Width | Calendly requests before the choice | Cookies before the choice | Calendar loaded | Booking flow opened | Loads by itself when the choice is remembered | Layout shift then | Pass |',
    '|---|---|---|---|---|---|---|---|',
    ...inline.map(
      (r) =>
        `| ${r.width} | ${r.requestsBeforeChoice} | ${r.cookiesBeforeChoice} | ${yes(r.calendarLoaded)} | ${yes(r.flowOpened)} ${(r.flowSteps || []).map((s) => s.replace(/details form: .*/, 'details form')).join(' → ')} | ${yes(r.autoLoadsWhenRemembered)} | ${(r.clsWhenRemembered ?? 0).toFixed(4)} | ${yes(r.pass)} |`,
    ),
    '',
    `Screenshots of the details form reached at each width: [calendly/](calendly/) (\`inline-<width>.png\`). Content Security Policy violations recorded during these tests: ${inline.reduce((n, r) => n + (r.cspViolations?.length ?? 0), 0) + popup.reduce((n, r) => n + (r.cspViolations?.length ?? 0), 0)}.`,
    '',
    '**Popup from the header button**: on every page, the button first asks before loading Calendly, then opens Calendly\'s popup with the calendar drawn, which then closes; after a reload, with the choice remembered, the popup opens straight away.',
    '',
    `| Page | ${WIDTHS.join(' | ')} |`,
    `|---|${WIDTHS.map(() => '---').join('|')}|`,
    ...PAGES.map((p) => `| ${p.name} | ${WIDTHS.map((w) => {
      const r = popup.find((x) => x.page === p.slug && x.width === w);
      return r ? yes(r.pass) : '–';
    }).join(' | ')} |`),
    '',
    `Without JavaScript: ${yes(cal.noJs?.pass)} the header button is a plain link to the booking page, which explains that the calendar needs JavaScript and links to the booking page on Calendly's website.`,
    '',
  );
}

// HTML validation.
if (html) {
  out(
    '## HTML validation',
    '',
    `${html.checker}, the engine behind validator.w3.org/nu, run locally on every built page and the stylesheet.`,
    '',
    '| File | Errors | Warnings | Known CSP warnings |',
    '|---|---|---|---|',
    ...html.results.map((r) => `| ${r.file} | ${r.errors.length} | ${r.warnings.length} | ${r.knownCspWarnings.length} |`),
    '',
    'The known warnings are the checker\'s, not the browser\'s: checking files, it has no web origin for the page, so it cannot match the Content Security Policy\'s `\'self\'` and warns that the site\'s own stylesheet and script would be blocked. In Chrome the same policy blocked nothing: the Calendly tests record every violation and found none. Checking over HTTP instead was tried: the checker refuses `localhost` ("Forbidden host"), and through standard input the same warning appears.',
    '',
  );
}

// Links.
if (links) {
  const ext = links.distinctLinks.filter((l) => l.kind === 'external');
  const own = links.distinctLinks.filter((l) => l.kind.startsWith('own public address'));
  out(
    '## Links',
    '',
    `${links.checked} references on ${PAGES.length} pages (${links.distinct} distinct): every link, stylesheet, script, icon and \`#section\` target. Internal pages were fetched from the local server, and each \`#section\` was found on its page. Broken: **${links.broken.length}**.`,
    '',
    'External sites:',
    '',
    ...ext.map((l) => `- ${yes(l.ok)} ${l.status} ${l.resolved}`),
    '',
    `Telephone links: ${links.distinctLinks.filter((l) => l.kind === 'telephone').map((l) => `\`${l.href}\``).join(', ')}.`,
    '',
    `The site's own future public address (${own.length} canonical and sharing addresses) cannot answer until the site is published, so each was checked against the same page on the local server.`,
    '',
  );
}

// Placeholders and facts.
if (facts) {
  out(
    '## Placeholders and facts',
    '',
    `**${facts.placeholders} placeholders**, each listed with what is needed and where it appears in [PLACEHOLDERS.md](../PLACEHOLDERS.md): ${facts.placeholderKeys.map((k) => `\`${k}\``).join(', ')}.`,
    '',
    '| Page | Placeholder marks | Distinct placeholders | Unexplained figures or contact details |',
    '|---|---|---|---|',
    ...facts.pages.map((p) => `| ${name(p.page)} | ${p.placeholderMarks} | ${p.distinctPlaceholders} | ${p.flags.length} |`),
    '',
    `**Invented facts: ${facts.inventedFacts}.** The scan removes the placeholders from each page's visible text and then looks for money, percentages, email addresses, HCPC numbers, postcodes, long quotations and any figure at all. Every figure left must be one of these, each checked against its source:`,
    '',
    ...facts.verifiedFigures.map((v) => `- \`${v.text}\`: ${v.source}`),
    '',
    'Statements in the text, and where each was checked:',
    '',
    ...TEXT_SOURCES.map((t) => `- ${t}`),
    '',
    'There are no testimonials, outcomes or statistics. General wording about how sessions work is listed for the psychologist to check at the end of PLACEHOLDERS.md.',
    '',
  );
}

// PDFs.
const pdfDir = path.join(OUT, 'pdf');
if (fs.existsSync(pdfDir)) {
  out(
    '## PDFs for review',
    '',
    'Made with Chrome\'s print-to-PDF (Puppeteer `page.pdf`) at a desktop width of 1,440 px, each page as one continuous sheet, with the screen styles so the PDF matches the site.',
    '',
    '- All pages in one file: [verification/pdf/DeepRest-all-pages.pdf](pdf/DeepRest-all-pages.pdf)',
    ...fs
      .readdirSync(pdfDir)
      .filter((f) => f.endsWith('.pdf') && f !== 'DeepRest-all-pages.pdf')
      .map((f) => `- [verification/pdf/${f}](pdf/${f})`),
    '',
  );
}

out(
  '## Approaches that failed, and what replaced them',
  '',
  ...FAILED.map((f) => `- ${f}`),
  '',
  '## Limits of these checks',
  '',
  ...LIMITS.map((f) => `- ${f}`),
  '',
);

fs.writeFileSync(path.join(OUT, 'REPORT.md'), `${lines.join('\n')}\n`);
console.log(`Wrote ${path.relative(process.cwd(), path.join(OUT, 'REPORT.md'))}`);
