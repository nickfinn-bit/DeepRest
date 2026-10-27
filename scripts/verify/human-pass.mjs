// The pass a person makes before a change is called finished: every page at every width,
// scrolled from top to bottom at reading speed (SPEED pixels a second, with a PAUSE at each
// stop), and a screen capture of what is on the screen at every stop, for someone to look at.
// Stops are 80% of a screen apart, so each part of the page is seen at least once with some of
// what came before. Besides each page as it first appears, it goes through what a visitor
// opens: every FAQ answer, the menu (where the screen is narrow enough to have one), the
// booking question the header button asks, and the booking page once the calendar is loaded.
// It never books. Captures go in verification/human-pass/, listed in human-pass.json; what was
// seen in them is recorded by hand in human-pass-review.json, and both go into REPORT.md.
//   node scripts/verify/human-pass.mjs [--live] [--pages=home,faq] [--widths=360,1440]
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { OUT, PAGES, WIDTHS, pageUrl, sleep, viewportFor, writeJson } from './common.mjs';

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const pages = arg('pages') ? PAGES.filter((p) => arg('pages').split(',').includes(p.slug)) : PAGES;
const widths = arg('widths') ? arg('widths').split(',').map(Number) : WIDTHS;
const SHOTS = path.join(OUT, 'human-pass');
const SPEED = 800; // pixels a second, within the 600 to 1,000 a reader scrolls at
const PAUSE = 700; // milliseconds at each stop before the capture

// Scrolls the window to y at SPEED, one animation frame at a time, as a wheel or swipe would.
const scrollTo = (page, y) =>
  page.evaluate(
    (target, speed) =>
      new Promise((resolve) => {
        const from = window.scrollY;
        const start = performance.now();
        const step = (now) => {
          const done = Math.min(1, ((now - start) / 1000) * speed / Math.max(1, Math.abs(target - from)));
          window.scrollTo(0, from + (target - from) * done);
          if (done < 1) requestAnimationFrame(step);
          else resolve(window.scrollY);
        };
        requestAnimationFrame(step);
      }),
    y,
    SPEED,
  );

// Top to bottom with a capture at every stop. Returns the stops and the time spent scrolling.
async function pass(page, name) {
  const stops = [];
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const screen = page.viewport().height;
  const last = Math.max(0, height - screen);
  let scrolling = 0;
  for (let y = 0, i = 1; ; i++) {
    const started = Date.now();
    const at = await scrollTo(page, y);
    scrolling += Date.now() - started;
    await sleep(PAUSE);
    const file = `${name}-${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(SHOTS, file) });
    stops.push({ file, y: Math.round(at) });
    if (y >= last) break;
    y = Math.min(last, y + Math.round(screen * 0.8));
  }
  return { height, stops, scrollSeconds: Math.round(scrolling / 100) / 10, pixelsPerSecond: scrolling ? Math.round((last / scrolling) * 1000) : null };
}

const press = (page, selector, touch) => (touch ? page.tap(selector) : page.click(selector));

// A full pass replaces every capture; a pass of some pages or widths replaces only theirs.
if (!arg('pages') && !arg('widths')) fs.rmSync(SHOTS, { recursive: true, force: true });
else {
  for (const f of fs.existsSync(SHOTS) ? fs.readdirSync(SHOTS) : []) {
    if (pages.some((p) => f.startsWith(`${p.slug}-`)) && widths.some((w) => f.includes(`-${w}-`))) fs.rmSync(path.join(SHOTS, f));
  }
}
fs.mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch();
console.log(`Chrome ${await browser.version()} (pid ${browser.process()?.pid})`);
const runs = [];
try {
  for (const width of widths) {
    const view = viewportFor(width);
    for (const p of pages) {
      const states = [{ state: 'page' }];
      if (p.slug === 'faq') states.push({ state: 'answers-open' });
      if (p.slug === 'book') states.push({ state: 'calendar' });
      if (p.slug === 'home') states.push({ state: 'menu' }, { state: 'booking-question' });
      for (const { state } of states) {
        const context = await browser.createBrowserContext();
        const page = await context.newPage();
        await page.setViewport(view);
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        const name = `${p.slug}${state === 'page' ? '' : `-${state}`}-${width}`;
        const run = { page: p.slug, state, width };
        try {
          await page.goto(pageUrl(p), { waitUntil: 'networkidle0' });
          await page.evaluate(() => document.fonts.ready);
          if (state === 'answers-open') {
            await page.$$eval('details', (ds) => ds.forEach((d) => (d.open = true)));
          } else if (state === 'menu') {
            const toggle = await page.$('.nav-toggle');
            if (!toggle || !(await toggle.isVisible())) {
              await context.close();
              continue; // wide enough that the menu is always shown
            }
            await press(page, '.nav-toggle', view.hasTouch);
          } else if (state === 'booking-question') {
            await press(page, '.site-header [data-calendly-popup]', view.hasTouch);
            await page.waitForSelector('#calendly-consent[open]', { timeout: 5000 });
          } else if (state === 'calendar') {
            await press(page, '[data-calendly-consent]', view.hasTouch);
            const iframe = await page.waitForSelector('#booking-frame iframe', { timeout: 30000 });
            const frame = await iframe.contentFrame();
            await frame.waitForSelector('button[aria-label*="Times available"]', { timeout: 45000 });
            await sleep(1500);
          }
          await sleep(400);
          if (state === 'menu' || state === 'booking-question') {
            // Seen where they open, at the top of the screen.
            const file = `${name}-01.png`;
            await page.screenshot({ path: path.join(SHOTS, file) });
            Object.assign(run, { height: view.height, stops: [{ file, y: 0 }], scrollSeconds: 0, pixelsPerSecond: null });
          } else Object.assign(run, await pass(page, name));
        } catch (e) {
          run.error = e.message;
        }
        run.pageErrors = errors;
        runs.push(run);
        console.log(`${run.error ? 'ERROR' : 'done '} ${name.padEnd(30)} ${String(run.height ?? '?').padStart(5)} px  ${String(run.stops?.length ?? 0).padStart(2)} captures  ${run.scrollSeconds ?? '?'} s scrolling (${run.pixelsPerSecond ?? '-'} px/s)${run.error ? `  ${run.error}` : ''}`);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
const captures = runs.reduce((n, r) => n + (r.stops?.length ?? 0), 0);
const pageWidths = new Set(runs.filter((r) => r.state === 'page' && !r.error).map((r) => `${r.page} ${r.width}`)).size;
if (!arg('pages') && !arg('widths')) writeJson('human-pass.json', { speed: SPEED, pause: PAUSE, pageWidths, captures, runs });
console.log(`\n${pageWidths} page-widths and ${runs.length - pageWidths} opened states, ${captures} captures in ${path.relative(process.cwd(), SHOTS)}; ${runs.filter((r) => r.error || r.pageErrors.length).length} with errors.`);
process.exitCode = runs.some((r) => r.error || r.pageErrors.length) ? 1 : 0;
