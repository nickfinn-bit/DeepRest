// A PDF of every page for review, made with Chrome's print-to-PDF at desktop width
// (1,440px). Each page prints as one continuous sheet, the height of the page, using
// the screen styles so the PDF shows the site as visitors see it. Also writes one
// combined PDF of every page, and the booking page with Calendly's calendar loaded.
//   node scripts/verify/pdf.mjs [--live]
import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import puppeteer from 'puppeteer';
import { OUT, PAGES, pageUrl, sleep } from './common.mjs';

const WIDTH = 1440;
const DIR = path.join(OUT, 'pdf');
fs.mkdirSync(DIR, { recursive: true });

async function printPage(page, file) {
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
  await page.pdf({ path: file, width: `${WIDTH}px`, height: `${height + 2}px`, printBackground: true, pageRanges: '1' });
  return height;
}

const browser = await puppeteer.launch();
console.log(`Chrome ${await browser.version()} (pid ${browser.process()?.pid})`);
const files = [];
try {
  for (const p of PAGES) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: WIDTH, height: 900 });
    await page.emulateMediaType('screen');
    await page.goto(pageUrl(p), { waitUntil: 'networkidle0' });
    const file = path.join(DIR, `${p.slug}.pdf`);
    const height = await printPage(page, file);
    files.push({ name: p.name, file });
    console.log(`${path.relative(OUT, file)}  ${WIDTH} x ${height}px`);
    await context.close();
  }
} finally {
  await browser.close();
}

// The booking page once the visitor has chosen to show Calendly's calendar. Chrome's
// print-to-PDF leaves a cross-origin iframe blank when it runs in its own process (only
// Calendly's loading spinner printed), so this one page is printed by a browser
// started without site isolation, which draws the iframe in the page's own process.
const isolationOff = await puppeteer.launch({ args: ['--disable-site-isolation-trials', '--disable-features=IsolateOrigins,site-per-process'] });
try {
  const page = await isolationOff.newPage();
  await page.setViewport({ width: WIDTH, height: 900 });
  await page.emulateMediaType('screen');
  await page.goto(pageUrl(PAGES.find((p) => p.slug === 'book')), { waitUntil: 'networkidle0' });
  await page.click('[data-calendly-consent]');
  const iframe = await page.waitForSelector('#booking-frame iframe', { timeout: 30000 });
  for (let i = 0; i < 120; i++) {
    const frame = await iframe.contentFrame();
    if (frame && (await frame.$('button[aria-label*="Times available"]').catch(() => null))) break;
    await sleep(250);
  }
  await sleep(1500);
  const file = path.join(DIR, 'book-calendar-loaded.pdf');
  await printPage(page, file);
  files.push({ name: 'Book a free session, calendar loaded', file });
  console.log(path.relative(OUT, file));
} finally {
  await isolationOff.close();
}

// One PDF with every page, in site order.
const combined = await PDFDocument.create();
for (const { file } of files) {
  const doc = await PDFDocument.load(fs.readFileSync(file));
  for (const pg of await combined.copyPages(doc, doc.getPageIndices())) combined.addPage(pg);
}
combined.setTitle('DeepRest website: every page at desktop width');
const all = path.join(DIR, 'DeepRest-all-pages.pdf');
fs.writeFileSync(all, await combined.save());
console.log(`${path.relative(OUT, all)}  ${combined.getPageCount()} pages`);
