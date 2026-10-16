// Builds the static site into dist/ from site.config.json and src/.
//   node scripts/build.mjs           build, marking placeholders, and regenerate PLACEHOLDERS.md
//   node scripts/build.mjs --strict  refuse to build while any placeholder remains (used to publish)
// --config=<file> and --out=<dir> build from another config into another folder (used by tests).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createFacts, listPlaceholders } from '../src/lib/facts.mjs';
import { HEAD_SCRIPT, renderPage } from '../src/lib/layout.mjs';
import { REVIEW_NOTES } from '../src/lib/review-notes.mjs';
import { PAGES } from '../src/pages/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const option = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const DIST = path.resolve(option('out') || path.join(ROOT, 'dist'));
const CONFIG = path.resolve(option('config') || path.join(ROOT, 'site.config.json'));
const strict = process.argv.includes('--strict');

const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const placeholders = listPlaceholders(config);

if (strict && placeholders.length) {
  console.error(`Refusing to build for publishing: ${placeholders.length} placeholders remain in site.config.json:`);
  for (const p of placeholders) console.error(`  - ${p.key}: ${p.placeholder}`);
  process.exit(1);
}

const F = createFacts(config);
F.setContext('*', 'Canonical and sharing address, sitemap.xml and robots.txt');
const siteUrl = F.value('site.url');
if (!/^https:\/\/[^/]+\/(.*\/)?$/.test(siteUrl)) throw new Error(`site.url must be https and end with "/": ${siteUrl}`);
const site = { url: siteUrl, basePath: new URL(siteUrl).pathname };
if (!F.isPlaceholder('psychologist.photo') && !fs.existsSync(path.join(ROOT, 'src', 'assets', 'img', config.psychologist.photo))) {
  throw new Error(`psychologist.photo: src/assets/img/${config.psychologist.photo} does not exist`);
}

// Fresh output folder, with the static assets copied in.
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'src', 'assets'), path.join(DIST, 'assets'), { recursive: true });

const hashOf = (data) => crypto.createHash('sha256').update(data).digest();
const versions = Object.fromEntries(
  ['css/site.css', 'js/site.js'].map((p) => [p, hashOf(fs.readFileSync(path.join(DIST, 'assets', p))).toString('hex').slice(0, 10)]),
);

const csp = [
  "default-src 'self'",
  `script-src 'self' 'sha256-${hashOf(HEAD_SCRIPT).toString('base64')}' https://assets.calendly.com`,
  "style-src 'self' https://assets.calendly.com",
  "img-src 'self' data: https://assets.calendly.com",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://calendly.com',
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const year = new Date().getFullYear();
const calendlyUrl = F.isPlaceholder('calendly.url') ? config.calendly.url.interim : config.calendly.url;

for (const page of PAGES) {
  // Pages live at <slug>/index.html; links are relative so the site works under any base path.
  const prefix = page.slug && !page.is404 ? '../' : '';
  const ctx = {
    F,
    site,
    csp,
    year,
    calendlyUrl,
    href: (slug) => (slug ? `${prefix}${slug}/` : prefix || './'),
    asset: (p, bust = true) => `${prefix}assets/${p}${bust && versions[p] ? `?v=${versions[p]}` : ''}`,
  };
  const html = renderPage(ctx, page, page.main);
  if (strict && /data-ph=|class="ph/.test(html)) throw new Error(`${page.name} still renders a placeholder`);
  const file = page.is404 ? path.join(DIST, '404.html') : path.join(DIST, page.slug, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// GitHub Pages: serve files as they are, without Jekyll.
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
const indexable = PAGES.filter((p) => !p.is404);
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    indexable.map((p) => `  <url><loc>${site.url}${p.slug ? `${p.slug}/` : ''}</loc></url>`).join('\n') +
    '\n</urlset>\n',
);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`);

if (!strict && !option('config')) writePlaceholdersReport();
console.log(
  `Built ${PAGES.length} pages into ${path.relative(ROOT, DIST) || '.'}/ for ${site.url}` +
    (placeholders.length ? ` with ${placeholders.length} placeholders (not publishable).` : ' with no placeholders.'),
);

function writePlaceholdersReport() {
  const pageNames = PAGES.map((p) => p.name);
  const where = (key) => {
    const byRegion = new Map();
    for (const u of F.usage.filter((u) => u.key === key)) {
      if (!byRegion.has(u.region)) byRegion.set(u.region, new Set());
      byRegion.get(u.region).add(u.page);
    }
    if (!byRegion.size) return 'Not shown on any page';
    return [...byRegion]
      .map(([region, pages]) => {
        const every = pages.has('*') || pages.size === pageNames.length;
        const list = every ? 'every page' : pageNames.filter((n) => pages.has(n)).join(', ');
        return `${region}: ${list}`;
      })
      .join('<br>');
  };
  const cell = (s) => String(s).replace(/\|/g, '\\|');
  const rows = placeholders.map(
    (p, i) => `| ${i + 1} | \`${p.key}\` | ${cell(p.needs)} | ${where(p.key)} |`,
  );
  const interim = placeholders.filter((p) => p.interim);
  const md = `# Placeholders

Generated by \`npm run build\` from \`site.config.json\`; do not edit by hand.

**${placeholders.length} placeholders remain.** Every fact below is unknown until it is supplied, so the site shows each one as a marked placeholder. Do not publish while any remain: \`npm run build:strict\`, which the publishing workflow runs, refuses to build until there are none.

To fill one in, replace its \`{ "placeholder": ... }\` object in \`site.config.json\` with the real value, then run \`npm run build\`.

| # | Config key | What is needed | Where it appears |
|---|---|---|---|
${rows.join('\n')}

## Interim values in use

Until they are confirmed, these placeholders use a working interim value so the site can be built and tested:

${interim.map((p) => `- \`${p.key}\`: ${p.interim}`).join('\n')}

The booking page says plainly that its calendar is Calendly's demo, not DeepRest's.

## Wording for the psychologist to check

These passages contain no unknown facts, but they describe how the practice works in general terms. The psychologist should confirm that each matches their practice before publishing:

${REVIEW_NOTES.map((n) => `- **${n.where}:** ${n.what}`).join('\n')}
`;
  fs.writeFileSync(path.join(ROOT, 'PLACEHOLDERS.md'), md);
}
