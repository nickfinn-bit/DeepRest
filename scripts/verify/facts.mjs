// Placeholder count and a scan for invented facts.
//  - Counts the placeholders in site.config.json, checks each is listed in PLACEHOLDERS.md,
//    and that every placeholder marked on a page is one of them.
//  - Scans the visible text of every built page, with placeholders removed, for anything
//    that looks like a practice fact: money, percentages, email addresses, phone numbers,
//    registration numbers, postcodes and any other figures. Each figure must be on the
//    list below of facts checked against the source given; anything else fails.
import fs from 'node:fs';
import path from 'node:path';
import { listPlaceholders } from '../../src/lib/facts.mjs';
import { PAGES, ROOT, writeJson } from './common.mjs';

const DIST = path.join(ROOT, 'dist');

// Every figure the site states, and where it was checked.
const VERIFIED = [
  { text: '999', source: 'UK emergency number (given in the brief)' },
  { text: '111', source: 'NHS 111 (given in the brief)' },
  { text: '116 123', source: 'Samaritans, https://www.samaritans.org/how-we-can-help/contact-samaritan/ (free, day or night, 365 days a year)' },
  { text: '365', source: 'Samaritans page above: "365 days a year"' },
  { text: '0303 123 1113', source: 'ICO helpline, https://ico.org.uk/make-a-complaint/' },
  { text: '2018', source: 'Data Protection Act 2018 (UK statute)' },
  { text: '6(1)(b)', source: 'UK GDPR Article 6(1)(b), contract' },
  { text: '6(1)(c)', source: 'UK GDPR Article 6(1)(c), legal obligation' },
  { text: '6(1)(d)', source: 'UK GDPR Article 6(1)(d), vital interests' },
  { text: '6(1)(f)', source: 'UK GDPR Article 6(1)(f), legitimate interests' },
  { text: '9(2)(a)', source: 'UK GDPR Article 9(2)(a), explicit consent' },
  { text: '9(2)(c)', source: 'UK GDPR Article 9(2)(c), vital interests' },
  { text: '9(2)(f)', source: 'UK GDPR Article 9(2)(f), legal claims' },
  { text: '9(2)(g)', source: 'UK GDPR Article 9(2)(g), substantial public interest' },
  { text: '9(2)(h)', source: 'UK GDPR Article 9(2)(h), health or social care' },
  { text: 'Schedule 1, paragraph 2', source: 'Data Protection Act 2018, Schedule 1 Part 1 paragraph 2, health or social care purposes' },
  { text: 'Schedule 1, paragraph 18', source: 'Data Protection Act 2018, Schedule 1 Part 2 paragraph 18, safeguarding of children and individuals at risk' },
  { text: 'Article 6', source: 'UK GDPR' },
  { text: 'Article 9', source: 'UK GDPR' },
  { text: '404', source: 'HTTP status of the error page' },
  { text: `© ${new Date().getFullYear()}`, source: 'year of the build' },
];

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
      .replace(/<div class="portrait portrait-placeholder"[\s\S]*?<\/div>/g, ' [placeholder] ')
      .replace(/<code>[^<]*<\/code>/g, ' [cookie name] ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ');
}

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const placeholders = listPlaceholders(config);
const listed = fs.readFileSync(path.join(ROOT, 'PLACEHOLDERS.md'), 'utf8');
const missingFromList = placeholders.filter((p) => !listed.includes(`\`${p.key}\``)).map((p) => p.key);

const pages = [];
const unknownMarks = new Set();
for (const p of PAGES) {
  const file = p.slug === '404' ? path.join(DIST, '404.html') : path.join(DIST, p.path, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const marks = [...html.matchAll(/data-ph="([^"]+)"/g)].map((m) => m[1]);
  for (const k of marks) if (!placeholders.some((pl) => pl.key === k)) unknownMarks.add(k);
  let text = visibleText(html);
  const flags = [];
  for (const [kind, re] of [
    ['money', /£\s?\d/g],
    ['percentage', /\d\s?%/g],
    ['email address', /[\w.+-]+@[\w-]+\.[\w.]+/g],
    ['HCPC number', /\bPYL\s?\d+/gi],
    ['postcode', /\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/g],
    ['quotation (testimonial?)', /“[^”]{40,}”/g],
  ]) {
    for (const m of text.matchAll(re)) flags.push(`${kind}: ${m[0]}`);
  }
  // Remove every verified figure, longest first so 111 cannot break up 0303 123 1113;
  // any digit left is unexplained.
  for (const v of [...VERIFIED].sort((a, b) => b.text.length - a.text.length)) text = text.split(v.text).join(' ');
  for (const m of text.matchAll(/[^\s]*\d[^\s]*/g)) flags.push(`unverified figure: "${m[0]}"`);
  pages.push({ page: p.slug, placeholderMarks: marks.length, distinctPlaceholders: new Set(marks).size, flags });
}

const flagged = pages.filter((p) => p.flags.length);
const result = {
  placeholders: placeholders.length,
  placeholderKeys: placeholders.map((p) => p.key),
  missingFromPlaceholdersMd: missingFromList,
  marksOnPagesNotInConfig: [...unknownMarks],
  pages,
  inventedFacts: flagged.reduce((n, p) => n + p.flags.length, 0),
  verifiedFigures: VERIFIED,
};
result.pass = !missingFromList.length && !unknownMarks.size && result.inventedFacts === 0;
writeJson('facts.json', result);

console.log(`Placeholders in site.config.json: ${placeholders.length}; missing from PLACEHOLDERS.md: ${missingFromList.length}; marks on pages not in config: ${unknownMarks.size}`);
for (const p of pages) {
  console.log(`${p.flags.length ? 'FAIL' : 'PASS'} ${p.page.padEnd(8)} placeholder marks ${String(p.placeholderMarks).padStart(3)} (${p.distinctPlaceholders} distinct)  unexplained facts ${p.flags.length}`);
  for (const f of p.flags) console.log(`      ${f}`);
}
console.log(`\nInvented or unverified facts found: ${result.inventedFacts}.`);
process.exitCode = result.pass ? 0 : 1;
