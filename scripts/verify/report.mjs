// Writes verification/REPORT.md from the JSON results the other checks leave in verification/.
import fs from 'node:fs';
import path from 'node:path';
import { OUT, PAGES, ROOT, WIDTHS } from './common.mjs';

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));

// Statements in the site's text that rest on outside facts, and where each was checked.
const TEXT_SOURCES = [
  `Nick's figures and words (five years mentoring students and young adults; young, which has played to his advantage because he has seen many people go through tech addiction and been able to get them out of it; a 100% satisfaction rate across 23 clients; the first five sessions free, as a diagnostic): his order of 19 October 2026, recorded in site.config.json under _sources`,
  'His full name, Nicholas Finnemore, used as data controller in the privacy policy: the name on his Google account',
  'The booking event, its optional question ("Please share anything that will help prepare for our meeting."), guests allowed, Google Calendar connection and Google Meet location: the Calendly event "Free diagnostic session" as configured on calendly.com/nicholas-finnemore/free-diagnostic',
  'Calendly confirmation emails carry links to cancel and reschedule: Calendly\'s standard invitee emails',
  'hello@deepestrest.com forwards to Nick\'s Gmail through Cloudflare Email Routing: the routing rule on his Cloudflare account',
  'Samaritans, 116 123, free from landlines and mobiles, day or night, 365 days a year: https://www.samaritans.org/how-we-can-help/contact-samaritan/',
  'ICO complaints and helpline 0303 123 1113: https://ico.org.uk/make-a-complaint/',
  'Calendly, LLC, Google LLC, Cloudflare, Inc. and GitHub, Inc. each state that they comply with the UK Extension to the EU-U.S. Data Privacy Framework: https://calendly.com/legal/privacy-notice, https://policies.google.com/privacy/frameworks, https://www.cloudflare.com/privacypolicy/, https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
  'UK law treats personal data sent to US organisations certified under the UK Extension as adequately protected: Data Protection (Adequacy) (United States of America) Regulations 2023, https://www.legislation.gov.uk/uksi/2023/1028/made',
  'GitHub Pages logs every visitor\'s IP address for security purposes: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages',
  'Health information is special category data; the rights listed; a reply within one month, extendable by two further months, usually free: UK GDPR Articles 9, 12 and 15 to 21',
];

const FAILED = [
  'Calendly sign-up with "Continue with Google" on calendly.com/signup returned to the log-in page with "No account exists" for his Google address, twice. Typing the address into the sign-up form first led to a page offering "Sign up with Google" with a terms box; that created the account.',
  'Calendly\'s Google sign-in first offered calendar access as an optional box, which was left unticked; sign-up then required the full Google Calendar permission, with no option. The alternative, signing up with a password, was not used, because agents do not create passwords. The permission was granted, as signing up with Google requires.',
  'Calendly\'s onboarding switched its Notetaker (meeting recording and transcripts) on by default. It was switched off before finishing, and the account shows Notetaker as not in use.',
  'Clicking by screen position in Nick\'s Chrome missed its targets: that window runs at 125% scaling, so screenshot pixels are 1.25 times page pixels. Clicks now go to elements, or to positions divided by 1.25.',
  'The facts scan read the "0%" inside "100%" as a separate percentage, matched "Article 6" before "6(1)(b)" and so left "(1)(b)" unexplained, and flagged the legal sense of "treat" ("UK law treats personal data...") as a clinical claim. The patterns were fixed for the first two; for the third the scan stayed strict and the privacy policy says "regards" and "handle" instead.',
  'Finding Calendly\'s demo page for the earlier build (every calendly.com address answers 200, as a single-page app) took several tries; the real booking link has now replaced it.',
  'The first look inside the Calendly iframe came after a fixed 8 seconds and found it empty: Calendly takes about 6 seconds to draw. The tests wait for the calendar\'s day buttons instead.',
  'A 760 px booking frame made Calendly scroll inside the frame at tablet widths. The frame is 1,130 px tall below 68rem, matching Calendly\'s stacked layout, and 760 px above.',
  'Mouse clicks inside Calendly did nothing on touch-emulated widths, because Calendly listens for taps there. The test taps on phones and tablets, and taps a time again if one is lost while the list slides in.',
  'The layout check reported collapsed FAQ answers as overlapping, because Chrome keeps closed `<details>` content in the layout. It skips text that is not drawn, and checks the FAQ again with every answer open.',
  'Validating over HTTP, to avoid the checker\'s CSP warnings: the Nu checker refuses `localhost` ("Forbidden host"). Files are checked directly; with --live, copies downloaded from the live site.',
  'Printing the booking page with the calendar loaded gave a blank frame: print-to-PDF does not draw a cross-origin iframe in its own process. That PDF is printed by a Chrome started without site isolation.',
  'Lighthouse on this machine scored About on mobile below 95 in one of three runs, three times over (lowest 93, then 94, then 84), and FAQ on desktop once (92; its re-run scored 100 in every run). The slow runs had 1.4 to 6 times the main-thread time of the fast runs on the same page (2,728 ms against about 450 ms at worst), while this machine was also running other services, including two Colab runners, at about 40% CPU. A filmstrip of one slow run showed a blank screen until 4.0 s although the page had finished loading at 0.34 s, so Chrome was not getting to paint, not waiting for the site. Re-running stopped there; PageSpeed Insights, which runs Lighthouse on Google\'s servers, was used as the second opinion below.',
  'PageSpeed Insights\' keyless API answered 429 (its shared daily quota used up), and its web page, opened signed out in a headless Chrome, answered "Unable to resolve" for the same reason. Run from a tab of its own in Nick\'s Chrome, signed in to Google, it worked; one page\'s mobile result timed out once and was re-run on its own.',
  'Two scripted edits (a Python find-and-replace) silently did nothing because of an escaping slip: the cookie comparison in the Calendly check, and the wrapping of result lists in the shared result writer. Both were found when result files lacked the expected fields (the layout rows of the report read "not run"), redone by hand, and the layout check re-run live. A third scripted edit broke a pattern in the PageSpeed check, which the syntax check caught at once. Every scripted edit is now checked with a search afterwards.',
  'On 22 October the live Calendly check failed once, inline at 768 px: Calendly lost the chosen time twice and showed no Next button. The same check alone passed straight after, and the whole live Calendly check, re-run, passed 71/71; the results above are from that re-run.',
  'On 22 October Lighthouse on this machine, against the live site, scored Home on mobile below 95 in one run of three, four times over (lowest 91, 86, 92 and 94, with medians of 99, 98, 94 and 98), while other sessions\' Chrome processes used about two CPU cores. Re-running stopped there; PageSpeed Insights scored every live page 100 in all four categories, mobile and desktop.',
];

// A re-run keeps the failed attempt before it, which keeps its own: every failed attempt, oldest first.
function failedAttempts(r) {
  const list = [];
  for (let a = r.failedAttempt; a; a = a.failedAttempt) list.unshift(a);
  return list;
}

const LIMITS = [
  'Only Chrome was used (Chrome for Testing, headless), with phones and tablets emulated. Safari, Firefox and real devices were not tested.',
  'Calendly is a third party: its layout, cookie list and cookie banner can change. The banner appeared from this machine\'s location, and may differ elsewhere.',
  'No booking was submitted, so no session was booked in Nick\'s calendar and Calendly\'s confirmation step and emails were not exercised.',
  'No email was sent to hello@deepestrest.com, since nothing is sent outside this machine without Nick\'s yes: the routing rule and DNS records were checked, delivery was not.',
  'Lighthouse scores vary from run to run and from machine to machine; the table gives the lowest score of every run as well as the median.',
  'The privacy policy and cookie notice were drafted for UK GDPR and PECR from the sources above. They have not been reviewed by a lawyer, and Nick, as data controller, should check them against how he handles bookings and emails (PLACEHOLDERS.md lists the wording to check).',
];

const read = (name) => {
  const file = path.join(OUT, name);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
};
const lh = read('lighthouse.json');
const layoutFile = read('layout.json');
const layout = layoutFile?.results ?? null;
const cal = read('calendly.json');
const html = read('html-validation.json');
const links = read('links.json');
const facts = read('facts.json');
const ready = read('publish-ready.json');
const hosting = read('live.json');
const psi = read('pagespeed.json');
const psiLowest = psi ? Math.min(...psi.results.flatMap((r) => [r.mobile, r.desktop].flatMap((x) => (x.scores ? Object.values(x.scores) : [0])))) : null;

const live = Boolean(layoutFile?.live);
const testedAt = layoutFile?.testedAt ?? '';
const yes = (b) => (b ? '✅' : '❌');
const where = (data) => (data ? (data.live ? 'live' : 'local') : '');
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
  live
    ? `Every check below ran against the **live site, ${testedAt}**, served by GitHub Pages under Nick's domain; the hosting check also confirmed that each live page is byte-for-byte the page built from this commit.`
    : `The site was tested as built in \`dist/\`, served locally the way GitHub Pages serves it (\`scripts/serve.mjs\`, at ${testedAt}).`,
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
const hostChecks = hosting?.checks ?? [];
out(
  '## Summary',
  '',
  '| Check | Target | Result |',
  '|---|---|---|',
  ...(hosting ? [`| Hosting: DNS, HTTPS, redirects, every page live and identical to the build | all pass | ${yes(hosting.pass)} ${hostChecks.filter((c) => c.ok).length}/${hostChecks.length} |`] : []),
  row(lh, `| Lighthouse, mobile and desktop, ${lhAll.length / 2} pages (${where(lh)}) | 95+ in Performance, Accessibility, Best Practices and SEO | ${yes(lhAll.length && lhAll.every((r) => r.pass))} ${lhAll.filter((r) => r.pass).length}/${lhAll.length} pass in every run; lowest score in any of ${lh?.runsPerPage} runs: **${lhLowest}**${lhAll.some((r) => r.failedAttempt) ? `; ${lhAll.filter((r) => r.failedAttempt).length} re-run after ${lhAll.reduce((n, r) => n + failedAttempts(r).length, 0)} failed attempts, shown below` : ''} |`),
  ...(psi ? [`| PageSpeed Insights (Lighthouse on Google's servers), mobile and desktop, ${psi.results.length} pages (live) | 95+ in all four categories | ${yes(psi.results.every((r) => r.pass))} ${psi.results.filter((r) => r.pass).length}/${psi.results.length} pages; lowest score: **${psiLowest}** |`] : []),
  row(layout, `| Horizontal scroll, ${WIDTHS.length} widths × ${PAGES.length} pages (${where(layoutFile)}) | 0 | ${yes(lay.length && lay.every((r) => r.horizontalScroll === 0))} largest: **${Math.max(...lay.map((r) => r.horizontalScroll))} px** over ${lay.length} page-widths |`),
  row(layout, `| Layout shift during load | under 0.1 | ${yes(lay.length && lay.every((r) => r.cls < 0.1))} largest: **${Math.max(...lay.map((r) => r.cls)).toFixed(4)}**; with the Calendly calendar auto-loading: ${Math.max(0, ...inline.map((r) => r.clsWhenRemembered ?? 0)).toFixed(4)} |`),
  row(layout, `| Layout faults: text cut off or overlapping, elements past the screen edge | 0 | ${yes(lay.length && lay.every((r) => !r.cut.length && !r.overlaps.length && !r.offenders.length))} **${lay.reduce((n, r) => n + r.cut.length + r.overlaps.length + r.offenders.length, 0)}**: ${lay.reduce((n, r) => n + r.cut.length, 0)} cut, ${lay.reduce((n, r) => n + r.overlaps.length, 0)} overlapping, ${lay.reduce((n, r) => n + r.offenders.length, 0)} past the edge |`),
  row(cal, `| Calendly inline calendar, after consent: loads and opens its booking flow (${where(cal)}) | every width | ${yes(inline.length && inline.every((r) => r.pass))} ${inline.filter((r) => r.pass).length}/${inline.length} widths; 0 Calendly requests and 0 cookies before consent: ${yes(inline.every((r) => r.requestsBeforeChoice === 0 && r.cookiesBeforeChoice === 0))} |`),
  row(cal, `| Calendly popup from the header button, after consent | every page, every width | ${yes(popup.length && popup.every((r) => r.pass))} ${popup.filter((r) => r.pass).length}/${popup.length} page-widths |`),
  row(html, `| HTML validator (W3C Nu HTML Checker, ${where(html)}) | 0 errors | ${yes(htmlErrors === 0)} **${htmlErrors} errors** in ${html?.results.length} files; ${htmlWarnings} other warnings; ${htmlKnown} known CSP warnings, explained below |`),
  row(links, `| Broken links (${where(links)}) | 0 | ${yes(links && links.broken.length === 0)} **${links?.broken.length}** broken of ${links?.checked} references (${links?.distinct} distinct) |`),
  row(facts, `| Placeholders | 0 | ${yes(facts?.placeholders === 0)} **${facts?.placeholders}** |`),
  row(ready, `| \`npm run build:strict\` | passes | ${yes(ready?.pass)} builds ${ready?.pages} pages, none showing a placeholder, with the booking link ${ready?.calendlyUrl} |`),
  row(facts, `| Protected titles used for Nick (psychologist, therapist, counsellor, HCPC and BPS titles) | 0 | ${yes(facts?.protectedTitles === 0)} **${facts?.protectedTitles}** on any page, in its text, title, description or sharing tags |`),
  row(facts, `| Clinical or medical claims | 0 | ${yes(facts?.clinicalClaims === 0)} **${facts?.clinicalClaims}** |`),
  row(facts, `| Invented facts | 0 | ${yes(facts?.inventedFacts === 0)} **${facts?.inventedFacts}** unexplained figures or contact details |`),
  row(facts, `| Home page: headline figures and the free-diagnostic offer | shown | ${yes(facts?.headline && Object.values(facts.headline).every(Boolean))} ${config.mentor.satisfaction} satisfaction across ${config.mentor.clients} clients; five years; "Your first five sessions are free, as a diagnostic" |`),
  '',
);

// Hosting.
if (hosting) {
  out(
    '## Hosting',
    '',
    `Checked from this machine against ${hosting.site}, with DNS asked of 1.1.1.1 and 8.8.8.8.`,
    '',
    '| Check | Result | Detail |',
    '|---|---|---|',
    ...hostChecks.map((c) => `| ${c.name} | ${yes(c.ok)} | ${typeof c.detail === 'string' ? c.detail : `\`${JSON.stringify(c.detail).replace(/\|/g, '\\|')}\``} |`),
    '',
  );
}

// PageSpeed Insights.
if (psi) {
  const cell = (x) => (x.scores ? `${Object.values(x.scores).join(' / ')} (LCP ${x.metrics.lcp}, SI ${x.metrics.si})` : `error: ${x.error}`);
  out(
    '## PageSpeed Insights',
    '',
    "Lighthouse run on Google's own servers through PageSpeed Insights (pagespeed.web.dev), against the live site, so this machine's load plays no part (`scripts/verify/pagespeed.mjs`). Scores: Performance / Accessibility / Best Practices / SEO. Each row links to Google's report.",
    '',
    '| Page | Mobile | Desktop | Report |',
    '|---|---|---|---|',
    ...psi.results.map((r) => `| ${name(r.page)} | ${cell(r.mobile)} | ${cell(r.desktop)} | [pagespeed.web.dev](${r.report}) |`),
    '',
  );
}

// Lighthouse.
if (lh) {
  out(
    '## Lighthouse',
    '',
    `Lighthouse ${lhAll[0]?.lighthouseVersion}, default mobile settings (emulated phone, slow 4G, 4× slower CPU) and the desktop preset, against ${lh.testedAt}. Each page and form factor ran ${lh.runsPerPage} times; the table gives the median run (by Performance) and, after it, the lowest score in any run. Scores: Performance / Accessibility / Best Practices / SEO. Full reports of the median runs are in [lighthouse/](lighthouse/).`,
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
      '**Failed attempts, and the re-runs that replaced them.** Nothing in the site changed between an attempt and its re-run. Every attempt is listed, oldest first. Each run is shown as Performance score (total blocking time, main-thread time).',
      '',
      '| Page | Form factor | Attempt | Median; lowest | Each run |',
      '|---|---|---|---|---|',
    );
    const each = (runs) =>
      runs ? runs.map((x) => `${x.scores.performance} (${x.tbtMs.toLocaleString('en-GB')} ms, ${x.mainThreadMs.toLocaleString('en-GB')} ms)`).join('; ') : 'not recorded';
    for (const r of retried) {
      const all = [...failedAttempts(r), r];
      all.forEach((a, i) => out(`| ${name(r.page)} | ${r.formFactor} | ${i + 1} of ${all.length}: ${a === r ? (r.pass ? 'passed' : 'failed') : 'failed'} | ${scores(a.median)}; ${scores(a.lowest)} | ${each(a.eachRun)} |`));
    }
  }
  out('', 'Audits that did not score full marks in at least one run:', '');
  const notes = lhAll.flatMap((r) => r.failingAudits.map((a) => `${name(r.page)}, ${r.formFactor}: ${a}`));
  out(...(notes.length ? notes.map((n) => `- ${n}`) : ['- none']), '');
  out('The 404 page was audited at `404.html`, the same file served with status 200: Lighthouse will not audit a page served with status 404.', '');
  if (lh.supplementary?.length) {
    out(
      '**Supplementary: the booking page for a returning visitor who has already agreed to load Calendly**, so the calendar loads at once. This is not part of the pass mark: it shows what Calendly itself costs, and why it loads only when asked.',
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
    `Each page was loaded fresh at each width from ${testedAt} (360, 390 and 768 px emulated as touch phones and tablets; 1,024 px and up as desktops). After the page settled, the check measured: horizontal scroll (document width minus window width); layout shift, by adding up every \`layout-shift\` entry from the start of loading; every element reaching past the screen edge; every line of text clipped by the screen or by a box that hides overflow; and every pair of text lines covering each other. The FAQ was checked again with every answer open.`,
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
    `Every cell links to its full-page screenshot. The FAQ also has screenshots with every answer open (\`screenshots/faq/<width>-answers-open.png\`). Headings used the site's own serif font in ${layout.filter((r) => r.serifLoaded).length} of ${layout.length} loads. Console errors: ${layout.reduce((n, r) => n + r.consoleErrors.length, 0)}.`,
    '',
  );
}

// Calendly.
if (cal) {
  const fields = inline.find((r) => r.flowSteps?.some((s) => s.startsWith('details form')))?.flowSteps.find((s) => s.startsWith('details form'));
  out(
    '## Calendly',
    '',
    `Tested with Puppeteer against ${cal.testedAt}, with the booking link ${config.calendly.url}. Calendly loads only after the visitor agrees, so each test first checks that nothing came from Calendly before that choice. The booking flow was followed to Calendly's details form and never submitted, so nothing was booked in Nick's calendar. On phone and tablet widths the test taps, as people do: Calendly ignores mouse clicks on touch screens.${fields ? ` The details form asks for: ${fields.replace('details form: ', '')}.` : ''}`,
    '',
    '**Inline calendar on the booking page**',
    '',
    '| Width | Calendly requests before consent | Cookies before consent | Calendar loaded | Booking flow opened | Loads by itself when the choice is remembered | Layout shift then | Pass |',
    '|---|---|---|---|---|---|---|---|',
    ...inline.map(
      (r) =>
        `| ${r.width} | ${r.requestsBeforeChoice} | ${r.cookiesBeforeChoice} | ${yes(r.calendarLoaded)} | ${yes(r.flowOpened)} ${(r.flowSteps || []).map((s) => s.replace(/details form: .*/, 'details form')).join(' → ')} | ${yes(r.autoLoadsWhenRemembered)} | ${(r.clsWhenRemembered ?? 0).toFixed(4)} | ${yes(r.pass)} |`,
    ),
    '',
    `Screenshots of the details form reached at each width: [calendly/](calendly/) (\`inline-<width>.png\`). Content Security Policy violations recorded during these tests: ${inline.reduce((n, r) => n + (r.cspViolations?.length ?? 0), 0) + popup.reduce((n, r) => n + (r.cspViolations?.length ?? 0), 0)}.`,
    ...(cal.cookieComparison ? ['', `Cookies after loading the calendar, compared with the cookie notice's list: ${cal.cookieComparison.notListed.length} not listed${cal.cookieComparison.notListed.length ? ` (${cal.cookieComparison.notListed.join(', ')})` : ''}; ${cal.cookieComparison.listedNotSeen.length} listed but not seen this time${cal.cookieComparison.listedNotSeen.length ? ` (${cal.cookieComparison.listedNotSeen.join(', ')})` : ''}.`] : []),
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
    `${html.checker}, the engine behind validator.w3.org/nu, run locally on every page and the stylesheet${html.live ? `, as downloaded from ${html.testedAt}` : ' in dist/'}.`,
    '',
    '| File | Errors | Warnings | Known CSP warnings |',
    '|---|---|---|---|',
    ...html.results.map((r) => `| ${r.file} | ${r.errors.length} | ${r.warnings.length} | ${r.knownCspWarnings.length} |`),
    '',
    'The known warnings are the checker\'s, not the browser\'s: checking files, it has no web origin for the page, so it cannot match the Content Security Policy\'s `\'self\'` and warns that the site\'s own stylesheet and script would be blocked. In Chrome the same policy blocked nothing: the Calendly tests record every violation and found none.',
    '',
  );
}

// Links.
if (links) {
  const ext = links.distinctLinks.filter((l) => l.kind === 'external');
  out(
    '## Links',
    '',
    `${links.checked} references on ${PAGES.length} pages (${links.distinct} distinct), fetched from ${links.testedAt}: every link, stylesheet, script, icon and \`#section\` target, and each \`#section\` was found on its page. Broken: **${links.broken.length}**.`,
    '',
    'External sites:',
    '',
    ...ext.map((l) => `- ${yes(l.ok)} ${l.status} ${l.resolved}`),
    '',
    `Telephone links: ${links.distinctLinks.filter((l) => l.kind === 'telephone').map((l) => `\`${l.href}\``).join(', ')}. Email links: ${links.distinctLinks.filter((l) => l.kind === 'email').map((l) => `\`${l.href}\``).join(', ')}.`,
    '',
  );
}

// Facts.
if (facts) {
  out(
    '## Facts, protected titles and clinical claims',
    '',
    `**Placeholders: ${facts.placeholders}.** Facts that are not known were left out of the pages rather than shown as placeholders; [PLACEHOLDERS.md](../PLACEHOLDERS.md) lists them under "Left out for want of a fact".`,
    '',
    '| Page | Unexplained figures or contact details | Protected titles | Clinical claims |',
    '|---|---|---|---|',
    ...facts.pages.map((p) => `| ${name(p.page)} | ${p.flags.length} | ${p.protectedTitles.length} | ${p.clinicalClaims.length} |`),
    '',
    `**Protected titles: ${facts.protectedTitles}.** Each page's visible text, title, description and sharing tags were searched for: ${facts.protectedPatterns.map((p) => `\`${p}\``).join(', ')}.`,
    '',
    `**Clinical claims: ${facts.clinicalClaims}.** The same text was searched for: ${facts.clinicalPatterns.map((p) => `\`${p}\``).join(', ')}. "Diagnostic" is Nick's own word for the free sessions; the site says plainly that mentoring is not therapy or medical care.`,
    '',
    `**Invented facts: ${facts.inventedFacts}.** The scan looks for money, percentages, email addresses, postcodes, long quotations and any figure at all. Every one left must be one of these, each checked against its source:`,
    '',
    ...facts.verifiedFigures.map((v) => `- \`${v.text}\`: ${v.source}`),
    '',
    'Statements in the text, and where each was checked:',
    '',
    ...TEXT_SOURCES.map((t) => `- ${t}`),
    '',
    'There are no testimonials. General wording about how mentoring works, beyond Nick\'s own words, is listed for him to check at the end of PLACEHOLDERS.md.',
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
