// Placeholders, invented facts, protected titles and clinical claims, on every page.
//  - Counts the placeholders in site.config.json, checks each is listed in PLACEHOLDERS.md,
//    and that every placeholder marked on a page is one of them.
//  - Scans the visible text of every page, with placeholders removed, for anything that
//    looks like a practice fact: money, percentages, email addresses, phone numbers,
//    postcodes, quotations and any other figures. Each figure must be on the list below
//    of facts checked against the source given; anything else fails.
//  - Scans the visible text and the page's title, description and sharing tags for
//    protected professional titles and for clinical or medical claims: there must be none.
//   node scripts/verify/facts.mjs [--live]
import fs from 'node:fs';
import path from 'node:path';
import { listPlaceholders } from '../../src/lib/facts.mjs';
import { PAGES, ROOT, pageHtml, writeJson } from './common.mjs';
import { CLINICAL, PROTECTED, findClaims } from './claims.mjs';

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

const cookieFile = path.join(ROOT, 'src', 'data', 'calendly-cookies.json');
if (fs.existsSync(cookieFile)) {
  const { checked } = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
  const text = new Date(checked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  VERIFIED.push({ text, source: 'date scripts/verify/calendly.mjs recorded the Calendly cookies (src/data/calendly-cookies.json)' });
}

const decode = (s) =>
  s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

function visibleText(html) {
  return decode(
    html
      .replace(/<head>[\s\S]*?<\/head>/, '')
      .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/g, ' ')
      .replace(/<span class="ph"[^>]*>[^<]*<\/span>/g, ' [placeholder] ')
      .replace(/<div class="ph-block"[\s\S]*?<\/p><\/div>/g, ' [placeholder] ')
      .replace(/<code>[^<]*<\/code>/g, ' [cookie name] ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ');
}

// The title, description and sharing tags: what search engines and link previews show.
function headText(html) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
  const parts = [head.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''];
  for (const m of head.matchAll(/<meta (?:name|property)="(?:description|og:title|og:description|og:site_name)" content="([^"]*)"/g)) parts.push(m[1]);
  return decode(parts.join(' | '));
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
  const everything = `${meta} | ${shown}`;
  const { protectedTitles, clinicalClaims } = findClaims(everything);

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
    headline: p.slug === 'home' ? headlineCheck(shown) : undefined,
  });
}

// The home page must carry Nick's headline figures and the free-diagnostic offer.
function headlineCheck(shown) {
  const text = shown.replace(/\s+([,.:;])/g, '$1');
  const free = `Your first five sessions are free, as a diagnostic`;
  return {
    satisfaction: text.includes(config.mentor.satisfaction) && text.includes(`${config.mentor.clients} clients`),
    freeDiagnostic: text.includes(free),
    years: text.includes('five years'),
  };
}

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
  headline: home.headline,
  verifiedFigures: [...VERIFIED, ...EMAILS],
  protectedPatterns: PROTECTED.map(String),
  clinicalPatterns: CLINICAL.map(String),
};
result.pass =
  !missingFromList.length &&
  !unknownMarks.size &&
  result.inventedFacts === 0 &&
  result.protectedTitles === 0 &&
  result.clinicalClaims === 0 &&
  Object.values(home.headline).every(Boolean);
writeJson('facts.json', result);

console.log(`Placeholders in site.config.json: ${placeholders.length}; missing from PLACEHOLDERS.md: ${missingFromList.length}; marks on pages not in config: ${unknownMarks.size}`);
for (const p of pages) {
  const bad = p.flags.length + p.protectedTitles.length + p.clinicalClaims.length;
  console.log(`${bad ? 'FAIL' : 'PASS'} ${p.page.padEnd(9)} placeholder marks ${String(p.placeholderMarks).padStart(3)}  unexplained facts ${p.flags.length}  protected titles ${p.protectedTitles.length}  clinical claims ${p.clinicalClaims.length}`);
  for (const f of [...p.flags, ...p.protectedTitles.map((t) => `protected title: ${t}`), ...p.clinicalClaims.map((t) => `clinical claim: ${t}`)]) console.log(`      ${f}`);
}
console.log(`\nHome page headline: ${JSON.stringify(home.headline)}`);
console.log(`Invented or unverified facts: ${result.inventedFacts}. Protected titles: ${result.protectedTitles}. Clinical claims: ${result.clinicalClaims}.`);
process.exitCode = result.pass ? 0 : 1;
