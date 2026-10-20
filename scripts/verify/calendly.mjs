// Calendly checks, with Puppeteer:
//  1. Booking page, at every width: nothing is fetched from Calendly before the visitor
//     chooses; the inline calendar then loads and its booking flow opens (day, time,
//     Next, details form). The form is never submitted. With the choice remembered, the
//     calendar loads by itself without layout shift.
//  2. Every page, at every width: the header button asks first, then opens Calendly's
//     popup; with the choice remembered it opens the popup straight away.
//  3. Without JavaScript the header button is a plain link to the booking page.
// It also records the cookies Calendly sets, for the cookie notice (src/data/calendly-cookies.json).
// With --live it tests the published site, and compares the cookies with that list instead.
//   node scripts/verify/calendly.mjs [--live] [--widths=360,1440] [--pages=home,book] [--skip-popup] [--skip-inline]
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { LIVE, OUT, PAGES, ROOT, WIDTHS, pageUrl, sleep, viewportFor, writeJson } from './common.mjs';

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const widths = arg('widths') ? arg('widths').split(',').map(Number) : WIDTHS;
const pages = arg('pages') ? PAGES.filter((p) => arg('pages').split(',').includes(p.slug)) : PAGES;
const BOOK = PAGES.find((p) => p.slug === 'book');
const SHOTS = path.join(OUT, 'calendly');
fs.mkdirSync(SHOTS, { recursive: true });

const isCalendly = (url) => /(^|\.)calendly\.com/.test(new URL(url).hostname);

async function poll(fn, timeout = 30000, step = 250) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try {
      const v = await fn();
      if (v) return v;
    } catch {
      /* frame still navigating */
    }
    await sleep(step);
  }
  return null;
}

// The Calendly scheduling frame inside an iframe element, once its calendar is drawn.
async function calendarFrame(iframeHandle) {
  return poll(async () => {
    const frame = await iframeHandle.contentFrame();
    if (!frame || !isCalendly(frame.url())) return null;
    const days = await frame.$$('button[aria-label*="Times available"]');
    return days.length ? frame : null;
  }, 45000);
}

// Calendly's own cookie banner, shown inside the calendar to visitors in some regions.
async function declineCalendlyOptionalCookies(frame, touch) {
  const button = await poll(() => frame.$('#onetrust-reject-all-handler'), 4000);
  if (!button) return false;
  await press(button, touch);
  await poll(async () => !(await frame.$('#onetrust-banner-sdk:not([style*="display: none"])')) || true, 3000);
  await sleep(600);
  return true;
}

// Phones and tablets are emulated as touch screens, where Calendly responds to taps, not mouse clicks.
const press = (handle, touch) => (touch ? handle.tap() : handle.click());
const pressSelector = (page, selector, touch) => (touch ? page.tap(selector) : page.click(selector));

// Day, time, Next: stops at the details form, which is never submitted.
async function openBookingFlow(frame, touch) {
  const steps = [];
  let day = await frame.$('button[aria-label*="Times available"]:not([disabled])');
  if (!day) {
    const nextMonth = await frame.$('button[aria-label="Go to next month"]');
    if (nextMonth) await press(nextMonth, touch);
    day = await poll(() => frame.$('button[aria-label*="Times available"]:not([disabled])'), 10000);
  }
  if (!day) return { ok: false, steps, reason: 'no day with times available' };
  steps.push(`day: ${await day.evaluate((b) => b.getAttribute('aria-label'))}`);
  await press(day, touch);

  const time = await poll(async () => {
    for (const b of await frame.$$('button')) {
      const text = (await b.evaluate((el) => el.innerText.trim())) || '';
      if (/^\d{1,2}:\d{2}\s?(am|pm)?$/i.test(text)) return b;
    }
    return null;
  }, 15000);
  if (!time) return { ok: false, steps, reason: 'no time slots shown' };
  steps.push(`time: ${await time.evaluate((b) => b.innerText.trim())}`);
  const findNext = async () => {
    for (const b of await frame.$$('button')) {
      if ((await b.evaluate((el) => el.innerText.trim())) === 'Next') return b;
    }
    return null;
  };
  // Calendly slides the time list in; a press during the slide can be lost, as a
  // person's tap could be, so let it settle and press again if Next does not appear.
  let next = null;
  for (let attempt = 1; attempt <= 3 && !next; attempt++) {
    await sleep(1200);
    await press(time, touch);
    next = await poll(findNext, 5000);
    if (!next && attempt < 3) steps.push('time pressed again');
  }
  if (!next) return { ok: false, steps, reason: 'no Next button after choosing a time' };
  steps.push('next');
  await press(next, touch);

  const email = await poll(() => frame.$('input[type="email"], input[name="email"]'), 15000);
  if (!email) return { ok: false, steps, reason: 'details form did not appear' };
  const fields = await frame.$$eval('input:not([type="hidden"]), textarea', (els) =>
    els.map((e) => e.getAttribute('name') || e.getAttribute('type')).filter(Boolean),
  );
  steps.push(`details form: ${fields.join(', ')}`);
  return { ok: true, steps };
}

async function cookies(page) {
  const client = await page.createCDPSession();
  const { cookies: list } = await client.send('Network.getAllCookies');
  await client.detach();
  return list.map((c) => ({ name: c.name, domain: c.domain }));
}

const CSP_WATCH = () => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
  window.__cls = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({ type: 'layout-shift', buffered: true });
};

const browser = await puppeteer.launch();
console.log(`Chrome ${await browser.version()} (pid ${browser.process()?.pid})`);
const inline = [];
const popup = [];
let observedCookies = null;

try {
  // 1. Inline calendar on the booking page.
  if (!process.argv.includes('--skip-inline')) {
    for (const width of widths) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport(viewportFor(width));
      await page.evaluateOnNewDocument(CSP_WATCH);
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      let calendlyRequests = 0;
      page.on('request', (r) => isCalendly(r.url()) && calendlyRequests++);
      const row = { width };
      const touch = viewportFor(width).hasTouch;
      try {
        await page.goto(pageUrl(BOOK), { waitUntil: 'networkidle0' });
        row.requestsBeforeChoice = calendlyRequests;
        row.cookiesBeforeChoice = (await cookies(page)).length;
        await pressSelector(page, '[data-calendly-consent]', touch);
        const iframe = await page.waitForSelector('#booking-frame iframe', { timeout: 30000 });
        const frame = await calendarFrame(iframe);
        row.calendarLoaded = Boolean(frame);
        if (frame) {
          await sleep(1500);
          if (width === 1440) {
            const seen = await cookies(page);
            observedCookies = { checked: new Date().toISOString(), cookies: seen };
          }
          row.calendlyCookieBanner = await declineCalendlyOptionalCookies(frame, touch);
          const flow = await openBookingFlow(frame, touch);
          Object.assign(row, { flowOpened: flow.ok, flowSteps: flow.steps, flowProblem: flow.reason });
          await iframe.scrollIntoView();
          await sleep(800);
          await page.screenshot({ path: path.join(SHOTS, `inline-${width}.png`) });
        }
        // The choice is remembered: reload and the calendar loads by itself.
        await page.reload({ waitUntil: 'domcontentloaded' });
        const again = await page.waitForSelector('#booking-frame iframe', { timeout: 30000 });
        row.autoLoadsWhenRemembered = Boolean(await calendarFrame(again));
        await sleep(1500);
        row.clsWhenRemembered = await page.evaluate(() => window.__cls);
        row.cspViolations = await page.evaluate(() => window.__csp);
      } catch (e) {
        row.error = e.message;
      }
      row.pageErrors = errors;
      row.pass =
        row.requestsBeforeChoice === 0 &&
        row.cookiesBeforeChoice === 0 &&
        row.calendarLoaded &&
        row.flowOpened &&
        row.autoLoadsWhenRemembered &&
        row.clsWhenRemembered < 0.1 &&
        !row.cspViolations?.length &&
        !errors.length &&
        !row.error;
      inline.push(row);
      console.log(
        `${row.pass ? 'PASS' : 'FAIL'} inline ${String(width).padStart(4)}px  before choice: ${row.requestsBeforeChoice} requests, ${row.cookiesBeforeChoice} cookies  calendar ${row.calendarLoaded}  flow ${row.flowOpened} (${(row.flowSteps || []).join(' > ')})  remembered ${row.autoLoadsWhenRemembered} CLS ${row.clsWhenRemembered?.toFixed(4)}  CSP ${row.cspViolations?.length ?? '?'}${row.error ? `  ERROR ${row.error}` : ''}${row.flowProblem ? `  PROBLEM ${row.flowProblem}` : ''}`,
      );
      await context.close();
    }
  }

  // 2. Header popup on every page.
  if (!process.argv.includes('--skip-popup')) {
    for (const width of widths) {
      for (const p of pages) {
        const context = await browser.createBrowserContext();
        const page = await context.newPage();
        await page.setViewport(viewportFor(width));
        await page.evaluateOnNewDocument(CSP_WATCH);
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        const row = { page: p.slug, width };
        const touch = viewportFor(width).hasTouch;
        try {
          await page.goto(pageUrl(p), { waitUntil: 'networkidle0' });
          await pressSelector(page, '.site-header [data-calendly-popup]', touch);
          row.askedFirst = Boolean(await poll(() => page.$('#calendly-consent[open]'), 3000));
          await pressSelector(page, '#calendly-consent button[value="continue"]', touch);
          const iframe = await page.waitForSelector('.calendly-overlay iframe', { timeout: 30000 });
          row.popupOpened = Boolean(await calendarFrame(iframe));
          if (width === 360 || width === 1440) await page.screenshot({ path: path.join(SHOTS, `popup-${p.slug}-${width}.png`) });
          await pressSelector(page, '.calendly-popup-close', touch);
          row.popupClosed = Boolean(await poll(async () => !(await page.$('.calendly-overlay')), 5000));
          // Remembered choice: straight to the popup.
          await page.reload({ waitUntil: 'networkidle0' });
          await pressSelector(page, '.site-header [data-calendly-popup]', touch);
          const iframe2 = await page.waitForSelector('.calendly-overlay iframe', { timeout: 30000 });
          row.skippedQuestionWhenRemembered = !(await page.$('#calendly-consent[open]'));
          row.popupOpenedWhenRemembered = Boolean(await calendarFrame(iframe2));
          row.cspViolations = await page.evaluate(() => window.__csp);
        } catch (e) {
          row.error = e.message;
        }
        row.pageErrors = errors;
        row.pass =
          row.askedFirst &&
          row.popupOpened &&
          row.popupClosed &&
          row.skippedQuestionWhenRemembered &&
          row.popupOpenedWhenRemembered &&
          !row.cspViolations?.length &&
          !errors.length &&
          !row.error;
        popup.push(row);
        console.log(
          `${row.pass ? 'PASS' : 'FAIL'} popup ${p.slug.padEnd(8)} ${String(width).padStart(4)}px  asked ${row.askedFirst}  opened ${row.popupOpened}  closed ${row.popupClosed}  remembered ${row.popupOpenedWhenRemembered}${row.error ? `  ERROR ${row.error}` : ''}`,
        );
        await context.close();
      }
    }
  }

  // 3. Without JavaScript.
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setJavaScriptEnabled(false);
  await page.setViewport(viewportFor(390));
  await page.goto(pageUrl(PAGES[0]), { waitUntil: 'networkidle0' });
  await Promise.all([page.waitForNavigation(), page.click('.site-header [data-calendly-popup]')]);
  const noJs = {
    landsOnBookingPage: page.url() === pageUrl(BOOK),
    explainsAndLinksToCalendly: await page.$eval('.booking-gate', (g) =>
      getComputedStyle(g.querySelector('.booking-gate-nojs')).display !== 'none' && Boolean(g.querySelector('.booking-gate-alt a[href*="calendly.com"]')),
    ),
  };
  noJs.pass = noJs.landsOnBookingPage && noJs.explainsAndLinksToCalendly;
  console.log(`${noJs.pass ? 'PASS' : 'FAIL'} no JavaScript: header button goes to the booking page, which links to Calendly`);
  await context.close();

  // Compare the cookies seen with the list on the cookie notice. Locally the list is then
  // replaced by what was seen; with --live it is only compared.
  const cookieFile = path.join(ROOT, 'src', 'data', 'calendly-cookies.json');
  let cookieComparison = null;
  if (observedCookies) {
    observedCookies.cookies.sort((a, b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));
    const key = (c) => `${c.name} ${c.domain}`;
    const listed = fs.existsSync(cookieFile) ? JSON.parse(fs.readFileSync(cookieFile, 'utf8')).cookies.map(key) : [];
    const seen = observedCookies.cookies.map(key);
    cookieComparison = { notListed: seen.filter((k) => !listed.includes(k)), listedNotSeen: listed.filter((k) => !seen.includes(k)) };
    console.log(`Cookies seen at 1440px: ${seen.length}; not on the cookie notice: ${cookieComparison.notListed.length}; on it but not seen now: ${cookieComparison.listedNotSeen.length}`);
  }
  if (!arg('widths') && !arg('pages')) {
    writeJson('calendly.json', { inline, popup, noJs, cookiesSeen: observedCookies, cookieComparison });
    if (observedCookies && !LIVE) fs.writeFileSync(cookieFile, `${JSON.stringify(observedCookies, null, 2)}\n`);
  }
  const all = [...inline, ...popup, noJs];
  const failed = all.filter((r) => !r.pass);
  console.log(`\n${all.length - failed.length}/${all.length} Calendly checks pass.`);
  process.exitCode = failed.length ? 1 : 0;
} finally {
  await browser.close();
}
