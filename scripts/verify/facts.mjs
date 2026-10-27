// Placeholders, invented facts, protected titles and clinical claims, on every page.
//  - Counts the placeholders in site.config.json, checks each is listed in PLACEHOLDERS.md,
//    and that every placeholder marked on a page is one of them.
//  - Scans the visible text of every page, with placeholders removed, for anything that
//    looks like a practice fact: money, percentages, email addresses, phone numbers,
//    postcodes, quotations and any other figures. Each figure must be on the list below
//    of facts checked against the source given; anything else fails.
//  - Scans the visible text and the page's title, description and sharing tags for
//    protected professional titles, for clinical or medical claims and for the claims beyond
//    Nick's three facts that the site has retired (claims.mjs, RETIRED): there must be none.
//  - Holds the description of Nick's Calendly event, which the booking calendar shows, to the
//    same rules, as scripts/verify/calendly.mjs read it in the same run.
//  - Compares the outside services the privacy policy names, and the cookies and stored items
//    the cookie notice lists, with those scripts/verify/calendly.mjs measured in the same run
//    (verification/calendly.json): nothing may be missing or extra.
//   node scripts/verify/facts.mjs [--live]
//   node scripts/verify/facts.mjs --self-test   the retired claims' patterns, against the
//     wordings they were written for and the live pages before this turn's fixes
import fs from 'node:fs';
import path from 'node:path';
import { listPlaceholders } from '../../src/lib/facts.mjs';
import { describe, thirdParties as recorded } from '../../src/lib/third-parties.mjs';
import { BASE, OUT, PAGES, ROOT, pageHtml, writeJson } from './common.mjs';
import { CLINICAL, PROTECTED, RETIRED, findClaims, findRetired } from './claims.mjs';

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const NICK = "Nick's own words, his order of 19 October 2026 (site.config.json, _sources)";

// Every figure the site states, and where it was checked.
const VERIFIED = [
  { text: config.mentor.satisfaction, source: `${NICK}: "a 100% satisfaction rate across 23 clients"` },
  { text: String(config.mentor.clients), source: `${NICK}: 23 clients` },
  { text: String(config.mentor.years), source: `${NICK}: five years of mentoring (shown as the figure 5 in the figures panel)` },
  { text: '999', source: 'UK emergency number' },
  { text: '111', source: 'NHS 111' },
  { text: '116 123', source: 'Samaritans, https://www.samaritans.org/how-we-can-help/contact-samaritan/ (free, day or night, 365 days a year)' },
  { text: '365', source: 'Samaritans page above: "365 days a year"' },
  { text: '0303 123 1113', source: 'ICO helpline, https://ico.org.uk/make-a-complaint/' },
  { text: '2018', source: 'Data Protection Act 2018 (UK statute)' },
  { text: '6(1)(a)', source: 'UK GDPR Article 6(1)(a), consent' },
  { text: '6(1)(b)', source: 'UK GDPR Article 6(1)(b), contract' },
  { text: '6(1)(c)', source: 'UK GDPR Article 6(1)(c), legal obligation' },
  { text: '6(1)(d)', source: 'UK GDPR Article 6(1)(d), vital interests' },
  { text: '6(1)(f)', source: 'UK GDPR Article 6(1)(f), legitimate interests' },
  { text: '9(2)(a)', source: 'UK GDPR Article 9(2)(a), explicit consent' },
  { text: 'Article 6', source: 'UK GDPR' },
  { text: 'Article 9', source: 'UK GDPR' },
  { text: '404', source: 'HTTP status of the error page' },
  { text: config.privacy.lastUpdated, source: 'the date the privacy policy was last updated (site.config.json, privacy.lastUpdated)' },
  { text: `© ${new Date().getFullYear()}`, source: 'year of the build' },
];

// Legal references appear both alone and after "Article", as in "Article 6(1)(b)".
for (const v of VERIFIED.filter((x) => /^\d\(/.test(x.text))) VERIFIED.push({ text: `Article ${v.text}`, source: v.source });

// The one email address the site may show, and where it comes from.
const EMAILS = [{ text: config.practice.email, source: 'site.config.json, practice.email (Cloudflare Email Routing to Nick)' }];

// The Calendly check's results from this run: what the booking calendar loaded, and the text
// of the calendar, Calendly's cookie banner included.
const calendlyFile = path.join(OUT, 'calendly.json');
const calendly = fs.existsSync(calendlyFile) ? JSON.parse(fs.readFileSync(calendlyFile, 'utf8')) : null;

// How long each cookie the cookie notice lists lasts, as the Calendly check measured it.
const lists = recorded(new URL(config.site.url).hostname);
for (const lasts of new Set([...(lists?.always.items ?? []), ...(lists?.optional.items ?? [])].map((i) => i.lasts).filter((t) => /\d/.test(t)))) {
  VERIFIED.push({ text: lasts, source: `how long a cookie on the cookie notice lasts, from the time it had left when scripts/verify/calendly.mjs measured it (src/data/calendly-third-parties.json)` });
}

// Quotations long enough to look like testimonials, each from its source. Each must also be
// in the text of Calendly's calendar as the Calendly check saw it in this run.
const QUOTES = [
  {
    text: 'to improve and personalize your experience, to understand website interactions (including clicks, cursor movement and screen recordings), and for marketing',
    source: 'Calendly’s cookie banner, inside the calendar',
  },
];
for (const q of QUOTES) q.seenInThisRun = calendly?.calendarText ? calendly.calendarText.includes(q.text) : null;

const thirdPartyFile = path.join(ROOT, 'src', 'data', 'calendly-third-parties.json');
if (fs.existsSync(thirdPartyFile)) {
  const { checked } = JSON.parse(fs.readFileSync(thirdPartyFile, 'utf8'));
  const text = new Date(checked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  VERIFIED.push({ text, source: 'date scripts/verify/calendly.mjs measured what the booking calendar loads (src/data/calendly-third-parties.json)' });
}

const decode = (s) =>
  s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

// The text a visitor sees, one line per block (paragraph, heading, list item, table cell), so
// that a pattern looking within one sentence stops where a block ends.
const BLOCK = /<\/?(?:address|article|aside|blockquote|br|button|caption|dd|details|dialog|div|dl|dt|footer|form|h[1-6]|header|label|li|main|nav|ol|p|section|summary|table|tbody|td|th|thead|tr|ul)\b[^>]*>/gi;
function visibleText(html) {
  return decode(
    html
      .replace(/<head>[\s\S]*?<\/head>/, '')
      .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/g, ' ')
      .replace(/<span class="ph"[^>]*>[^<]*<\/span>/g, ' [placeholder] ')
      .replace(/<div class="ph-block"[\s\S]*?<\/p><\/div>/g, ' [placeholder] ')
      .replace(/<code>[^<]*<\/code>/g, ' [cookie name] ')
      .replace(BLOCK, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ ?\n[\s]*/g, '\n')
    .trim();
}

// The title, description and sharing tags: what search engines and link previews show.
function headText(html) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
  const parts = [head.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''];
  for (const m of head.matchAll(/<meta (?:name|property)="(?:description|og:title|og:description|og:site_name)" content="([^"]*)"/g)) parts.push(m[1]);
  return decode(parts.join('\n'));
}

// --self-test: the retired claims' patterns against what they were written to catch. Each
// recorded wording must match its own pattern; the live pages as they were before this
// turn's fixes (fixtures/live-2026-10-23, saved from https://deepestrest.com/ on 27 October
// 2026, the build of commit ab6bdbd) must show the claims found there, among them the FAQ's
// "because Calendly sets its own cookies".
if (process.argv.includes('--self-test')) {
  let failed = 0;
  for (const r of RETIRED) {
    for (const [page, words] of r.found) {
      if (r.re.test(words)) continue;
      failed++;
      console.log(`FAIL no match (${r.claim}) ${page}: ${words}`);
    }
  }
  const dir = path.join(ROOT, 'scripts', 'verify', 'fixtures', 'live-2026-10-23');
  const byPage = {};
  for (const p of PAGES) {
    const html = fs.readFileSync(path.join(dir, `${p.slug === 'home' ? 'index' : p.slug}.html`), 'utf8');
    const everything = `${headText(html)}\n${visibleText(html)}`;
    byPage[p.slug] = findRetired(everything);
    const { protectedTitles, clinicalClaims } = findClaims(everything);
    for (const t of [...protectedTitles, ...clinicalClaims]) console.log(`      old live ${p.slug}: protected title or clinical claim: ${t}`);
  }
  for (const r of RETIRED) {
    const pages = Object.entries(byPage).flatMap(([page, list]) => list.filter((x) => x.claim === r.claim).map((x) => ({ page, words: x.words })));
    console.log(`${String(pages.length).padStart(3)} in the old live pages: ${r.claim}`);
    for (const x of pages) console.log(`      ${x.page}: ${x.words.replace(/\n/g, ' / ')}`);
  }
  const faqCaught = byPage.faq.some((x) => x.claim === 'That the booking calendar’s cookies all come from Calendly' && /sets its own cookies/.test(x.words));
  if (!faqCaught) failed++;
  console.log(`${faqCaught ? 'PASS' : 'FAIL'} the old FAQ's "because Calendly sets its own cookies" fails the facts check`);
  console.log(`\n${failed ? 'FAIL' : 'PASS'} self-test: ${RETIRED.length} kinds, ${RETIRED.reduce((n, r) => n + r.found.length, 0)} recorded wordings; ${failed} failures.`);
  process.exit(failed ? 1 : 0);
}

const placeholders = listPlaceholders(config);
const listed = fs.readFileSync(path.join(ROOT, 'PLACEHOLDERS.md'), 'utf8');
const missingFromList = placeholders.filter((p) => !listed.includes(`\`${p.key}\``)).map((p) => p.key);

const pages = [];
const unknownMarks = new Set();
for (const p of PAGES) {
  const html = await pageHtml(p);
  const marks = [...html.matchAll(/data-ph="([^"]+)"/g)].map((m) => m[1]);
  for (const k of marks) if (!placeholders.some((pl) => pl.key === k)) unknownMarks.add(k);
  const shown = visibleText(html);
  const meta = headText(html);
  const everything = `${meta}\n${shown}`;
  const { protectedTitles, clinicalClaims } = findClaims(everything);
  const retired = findRetired(everything);

  let text = everything;
  const flags = [];
  for (const [kind, re] of [
    ['money', /£\s?\d/g],
    ['percentage', /\d+\s?%/g],
    ['email address', /[\w.+-]+@[\w-]+\.[\w.]+/g],
    ['postcode', /\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/g],
    ['quotation (testimonial?)', /“[^”]{70,}”/g],
  ]) {
    for (const m of text.matchAll(re)) {
      if (kind === 'percentage' && m[0].replace(/\s/g, '') === config.mentor.satisfaction) continue;
      if (kind === 'email address' && EMAILS.some((e) => e.text === m[0])) continue;
      if (kind === 'quotation (testimonial?)' && QUOTES.some((q) => m[0] === `“${q.text}”`)) continue;
      flags.push(`${kind}: ${m[0]}`);
    }
  }
  // Remove every verified figure and address, longest first so 111 cannot break up
  // 0303 123 1113; any digit left is unexplained.
  for (const v of [...VERIFIED, ...EMAILS].sort((a, b) => b.text.length - a.text.length)) text = text.split(v.text).join(' ');
  for (const m of text.matchAll(/[^\s]*\d[^\s]*/g)) flags.push(`unverified figure: "${m[0]}"`);
  pages.push({
    page: p.slug,
    placeholderMarks: marks.length,
    distinctPlaceholders: new Set(marks).size,
    flags,
    protectedTitles,
    clinicalClaims,
    retired,
    headline: p.slug === 'home' ? headlineCheck(shown) : undefined,
  });
}

// The Calendly event's description, which the booking calendar shows on the booking page and
// in the popup on every page, as the Calendly check read it in this run: on the calendar and
// on the details form. It is held to the same rules as the pages.
const flow = calendly?.bookingFlow;
const calendarDescription = [...new Set([flow?.calendar?.description, flow?.detailsForm?.description].filter(Boolean))].join('\n');
const calendar = {
  measured: Boolean(flow?.calendar && flow?.detailsForm),
  checked: flow?.checked ?? null,
  location: flow?.calendar?.location ?? null,
  description: calendarDescription,
  retired: findRetired(calendarDescription),
  ...findClaims(calendarDescription),
};
calendar.pass = calendar.measured && !calendar.retired.length && !calendar.protectedTitles.length && !calendar.clinicalClaims.length;

// The home page must carry Nick's headline figures and the free-diagnostic offer.
function headlineCheck(shown) {
  const text = shown.replace(/\s+/g, ' ').replace(/\s+([,.:;])/g, '$1');
  const free = `Your first five sessions are free, as a diagnostic`;
  return {
    satisfaction: text.includes(config.mentor.satisfaction) && text.includes(`${config.mentor.clients} clients`),
    freeDiagnostic: text.includes(free),
    years: text.includes('five years'),
  };
}

// The outside services and stored items the pages name, against those measured in this run:
// what loads whatever the visitor answers to Calendly's banner, and what loads only if they
// accept its optional cookies.
async function thirdPartyCheck() {
  const measured = calendly?.thirdParties;
  if (!measured?.declined || !measured?.accepted?.bannerAccepted) return { measured: false, pass: false };
  const siteHost = new URL(BASE).hostname;
  const always = describe(measured.declined, siteHost);
  const accepted = describe(measured.accepted, siteHost);
  const key = (i) => `${i.type} ${i.name} ${i.host}`;
  const seen = {
    services: { always: always.services, accepted: accepted.services.filter((s) => !always.services.includes(s)) },
    items: { always: always.items.map(key), accepted: accepted.items.map(key).filter((k) => !always.items.map(key).includes(k)) },
  };
  const named = (html, attr) => {
    const out = { always: [], accepted: [] };
    for (const m of html.matchAll(new RegExp(`${attr}="([^"]+)" data-when="(always|accepted)"`, 'g'))) out[m[2]].push(decode(m[1]));
    return out;
  };
  const privacy = named(await pageHtml(PAGES.find((p) => p.slug === 'privacy')), 'data-third-party');
  const cookies = named(await pageHtml(PAGES.find((p) => p.slug === 'cookies')), 'data-third-party-item');
  const compare = (want, have) => ({ measured: want.length, named: have.length, missing: want.filter((x) => !have.includes(x)), extra: have.filter((x) => !want.includes(x)) });
  const result = {
    measured: true,
    checked: measured.checked,
    unidentified: [...new Set([...always.unknown, ...accepted.unknown])],
    services: { always: compare(seen.services.always, privacy.always), accepted: compare(seen.services.accepted, privacy.accepted) },
    items: { always: compare(seen.items.always, cookies.always), accepted: compare(seen.items.accepted, cookies.accepted) },
  };
  const all = [result.services.always, result.services.accepted, result.items.always, result.items.accepted];
  result.pass = !result.unidentified.length && all.every((c) => !c.missing.length && !c.extra.length);
  return result;
}
const thirdParties = await thirdPartyCheck();

const flagged = pages.filter((p) => p.flags.length);
const home = pages.find((p) => p.page === 'home');
const result = {
  placeholders: placeholders.length,
  placeholderKeys: placeholders.map((p) => p.key),
  missingFromPlaceholdersMd: missingFromList,
  marksOnPagesNotInConfig: [...unknownMarks],
  pages,
  inventedFacts: flagged.reduce((n, p) => n + p.flags.length, 0),
  protectedTitles: pages.reduce((n, p) => n + p.protectedTitles.length, 0),
  clinicalClaims: pages.reduce((n, p) => n + p.clinicalClaims.length, 0),
  retiredClaims: pages.reduce((n, p) => n + p.retired.length, 0),
  retiredList: RETIRED.map((r) => ({
    claim: r.claim,
    found: r.found,
    fix: r.fix,
    pattern: String(r.re),
    left: [...pages.flatMap((p) => p.retired.filter((x) => x.claim === r.claim).map((x) => `${p.page}: ${x.words}`)), ...calendar.retired.filter((x) => x.claim === r.claim).map((x) => `booking calendar: ${x.words}`)],
  })),
  calendar,
  thirdParties,
  headline: home.headline,
  verifiedFigures: [...VERIFIED, ...EMAILS],
  quotes: QUOTES,
  protectedPatterns: PROTECTED.map(String),
  clinicalPatterns: CLINICAL.map(String),
};
result.pass =
  !missingFromList.length &&
  !unknownMarks.size &&
  result.inventedFacts === 0 &&
  result.protectedTitles === 0 &&
  result.clinicalClaims === 0 &&
  result.retiredClaims === 0 &&
  calendar.pass &&
  QUOTES.every((q) => q.seenInThisRun === true) &&
  thirdParties.pass &&
  Object.values(home.headline).every(Boolean);
writeJson('facts.json', result);

console.log(`Placeholders in site.config.json: ${placeholders.length}; missing from PLACEHOLDERS.md: ${missingFromList.length}; marks on pages not in config: ${unknownMarks.size}`);
for (const p of pages) {
  const bad = p.flags.length + p.protectedTitles.length + p.clinicalClaims.length + p.retired.length;
  console.log(`${bad ? 'FAIL' : 'PASS'} ${p.page.padEnd(9)} placeholder marks ${String(p.placeholderMarks).padStart(3)}  unexplained facts ${p.flags.length}  protected titles ${p.protectedTitles.length}  clinical claims ${p.clinicalClaims.length}  retired claims ${p.retired.length}`);
  for (const f of [...p.flags, ...p.protectedTitles.map((t) => `protected title: ${t}`), ...p.clinicalClaims.map((t) => `clinical claim: ${t}`), ...p.retired.map((r) => `retired claim (${r.claim}): ${r.words}`)]) console.log(`      ${f}`);
}
console.log(`\nHome page headline: ${JSON.stringify(home.headline)}`);
console.log(`Invented or unverified facts: ${result.inventedFacts}. Protected titles: ${result.protectedTitles}. Clinical claims: ${result.clinicalClaims}. Retired claims (${RETIRED.length} kinds, ${RETIRED.reduce((n, r) => n + r.found.length, 0)} places found): ${result.retiredClaims} left.`);
if (!calendar.measured) console.log('FAIL booking calendar: verification/calendly.json has no reading of the booking flow; run scripts/verify/calendly.mjs first.');
else {
  console.log(`${calendar.pass ? 'PASS' : 'FAIL'} booking calendar (Calendly event, read ${calendar.checked}): location "${calendar.location}"; description "${calendar.description}"`);
  for (const t of [...calendar.retired.map((r) => `retired claim (${r.claim}): ${r.words}`), ...calendar.protectedTitles.map((t) => `protected title: ${t}`), ...calendar.clinicalClaims.map((t) => `clinical claim: ${t}`)]) console.log(`      ${t}`);
}
for (const q of QUOTES) console.log(`${q.seenInThisRun ? 'PASS' : 'FAIL'} quotation from ${q.source}: ${q.seenInThisRun === null ? 'no calendar text in verification/calendly.json' : q.seenInThisRun ? 'in the calendar as seen in this run' : 'not in the calendar as seen in this run'}`);
if (!thirdParties.measured) console.log('FAIL third parties: verification/calendly.json has no complete measurement; run scripts/verify/calendly.mjs first.');
else {
  console.log(`${thirdParties.pass ? 'PASS' : 'FAIL'} third parties named against measured (${thirdParties.checked}):${thirdParties.unidentified.length ? ` unidentified ${thirdParties.unidentified.join(', ')}` : ''}`);
  for (const [what, page] of [['services', 'privacy policy'], ['items', 'cookie notice']])
    for (const when of ['always', 'accepted']) {
      const c = thirdParties[what][when];
      console.log(`      ${what} (${when === 'always' ? 'whatever the answer' : 'only if accepted'}): measured ${c.measured}, named on the ${page} ${c.named}${c.missing.length ? `, missing ${c.missing.join(', ')}` : ''}${c.extra.length ? `, extra ${c.extra.join(', ')}` : ''}`);
    }
}
process.exitCode = result.pass ? 0 : 1;
