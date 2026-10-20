// Shared settings for the verification scripts. By default they test the built site in
// dist/, served by scripts/serve.mjs, which mimics GitHub Pages. With --live (or LIVE=1)
// they test the published site at its own address, site.url in site.config.json.
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '..', '..');
export const OUT = path.join(ROOT, 'verification');
export const DIST = path.join(ROOT, 'dist');
export const PORT = Number(process.env.PORT || 4173);

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
export const SITE_URL = typeof config.site.url === 'string' ? config.site.url : config.site.url.interim;
export const LIVE = process.argv.includes('--live') || process.env.LIVE === '1';
export const BASE = LIVE ? SITE_URL : `http://localhost:${PORT}${new URL(SITE_URL).pathname}`;

export const PAGES = [
  { slug: 'home', name: 'Home', path: '' },
  { slug: 'mentoring', name: 'How mentoring works', path: 'mentoring/' },
  { slug: 'about', name: 'About Nick', path: 'about/' },
  { slug: 'faq', name: 'FAQ', path: 'faq/' },
  { slug: 'book', name: 'Book a free session', path: 'book/' },
  { slug: 'contact', name: 'Contact', path: 'contact/' },
  { slug: 'privacy', name: 'Privacy policy', path: 'privacy/' },
  { slug: 'cookies', name: 'Cookie notice', path: 'cookies/' },
  { slug: '404', name: 'Page not found (404)', path: 'no-such-page/' },
];

export const WIDTHS = [360, 390, 768, 1024, 1280, 1440, 1920];

// Phones and tablets are emulated as touch devices; 1,024 px and up as desktops.
export const viewportFor = (width) => ({
  width,
  height: width < 768 ? 800 : 900,
  deviceScaleFactor: 1,
  isMobile: width < 1024,
  hasTouch: width < 1024,
});

export const pageUrl = (p) => BASE + p.path;

// A page's HTML: fetched from the live site with --live, otherwise read from dist/.
export async function pageHtml(p) {
  if (LIVE) {
    const res = await fetch(pageUrl(p), { headers: { 'Cache-Control': 'no-cache' } });
    return res.text();
  }
  return fs.readFileSync(p.slug === '404' ? path.join(DIST, '404.html') : path.join(DIST, p.path, 'index.html'), 'utf8');
}

export function writeJson(name, data) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), `${JSON.stringify({ testedAt: BASE, live: LIVE, ...data }, null, 2)}\n`);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
