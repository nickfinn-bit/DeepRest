// Shared settings for the verification scripts. They test the built site in dist/,
// served by scripts/serve.mjs, which mimics GitHub Pages.
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '..', '..');
export const OUT = path.join(ROOT, 'verification');
export const PORT = Number(process.env.PORT || 4173);

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const siteUrl = typeof config.site.url === 'string' ? config.site.url : config.site.url.interim;
export const BASE = `http://localhost:${PORT}${new URL(siteUrl).pathname}`;

export const PAGES = [
  { slug: 'home', name: 'Home', path: '' },
  { slug: 'about', name: 'About', path: 'about/' },
  { slug: 'services', name: 'Services and approach', path: 'services/' },
  { slug: 'fees', name: 'Fees and insurance', path: 'fees/' },
  { slug: 'faq', name: 'FAQ', path: 'faq/' },
  { slug: 'book', name: 'Book a session', path: 'book/' },
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

export function writeJson(name, data) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), `${JSON.stringify(data, null, 2)}\n`);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
