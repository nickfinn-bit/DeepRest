// Punctuation and spacing slips in every page's text: what is shown, what screen readers read
// (visually hidden text, aria-label and alt), the title, description and sharing tags, and the
// messages site.js writes into the pages. A slip is:
//  - ".." outside an ellipsis ("..." or "…"), or a full stop next to "…";
//  - a space before a comma, full stop, semicolon, colon, question or exclamation mark;
//  - doubled punctuation, such as ",," ",." ";;" "!!";
//  - no space after a comma or semicolon, or after a full stop that ends a sentence;
//  - two or more spaces inside a line of the page's HTML text: the browser shows one, but
//    they mark a word left out, such as an empty value;
//  - the same word twice in a row;
//  - a bracket or curly double quote left open, or closed without being opened, in a block;
//  - a straight quote or apostrophe, where the site uses curly ones.
// Cookie names and other <code> are left out; they are names, not prose.
//   node scripts/verify/typography.mjs [--live]
//   node scripts/verify/typography.mjs --self-test   the rules on the live pages as they were
//     before this check (fixtures/live-2026-10-23, saved from https://deepestrest.com/ on
//     27 October 2026, when they were the build of commit ab6bdbd), and on made-up cases
import fs from 'node:fs';
import path from 'node:path';
import { PAGES, ROOT, pageHtml, writeJson } from './common.mjs';

const BLOCK = /<\/?(?:address|article|aside|blockquote|body|br|button|caption|dd|details|dialog|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|html|label|li|main|nav|ol|p|section|summary|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi;
const ENTITIES = { amp: '&', nbsp: '\u00a0', lt: '<', gt: '>', quot: '"', '#39': "'", '#x27': "'" };
const decode = (s) => s.replace(/&(amp|nbsp|lt|gt|quot|#39|#x27);/g, (_, e) => ENTITIES[e]);

// The text of a page, one line per block, as a reader meets it: tags inside a block are
// dropped without adding spaces, so "free</strong>, as" reads "free, as".
function blocksOf(html) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
  const lines = [];
  const title = head.match(/<title>([^<]*)<\/title>/)?.[1];
  if (title !== undefined) lines.push({ where: 'title', raw: decode(title) });
  for (const m of head.matchAll(/<meta (?:name|property)="(description|og:title|og:description|og:site_name)" content="([^"]*)"/g)) lines.push({ where: m[1], raw: decode(m[2]) });
  const body = html
    .replace(/<head>[\s\S]*?<\/head>/, '')
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<code>[\s\S]*?<\/code>/gi, 'CODE');
  for (const m of body.matchAll(/\s(?:aria-label|alt|title|placeholder)="([^"]+)"/g)) lines.push({ where: 'attribute', raw: decode(m[1]) });
  for (const block of body.split(BLOCK)) {
    const raw = decode(block.replace(/<[^>]+>/g, ''));
    if (raw.trim()) lines.push({ where: 'text', raw });
  }
  return lines.map((l) => ({ ...l, text: l.raw.replace(/\s+/g, ' ').trim() }));
}

// The messages site.js writes into the pages: its string literals that read as sentences.
function scriptMessages(js) {
  return [...js.matchAll(/'((?:[^'\\\n]|\\.)*\s(?:[^'\\\n]|\\.)*)'/g)]
    .map((m) => m[1])
    .filter((s) => /^[A-Z][a-z]/.test(s) && /[a-z] [a-z]/.test(s))
    .map((s) => ({ where: 'site.js', raw: s, text: s }));
}

const RULES = [
  ['double full stop', /(?<![.…])\.\.(?![.…])|…\.|\.…/g],
  ['space before punctuation', /[^\s(“][ \u00a0]+[,.;:!?](?=[\s”)]|$)/g],
  // "Inc.," and "Inc.:" are an abbreviation's full stop, then the sentence's punctuation.
  ['doubled punctuation', /[,;:]{2,}|[,;:][.!?]|(?<!\b(?:Inc|Ltd|Co|etc))[.!?][,;:]|!{2,}|\?{2,}/g],
  ['no space after punctuation', /\p{Ll}[,;](?=\p{L})|\p{Ll}{2}\.(?=\p{Lu}\p{Ll})/gu],
  ['doubled space', /\S[ \t\u00a0]{2,}(?=\S)/g, 'raw'],
  ['doubled word', /\b(\p{L}+)[\s\u00a0]+\1\b/giu],
  ['straight quote', /['"]/g],
];

// Brackets and curly double quotes must open and close in pairs within a block.
function unbalanced(text) {
  const out = [];
  for (const [open, close] of [['(', ')'], ['“', '”']]) {
    let depth = 0;
    for (const ch of text) {
      if (ch === open) depth++;
      if (ch === close && --depth < 0) break;
    }
    if (depth !== 0) out.push(`${open}${close} not in pairs`);
  }
  return out;
}

// Every slip in a list of blocks, each with the words around it.
function findSlips(lines) {
  const slips = [];
  for (const line of lines) {
    for (const [rule, re, on] of RULES) {
      const text = on === 'raw' ? line.raw : line.text;
      for (const m of text.matchAll(re)) {
        slips.push({ rule, where: line.where, words: text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).replace(/\s+/g, ' ').trim() });
      }
    }
    for (const problem of unbalanced(line.text)) slips.push({ rule: 'unpaired bracket or quote', where: line.where, words: `${problem}: ${line.text.slice(0, 120)}` });
  }
  return slips;
}

// Made-up cases: each "bad" must be caught by its rule, and no "good" may be caught at all.
const CASES = {
  bad: [
    ['double full stop', 'Cloudflare, Inc.. Protects Calendly’s website.'],
    ['double full stop', 'Loading the booking calendar….'],
    ['space before punctuation', 'Your first five sessions are free , as a diagnostic.'],
    ['space before punctuation', 'Calendly books one session at a time .'],
    ['space before punctuation', 'Questions before you book ?'],
    ['doubled punctuation', 'Calendly, LLC,, which provides the booking system.'],
    ['doubled punctuation', 'See its privacy policy,.'],
    ['no space after punctuation', 'Choose a day,then confirm it.'],
    ['no space after punctuation', 'There is nothing to pay.Book one online.'],
    ['doubled space', 'He has mentored  students and young adults.'],
    ['doubled word', 'Your first five sessions are are free.'],
    ['unpaired bracket or quote', 'The booking form’s optional question (“Please share anything.”'],
    ['straight quote', "Nick's record"],
  ],
  good: [
    'Loading the booking calendar…',
    'Wait for it...',
    'Cloudflare, Inc. Protects Calendly’s website.',
    'Calendly, LLC, which provides the booking system.',
    'Article 6(1)(b); and your explicit consent: Article 9(2)(a)',
    'Calendly, Google, Cloudflare and GitHub comply with the UK Extension to the EU-U.S. Data Privacy Framework.',
    'Email sent to hello@deepestrest.com passes through Cloudflare.',
    'Cookie, calendly.com',
    'Braze, Inc.: customer messaging.',
    'Segment (Twilio Inc.), Braze, Inc., Sprig and Survicate',
    'The booking form’s optional question (“Please share anything that will help prepare for our meeting.”), and the email address of any guest you add.',
    'Need help now? Call 999.',
    'Satisfaction rate across 23 clients: 100%',
    'Nick’s record',
  ],
};

function selfTest() {
  let failed = 0;
  for (const [rule, text] of CASES.bad) {
    const caught = findSlips([{ where: 'case', raw: text, text: text.replace(/\s+/g, ' ').trim() }]).some((s) => s.rule === rule);
    if (!caught) failed++;
    console.log(`${caught ? 'PASS' : 'FAIL'} caught (${rule}): ${text}`);
  }
  for (const text of CASES.good) {
    const slips = findSlips([{ where: 'case', raw: text, text }]);
    if (slips.length) failed++;
    console.log(`${slips.length ? 'FAIL' : 'PASS'} not flagged: ${text}${slips.length ? `  (${slips.map((s) => s.rule).join(', ')})` : ''}`);
  }
  const dir = path.join(ROOT, 'scripts', 'verify', 'fixtures', 'live-2026-10-23');
  const before = {};
  for (const p of PAGES) {
    const file = path.join(dir, `${p.slug === 'home' ? 'index' : p.slug}.html`);
    before[p.slug] = findSlips(blocksOf(fs.readFileSync(file, 'utf8')));
    for (const s of before[p.slug]) console.log(`      old live ${p.slug}: ${s.rule}: ${s.words}`);
  }
  const oldTotal = Object.values(before).reduce((n, l) => n + l.length, 0);
  // The slip the review found on the live privacy policy must be among them.
  const knownCaught = before.privacy.some((s) => s.rule === 'double full stop' && s.words.includes('Inc..'));
  if (!knownCaught) failed++;
  console.log(`${knownCaught ? 'PASS' : 'FAIL'} the old live privacy policy's "Cloudflare, Inc.." is caught; slips in the old live text: ${oldTotal}`);
  console.log(`\n${failed ? 'FAIL' : 'PASS'} self-test: ${CASES.bad.length} made-up slips, ${CASES.good.length} made-up clean texts, ${oldTotal} slips in the old live pages; ${failed} failures.`);
  return { failed, cases: CASES.bad.length + CASES.good.length, oldLive: before, oldLiveTotal: oldTotal, knownCaught };
}

const test = selfTest();
if (process.argv.includes('--self-test')) {
  process.exitCode = test.failed ? 1 : 0;
} else {
  const pages = [];
  for (const p of PAGES) pages.push({ page: p.slug, slips: findSlips(blocksOf(await pageHtml(p))) });
  pages.push({ page: 'site.js', slips: findSlips(scriptMessages(fs.readFileSync(path.join(ROOT, 'src', 'assets', 'js', 'site.js'), 'utf8'))) });
  const total = pages.reduce((n, p) => n + p.slips.length, 0);
  const pass = total === 0 && !test.failed;
  writeJson('typography.json', { pages, slips: total, selfTest: test, pass });
  console.log('');
  for (const p of pages) {
    console.log(`${p.slips.length ? 'FAIL' : 'PASS'} ${p.page.padEnd(9)} slips ${p.slips.length}`);
    for (const s of p.slips) console.log(`      ${s.rule} (${s.where}): ${s.words}`);
  }
  console.log(`
Punctuation and spacing slips: ${total}. Self-test: ${test.failed ? `${test.failed} failures` : 'passes'}.`);
  process.exitCode = pass ? 0 : 1;
}
