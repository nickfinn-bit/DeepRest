// For every page at every width: horizontal scroll, layout shift during load,
// text cut off or overlapping, and a full-page screenshot. On the booking page, the booking
// frame before the visitor chooses to load Calendly: how much of it is blank, and the tallest
// empty band in it, which must be no more than BLANK_BAND pixels.
//   node scripts/verify/layout.mjs [--live] [--pages=home,book] [--widths=360,1440] [--no-shots]
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { OUT, PAGES, WIDTHS, pageUrl, sleep, viewportFor, writeJson } from './common.mjs';

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const pages = arg('pages') ? PAGES.filter((p) => arg('pages').split(',').includes(p.slug)) : PAGES;
const widths = arg('widths') ? arg('widths').split(',').map(Number) : WIDTHS;
const shots = !process.argv.includes('--no-shots');

// The tallest empty band allowed in the booking frame before the choice: 5rem, about three
// lines of text. A taller one would read as an empty panel.
const BLANK_BAND = 80;

// Runs before any page script: adds up every layout shift not caused by input.
const CLS_OBSERVER = () => {
  window.__cls = 0;
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__cls += e.value;
      window.__shifts.push({
        value: e.value,
        sources: (e.sources || []).map((s) => (s.node ? `${s.node.nodeName}.${s.node.className || ''}` : '?')),
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
};

// Runs in the page after load.
function inspect() {
  const vw = document.documentElement.clientWidth;
  const hidden = (el) => {
    // Not rendered at all, e.g. the answer inside a closed <details>.
    if (!el.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true })) return true;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return true;
      const r = n.getBoundingClientRect();
      if (cs.position === 'absolute' && r.width <= 1 && r.height <= 1) return true; // visually hidden
    }
    return false;
  };
  const label = (el) =>
    `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.classList.length ? `.${[...el.classList].join('.')}` : ''}`;

  // Elements that reach past the right or left edge of the viewport.
  const offenders = [];
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || hidden(el)) continue;
    let clipped = false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).overflowX !== 'visible') {
        clipped = true;
        break;
      }
    }
    if (!clipped && (r.right > vw + 0.5 || r.left < -0.5)) offenders.push(`${label(el)} [${Math.round(r.left)}, ${Math.round(r.right)}]`);
  }

  // Every line of visible text, as rectangles.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const lines = [];
  const cut = [];
  let id = 0;
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    if (!t.textContent.trim()) continue;
    const el = t.parentElement;
    if (!el || hidden(el) || el.closest('script,style,noscript,dialog:not([open])')) continue;
    const range = document.createRange();
    range.selectNodeContents(t);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
    id += 1;
    for (const r of rects) {
      lines.push({ id, el, r });
      // Cut off by the viewport, or by an ancestor that hides overflow?
      if (r.right > vw + 0.5 || r.left < -0.5) cut.push(`${label(el)} "${t.textContent.trim().slice(0, 40)}" beyond viewport`);
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
        const box = a.getBoundingClientRect();
        if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1) {
          cut.push(`${label(el)} "${t.textContent.trim().slice(0, 40)}" clipped by ${label(a)}`);
        }
      }
    }
    if (getComputedStyle(el).textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth) cut.push(`${label(el)} ellipsis`);
  }

  // Lines of different text that cover each other. Glyph boxes of neighbouring lines
  // may touch slightly, so only an overlap of over a quarter of the smaller line counts.
  const overlaps = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i];
      const b = lines[j];
      if (a.id === b.id) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w <= 1 || h <= 1) continue;
      const smaller = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      if (w * h > 0.25 * smaller) {
        overlaps.push(`${label(a.el)} "${a.el.textContent.trim().slice(0, 30)}" / ${label(b.el)} "${b.el.textContent.trim().slice(0, 30)}"`);
      }
    }
  }

  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: vw,
    horizontalScroll: Math.max(0, document.documentElement.scrollWidth - vw, document.body.scrollWidth - vw),
    offenders: offenders.slice(0, 10),
    cut: [...new Set(cut)].slice(0, 10),
    overlaps: [...new Set(overlaps)].slice(0, 10),
    textLines: lines.length,
    serifLoaded: document.fonts.check('16px "Source Serif 4"'),
    height: document.documentElement.scrollHeight,
  };
}

// Runs in the booking page before the choice: the frame's height, the parts of it its message,
// icon, button and links cover, and the empty bands between them and the frame's edges.
function bookingFrame() {
  const frame = document.querySelector('#booking-frame');
  if (!frame) return null;
  const f = frame.getBoundingClientRect();
  const shown = [...frame.querySelectorAll('.booking-gate-inner > *, .booking-loading')]
    .filter((el) => el.checkVisibility({ visibilityProperty: true }))
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.height > 0)
    .sort((a, b) => a.top - b.top);
  const bands = [];
  let edge = f.top;
  let covered = 0;
  for (const r of shown) {
    if (r.top > edge) bands.push(r.top - edge);
    covered += Math.max(0, r.bottom - Math.max(edge, r.top));
    edge = Math.max(edge, r.bottom);
  }
  bands.push(f.bottom - edge);
  return {
    consented: document.documentElement.classList.contains('calendly-consented'),
    height: Math.round(f.height),
    covered: Math.round(covered),
    blank: Math.round(f.height - covered),
    largestBand: Math.round(Math.max(...bands)),
    topBand: Math.round(bands[0]),
    bottomBand: Math.round(bands[bands.length - 1]),
    shown: shown.length,
  };
}

const browser = await puppeteer.launch();
console.log(`Chrome ${await browser.version()} (pid ${browser.process()?.pid})`);
const results = [];
try {
  for (const p of pages) {
    for (const width of widths) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport(viewportFor(width));
      await page.evaluateOnNewDocument(CLS_OBSERVER);
      const errors = [];
      page.on('console', (m) => {
        // The 404 page is itself served with status 404, as GitHub Pages does; Chrome logs that.
        if (m.type() !== 'error') return;
        if (p.slug === '404' && /status of 404/.test(m.text()) && m.location()?.url === pageUrl(p)) return;
        errors.push(`${m.text()} ${m.location()?.url || ''}`);
      });
      page.on('pageerror', (e) => errors.push(e.message));
      const response = await page.goto(pageUrl(p), { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      await sleep(800);
      const r = await page.evaluate(inspect);
      const cls = await page.evaluate(() => ({ cls: window.__cls, shifts: window.__shifts }));
      const frame = p.slug === 'book' ? { ...(await page.evaluate(bookingFrame)), limit: BLANK_BAND } : undefined;
      const dir = path.join(OUT, 'screenshots', p.slug);
      if (shots) {
        fs.mkdirSync(dir, { recursive: true });
        await page.screenshot({ path: path.join(dir, `${width}.png`), fullPage: true });
      }
      // Pages with collapsed answers are checked again with every answer open.
      if (await page.$('details:not([open])')) {
        await page.$$eval('details', (all) => all.forEach((d) => (d.open = true)));
        await sleep(300);
        const opened = await page.evaluate(inspect);
        for (const k of ['offenders', 'cut', 'overlaps']) r[k].push(...opened[k].map((x) => `(answers open) ${x}`));
        r.horizontalScroll = Math.max(r.horizontalScroll, opened.horizontalScroll);
        r.answersOpenChecked = true;
        if (shots) await page.screenshot({ path: path.join(dir, `${width}-answers-open.png`), fullPage: true });
      }
      const row = { page: p.slug, width, status: response.status(), ...r, cls: cls.cls, shifts: cls.shifts, consoleErrors: errors, bookingFrame: frame };
      const frameOk = !frame || (!frame.consented && frame.largestBand <= BLANK_BAND);
      row.pass = r.horizontalScroll === 0 && cls.cls < 0.1 && !r.cut.length && !r.overlaps.length && !r.offenders.length && frameOk;
      results.push(row);
      console.log(
        `${row.pass ? 'PASS' : 'FAIL'} ${p.slug.padEnd(8)} ${String(width).padStart(4)}px  scroll ${r.horizontalScroll}  CLS ${cls.cls.toFixed(4)}  cut ${r.cut.length}  overlaps ${r.overlaps.length}  outside ${r.offenders.length}  serif ${r.serifLoaded}  errors ${errors.length}`,
      );
      if (frame)
        console.log(
          `      ${frameOk ? 'PASS' : 'FAIL'} booking frame before the choice: ${frame.height}px tall, ${frame.covered}px covered, ${frame.blank}px blank, tallest empty band ${frame.largestBand}px (top ${frame.topBand}, bottom ${frame.bottomBand}; limit ${BLANK_BAND})`,
        );
      for (const k of ['offenders', 'cut', 'overlaps']) for (const x of r[k]) console.log(`      ${k}: ${x}`);
      for (const e of errors) console.log(`      console: ${e}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (!arg('pages') && !arg('widths')) writeJson('layout.json', results);
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} page-width combinations pass.`);
process.exitCode = failed.length ? 1 : 0;
