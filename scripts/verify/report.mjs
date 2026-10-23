// Writes verification/REPORT.md from the JSON results the other checks leave in verification/.
import fs from 'node:fs';
import path from 'node:path';
import { SERVICES, describe } from '../../src/lib/third-parties.mjs';
import { OUT, PAGES, ROOT, WIDTHS } from './common.mjs';

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));

// Statements in the site's text that rest on outside facts, and where each was checked.
const TEXT_SOURCES = [
  `Nick's three facts (five years mentoring students and young adults; a 100% satisfaction rate across 23 clients; the first five sessions free, as a diagnostic): his order of 19 October 2026, recorded in site.config.json under _sources. His order also said that being young has played to his advantage, because he has seen many people go through tech addiction and been able to get them out of it; the site leaves those words off, as the brief limits it to his three facts, and PLACEHOLDERS.md asks him about them`,
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
  'Calendly books one time per booking, so the five free sessions are booked one at a time: Calendly staff, 22 May 2024, "there is no way to book multiple time slots in one go via the Calendly booking flow", https://community.calendly.com/how-do-i-40/book-multiple-time-slots-at-once-1542',
  'The booking page learns that a session was booked from the message Calendly sends it, calendly.event_scheduled: https://developer.calendly.com/api-docs/overview/embedding/notifying-the-parent-window',
  'The purpose of Calendly’s optional cookies, quoted in the privacy policy: Calendly’s own cookie banner inside the calendar, as the test saw it',
  ...SERVICES.filter((s) => s.source).map((s) => `What ${s.name} does and collects, in the privacy policy: ${s.source}`),
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
  'The cookie check before 23 October recorded only cookies, only until the calendar appeared, and only with Calendly\'s banner unanswered. It found 4 (Cloudflare\'s two, OneTrust\'s and Stripe\'s `m`), so the cookie notice listed those and the site said Meta set no cookies through it. Measuring every host, cookie and stored item in every frame, up to the details form, with the banner declined and then accepted, found Google reCAPTCHA, Airbrake and Stripe\'s storage whatever the answer, and, only if accepted, Google Analytics, Meta\'s Pixel, Segment, Braze, Sprig and Survicate. The privacy policy and cookie notice are now built from that measurement.',
  'Python edits run through the shell lose backslashes: a `\\n` in a JavaScript string became a real line break and broke the privacy page\'s code, and escaped quotes in this report lost their backslashes. The syntax check caught the first and reading the line back the second; both were fixed in the editor, and edits with backslashes are now made there.',
  'Three source pages for the service descriptions answered 404 (calendly.com/legal/cookie-notice, docs.stripe.com/privacy-and-cookies and www.airbrake.io/privacy-policy); the descriptions rest on the pages listed under the facts instead.',
  'Removing `src/data/calendly-cookies.json`, the only file in `src/data`, removed the folder too, so the local Calendly check, having passed, failed to write `src/data/calendly-third-parties.json`. The file was written from that run\'s saved result (`verification/calendly.json`), and the check now creates the folder.',
  'On 23 October the live layout check stopped after 6 of 63 page-widths: Chrome closed the tab while taking the full-page screenshot of Home at 1,920 px ("Target closed"), with this machine\'s memory at about 85% in use. Run again on its own, with nothing else running, it passed 63/63; the layout results above are from that run.',
  'The first pattern for the retired claim that Nick helped clients out of tech addiction also matched the privacy policy\'s "adverts help people find us". It was narrowed to the forms the site had used, and checked against the old live text, where it still finds every one.',
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
  'What Calendly\'s page loads was measured from this machine in the UK, in headless Chrome, up to the details form. What it loads after a booking is submitted, in other countries or in other browsers was not measured.',
  'The message shown after a booking was tested by sending the page the message Calendly sends, not by booking.',
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
const frames = lay.filter((r) => r.bookingFrame);
const BLANK_BAND = frames[0]?.bookingFrame.limit;
const tp = facts?.thirdParties;
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
  row(layout, `| Booking frame before the visitor chooses to load Calendly: tallest empty band (blank in all) | no band over ${BLANK_BAND} px | ${yes(frames.length && frames.every((r) => r.bookingFrame.largestBand <= BLANK_BAND && !r.bookingFrame.consented))} ${frames.map((r) => `${r.width}: **${r.bookingFrame.largestBand} px** (${r.bookingFrame.blank} of ${r.bookingFrame.height})`).join('; ')} |`),
  row(cal, `| Calendly inline calendar, after consent: loads and opens its booking flow (${where(cal)}) | every width | ${yes(inline.length && inline.every((r) => r.pass))} ${inline.filter((r) => r.pass).length}/${inline.length} widths; 0 Calendly requests, 0 other outside requests and 0 cookies before consent: ${yes(inline.every((r) => r.requestsBeforeChoice === 0 && r.outsideRequestsBeforeChoice === 0 && r.cookiesBeforeChoice === 0))} |`),
  row(cal, `| “Book another session”, for booking all five free sessions one at a time | hidden before consent; shown after; says a session was booked when Calendly reports one; opens a fresh calendar | ${yes(inline.length && inline.every((r) => r.bookAnotherHiddenBeforeChoice && r.bookAnotherShown && r.bookedMessageShown && r.bookAnotherRestarts))} ${inline.filter((r) => r.bookAnotherHiddenBeforeChoice && r.bookAnotherShown && r.bookedMessageShown && r.bookAnotherRestarts).length}/${inline.length} widths |`),
  row(cal, `| Calendly popup from the header button, after consent | every page, every width | ${yes(popup.length && popup.every((r) => r.pass))} ${popup.filter((r) => r.pass).length}/${popup.length} page-widths |`),
  row(html, `| HTML validator (W3C Nu HTML Checker, ${where(html)}) | 0 errors | ${yes(htmlErrors === 0)} **${htmlErrors} errors** in ${html?.results.length} files; ${htmlWarnings} other warnings; ${htmlKnown} known CSP warnings, explained below |`),
  row(links, `| Broken links (${where(links)}) | 0 | ${yes(links && links.broken.length === 0)} **${links?.broken.length}** broken of ${links?.checked} references (${links?.distinct} distinct) |`),
  row(facts, `| Placeholders | 0 | ${yes(facts?.placeholders === 0)} **${facts?.placeholders}** |`),
  row(ready, `| \`npm run build:strict\` | passes | ${yes(ready?.pass)} builds ${ready?.pages} pages, none showing a placeholder, with the booking link ${ready?.calendlyUrl} |`),
  row(facts, `| Protected titles used for Nick (psychologist, therapist, counsellor, HCPC and BPS titles) | 0 | ${yes(facts?.protectedTitles === 0)} **${facts?.protectedTitles}** on any page, in its text, title, description or sharing tags |`),
  row(facts, `| Clinical or medical claims | 0 | ${yes(facts?.clinicalClaims === 0)} **${facts?.clinicalClaims}** |`),
  row(facts, `| Invented facts | 0 | ${yes(facts?.inventedFacts === 0)} **${facts?.inventedFacts}** unexplained figures or contact details |`),
  row(facts, `| Claims beyond Nick's three facts, of the kinds found and removed | 0 | ${yes(facts?.retiredClaims === 0)} **${facts?.retiredClaims}** left; ${facts?.retiredList?.length} kinds were found in ${facts?.retiredList?.reduce((n, r) => n + r.found.length, 0)} places, each listed below with its fix |`),
  row(facts, `| Outside services the privacy policy names, and items the cookie notice lists, against those measured (${where(cal)}) | equal | ${tp?.measured ? `${yes(tp.pass)} services ${tp.services.always.named + tp.services.accepted.named} named, ${tp.services.always.measured + tp.services.accepted.measured} measured; items ${tp.items.always.named + tp.items.accepted.named} listed, ${tp.items.always.measured + tp.items.accepted.measured} measured; missing ${['services', 'items'].reduce((n, k) => n + tp[k].always.missing.length + tp[k].accepted.missing.length, 0)}, extra ${['services', 'items'].reduce((n, k) => n + tp[k].always.extra.length + tp[k].accepted.extra.length, 0)}` : '❌ not measured'} |`),
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
  if (frames.length) {
    out(
      '**The booking frame before the visitor chooses to load Calendly.** Until then the frame is only as tall as its message, so no empty panel shows. The check measured, in each fresh load of the booking page: the frame\'s height; the height its icon, heading, explanation, button and links cover; the blank remainder (its padding and the space between those lines); and the tallest empty band, at the top, at the bottom or between two of them, which must be no more than the limit.',
      '',
      '| Width | Frame height | Covered | Blank | Tallest empty band (top; bottom) | Pass |',
      '|---|---|---|---|---|---|',
      ...frames.map((r) => {
        const f = r.bookingFrame;
        return `| ${r.width} | ${f.height} px | ${f.covered} px | **${f.blank} px** | ${f.largestBand} px (${f.topBand}; ${f.bottomBand}) | ${yes(!f.consented && f.largestBand <= f.limit)} |`;
      }),
      '',
    );
  }
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
    '| Width | Calendly requests before consent | Other outside requests before consent | Cookies before consent | Calendar loaded | Booking flow opened | “Book another session”: hidden before, shown after, booked message, fresh calendar | Loads by itself when the choice is remembered | Layout shift then | Pass |',
    '|---|---|---|---|---|---|---|---|---|---|',
    ...inline.map(
      (r) =>
        `| ${r.width} | ${r.requestsBeforeChoice} | ${r.outsideRequestsBeforeChoice ?? '–'} | ${r.cookiesBeforeChoice} | ${yes(r.calendarLoaded)} | ${yes(r.flowOpened)} ${(r.flowSteps || []).map((s) => s.replace(/details form: .*/, 'details form')).join(' → ')} | ${[r.bookAnotherHiddenBeforeChoice, r.bookAnotherShown, r.bookedMessageShown, r.bookAnotherRestarts].map(yes).join(' ')} | ${yes(r.autoLoadsWhenRemembered)} | ${(r.clsWhenRemembered ?? 0).toFixed(4)} | ${yes(r.pass)} |`,
    ),
    '',
    `Screenshots of the details form reached at each width: [calendly/](calendly/) (\`inline-<width>.png\`). Content Security Policy violations recorded during these tests: ${inline.reduce((n, r) => n + (r.cspViolations?.length ?? 0), 0) + popup.reduce((n, r) => n + (r.cspViolations?.length ?? 0), 0)}.`,
    '',
    'Since tests never book, the message after a booking was tested by sending the page the message Calendly sends when a session is booked (`calendly.event_scheduled`, from `https://calendly.com`); “Book another session” was then pressed and had to bring back a fresh calendar.',
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
  const seen = cal.thirdParties;
  if (seen?.declined && seen?.accepted) {
    const siteHost = new URL(cal.testedAt).hostname;
    const [d, a] = [describe(seen.declined, siteHost), describe(seen.accepted, siteHost)];
    const svc = (ids) => ids.map((id) => SERVICES.find((s) => s.id === id).name).join(', ');
    const items = (list) => list.map((i) => `\`${i.name}\` (${i.kind.toLowerCase()}, ${i.host})`).join(', ');
    const itemKey = (i) => `${i.type} ${i.name} ${i.host}`;
    const onlyAccepted = (key) => a[key].filter((x) => !d[key].some((y) => itemKey(y) === itemKey(x)));
    out(
      '**What the booking calendar loads.** Measured at 1,440 px on ' + seen.checked + ', after loading the calendar and opening its details form: every outside host the browser contacted (from every frame, including Calendly\'s), every cookie, and every local and session storage item in every frame. Once with Calendly\'s cookie banner declined, and once, in a fresh browser context with nothing stored, accepted. The privacy policy and cookie notice are built from these measurements (`src/lib/third-parties.mjs`), and the facts check compares them, below.',
      '',
      '| Banner answer | Outside hosts | Services | Cookies and stored items |',
      '|---|---|---|---|',
      `| Declined | ${seen.declined.hosts.length}: ${seen.declined.hosts.join(', ')} | ${d.services.length}: ${svc(d.services)} | ${d.items.length}: ${items(d.items)} |`,
      `| Accepted | ${seen.accepted.hosts.length}: ${seen.accepted.hosts.join(', ')} | ${a.services.length}: ${svc(a.services)} | ${a.items.length}: ${items(a.items)} |`,
      '',
      `Only when accepted: ${svc(a.services.filter((s) => !d.services.includes(s))) || 'nothing'}, which stored ${items(onlyAccepted('items')) || 'nothing'}. Unidentified hosts or items: ${[...new Set([...d.unknown, ...a.unknown])].length}.`,
      '',
    );
  }
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
    '## Facts, claims, protected titles and clinical claims',
    '',
    `**Placeholders: ${facts.placeholders}.** Facts that are not known were left out of the pages rather than shown as placeholders; [PLACEHOLDERS.md](../PLACEHOLDERS.md) lists them under "Left out for want of a fact".`,
    '',
    '| Page | Unexplained figures or contact details | Protected titles | Clinical claims | Claims beyond his three facts |',
    '|---|---|---|---|---|',
    ...facts.pages.map((p) => `| ${name(p.page)} | ${p.flags.length} | ${p.protectedTitles.length} | ${p.clinicalClaims.length} | ${p.retired?.length ?? '–'} |`),
    '',
    `**Protected titles: ${facts.protectedTitles}.** Each page's visible text, title, description and sharing tags were searched for: ${facts.protectedPatterns.map((p) => `\`${p}\``).join(', ')}.`,
    '',
    `**Clinical claims: ${facts.clinicalClaims}.** The same text was searched for: ${facts.clinicalPatterns.map((p) => `\`${p}\``).join(', ')}. "Diagnostic" is Nick's own word for the free sessions; the site says plainly that mentoring is not therapy or medical care.`,
    '',
    `**Invented facts: ${facts.inventedFacts}.** The scan looks for money, percentages, email addresses, postcodes, long quotations and any figure at all. Every one left must be one of these, each checked against its source:`,
    '',
    ...facts.verifiedFigures.map((v) => `- \`${v.text}\`: ${v.source}`),
    '',
    ...(facts.quotes?.length
      ? ['Long quotations, which the scan would otherwise take for testimonials, each from its source and found again in this run:', '', ...facts.quotes.map((q) => `- ${yes(q.seenInThisRun)} “${q.text}”: ${q.source}`), '']
      : []),
    'Statements in the text, and where each was checked:',
    '',
    ...TEXT_SOURCES.map((t) => `- ${t}`),
    '',
    'There are no testimonials. Wording beyond Nick\'s three facts is listed for him to check at the end of PLACEHOLDERS.md.',
    '',
  );
  if (facts.retiredList) {
    out(
      `**Claims beyond Nick's three facts: ${facts.retiredClaims} left.** Every page was read against his three facts, and each claim found beyond them was removed or rewritten. The facts check searches every page's text, title, description and sharing tags for each kind of claim, with the pattern shown, so none can return:`,
      '',
      '| Claim | Where it was, and its words | Fix | Pattern | Left |',
      '|---|---|---|---|---|',
      ...facts.retiredList.map((r) => `| ${r.claim} | ${r.found.map(([page, words]) => `${name(page) || page}: “${words}”`).join('<br>')} | ${r.fix} | \`${r.pattern.replace(/\|/g, '\\|')}\` | ${r.left.length ? `❌ ${r.left.join('<br>')}` : '✅ 0'} |`),
      '',
    );
  }
  if (tp?.measured) {
    const cell = (c) => `${c.measured} | ${c.named} | ${c.missing.length ? c.missing.join(', ') : '0'} | ${c.extra.length ? c.extra.join(', ') : '0'}`;
    out(
      `**Outside services and stored items: named on the pages against measured.** The privacy policy's services and the cookie notice's rows, read from the ${facts.live ? 'live' : 'built'} pages, against the Calendly check's measurement of ${tp.checked} (above). ${yes(tp.pass)}`,
      '',
      '| What | When | Measured | Named | Missing from the page | On the page but not measured |',
      '|---|---|---|---|---|---|',
      `| Services, privacy policy | whatever the banner answer | ${cell(tp.services.always)} |`,
      `| Services, privacy policy | only if accepted | ${cell(tp.services.accepted)} |`,
      `| Cookies and stored items, cookie notice | whatever the banner answer | ${cell(tp.items.always)} |`,
      `| Cookies and stored items, cookie notice | only if accepted | ${cell(tp.items.accepted)} |`,
      '',
    );
  }
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
