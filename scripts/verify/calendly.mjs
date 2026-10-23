// Calendly checks, with Puppeteer:
//  1. Booking page, at every width: nothing is fetched from Calendly before the visitor
//     chooses; the inline calendar then loads and its booking flow opens (day, time,
//     Next, details form). The form is never submitted. With the choice remembered, the
//     calendar loads by itself without layout shift.
//  2. Every page, at every width: the header button asks first, then opens Calendly's
//     popup; with the choice remembered it opens the popup straight away.
//  3. Without JavaScript the header button is a plain link to the booking page.
// It also records every outside service the booking flow loads, up to the details form: the
// hosts the browser contacted, the cookies set and the items each frame stored. That is done
// twice at 1,440 px, once declining Calendly's optional cookies and once accepting them, and
// written to src/data/calendly-third-parties.json, from which the privacy policy and cookie
// notice are built. With --live it tests the published site and leaves that file as it is;
// facts.mjs then compares what was measured with what the live pages name.
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
const SITE_HOST = new URL(pageUrl(BOOK)).hostname;
const hostOf = (url) => {
  try {
    const u = new URL(url);
    return /^https?:$/.test(u.protocol) ? u.hostname : null;
  } catch {
    return null;
  }
};

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
// Given a page and a selector instead, it finds the iframe afresh each time it looks.
async function calendarFrame(iframeHandle, selector) {
  return poll(async () => {
    const handle = selector ? await iframeHandle.$(selector) : iframeHandle;
    const frame = handle && (await handle.contentFrame());
    if (!frame || !isCalendly(frame.url())) return null;
    const days = await frame.$$('button[aria-label*="Times available"]');
    return days.length ? frame : null;
  }, 45000);
}

// Everything the booking flow has touched so far: the hosts contacted (from the requests seen
// and from each frame's own record of what it loaded), the cookies set, and the keys each
// frame keeps in local and session storage. The site's own host and storage are left out.
async function observe(page, requested) {
  const hosts = new Set(requested);
  const storage = new Map();
  for (const f of page.frames()) {
    try {
      const seen = await f.evaluate(() => ({
        origin: self.origin,
        resources: performance.getEntriesByType('resource').map((e) => e.name),
        local: Object.keys(localStorage),
        session: Object.keys(sessionStorage),
      }));
      for (const u of seen.resources) hosts.add(hostOf(u));
      if (!/^https?:/.test(seen.origin) || hostOf(seen.origin) === SITE_HOST) continue;
      for (const type of ['local', 'session']) for (const key of seen[type]) storage.set(`${type} ${seen.origin} ${key}`, { type, origin: seen.origin, key });
    } catch {
      /* a frame that has gone, or one that blocks storage */
    }
  }
  const client = await page.createCDPSession();
  const { cookies: list } = await client.send('Network.getAllCookies');
  await client.detach();
  const now = Date.now() / 1000;
  hosts.delete(null);
  hosts.delete(SITE_HOST);
  return {
    hosts: [...hosts].sort(),
    cookies: list
      .filter((c) => c.domain.replace(/^\./, '') !== SITE_HOST)
      .map((c) => ({ name: c.name, domain: c.domain, seconds: c.session || c.expires <= 0 ? null : Math.round(c.expires - now) }))
      .sort((a, b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name)),
    storage: [...storage.values()].sort((a, b) => a.origin.localeCompare(b.origin) || a.type.localeCompare(b.type) || a.key.localeCompare(b.key)),
  };
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

// Calendly's banner again, this time accepting every optional cookie, to see what that adds.
async function acceptCalendlyOptionalCookies(frame, touch) {
  const button = await poll(() => frame.$('#onetrust-accept-btn-handler'), 4000);
  if (!button) return false;
  await press(button, touch);
  await sleep(2500);
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
const thirdParties = { checked: null, declined: null, accepted: null };
let calendarText = null;

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
      let outsideRequests = 0;
      const requested = new Set();
      page.on('request', (r) => {
        if (isCalendly(r.url())) calendlyRequests++;
        const host = hostOf(r.url());
        if (host && host !== SITE_HOST) {
          outsideRequests++;
          requested.add(host);
        }
      });
      const row = { width };
      const touch = viewportFor(width).hasTouch;
      try {
        await page.goto(pageUrl(BOOK), { waitUntil: 'networkidle0' });
        row.requestsBeforeChoice = calendlyRequests;
        row.outsideRequestsBeforeChoice = outsideRequests;
        row.cookiesBeforeChoice = (await cookies(page)).length;
        row.bookAnotherHiddenBeforeChoice = !(await page.$eval('[data-booking-next]', (el) => el.checkVisibility()));
        await pressSelector(page, '[data-calendly-consent]', touch);
        const iframe = await page.waitForSelector('#booking-frame iframe', { timeout: 30000 });
        const frame = await calendarFrame(iframe);
        row.calendarLoaded = Boolean(frame);
        if (frame) {
          await sleep(1500);
          if (width === 1440) calendarText = await frame.evaluate(() => document.body.innerText.slice(0, 1500));
          row.calendlyCookieBanner = await declineCalendlyOptionalCookies(frame, touch);
          const flow = await openBookingFlow(frame, touch);
          Object.assign(row, { flowOpened: flow.ok, flowSteps: flow.steps, flowProblem: flow.reason });
          await iframe.scrollIntoView();
          await sleep(800);
          await page.screenshot({ path: path.join(SHOTS, `inline-${width}.png`) });
          if (width === 1440 && flow.ok) {
            await sleep(6000); // reCAPTCHA and the rest of the details form
            thirdParties.checked = new Date().toISOString();
            thirdParties.declined = await observe(page, requested);
          }
          // Booking the next session: Calendly tells the page when a session is booked. The
          // test never books, so it sends the page that same message itself, then presses
          // "Book another session", which must bring back a fresh calendar.
          row.bookAnotherShown = await page.$eval('[data-booking-next]', (el) => el.checkVisibility());
          await page.evaluate(() =>
            window.dispatchEvent(new MessageEvent('message', { origin: 'https://calendly.com', data: { event: 'calendly.event_scheduled', payload: {} } })),
          );
          row.bookedMessageShown = await page.$eval('[data-booking-next]', (el) => el.classList.contains('is-booked'));
          await pressSelector(page, '[data-calendly-restart]', touch);
          row.bookAnotherRestarts = Boolean(await calendarFrame(page, '#booking-frame iframe'));
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
        row.outsideRequestsBeforeChoice === 0 &&
        row.cookiesBeforeChoice === 0 &&
        row.bookAnotherHiddenBeforeChoice &&
        row.calendarLoaded &&
        row.flowOpened &&
        row.bookAnotherShown &&
        row.bookedMessageShown &&
        row.bookAnotherRestarts &&
        row.autoLoadsWhenRemembered &&
        row.clsWhenRemembered < 0.1 &&
        !row.cspViolations?.length &&
        !errors.length &&
        !row.error;
      inline.push(row);
      console.log(
        `${row.pass ? 'PASS' : 'FAIL'} inline ${String(width).padStart(4)}px  before choice: ${row.requestsBeforeChoice} Calendly requests, ${row.outsideRequestsBeforeChoice} outside requests, ${row.cookiesBeforeChoice} cookies  calendar ${row.calendarLoaded}  flow ${row.flowOpened} (${(row.flowSteps || []).join(' > ')})  book another: shown ${row.bookAnotherShown}, after booking ${row.bookedMessageShown}, restarts ${row.bookAnotherRestarts}  remembered ${row.autoLoadsWhenRemembered} CLS ${row.clsWhenRemembered?.toFixed(4)}  CSP ${row.cspViolations?.length ?? '?'}${row.error ? `  ERROR ${row.error}` : ''}${row.flowProblem ? `  PROBLEM ${row.flowProblem}` : ''}`,
      );
      await context.close();
    }
  }

  // 1b. What accepting Calendly's optional cookies adds, at 1,440 px.
  if (!process.argv.includes('--skip-inline') && widths.includes(1440)) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport(viewportFor(1440));
    const requested = new Set();
    try {
      await page.goto(pageUrl(BOOK), { waitUntil: 'networkidle0' });
      page.on('request', (r) => {
        const host = hostOf(r.url());
        if (host && host !== SITE_HOST) requested.add(host);
      });
      await page.click('[data-calendly-consent]');
      const frame = await calendarFrame(await page.waitForSelector('#booking-frame iframe', { timeout: 30000 }));
      const accepted = frame && (await acceptCalendlyOptionalCookies(frame, false));
      const flow = frame ? await openBookingFlow(frame, false) : { ok: false };
      if (flow.ok) await sleep(6000);
      thirdParties.accepted = { ...(await observe(page, requested)), bannerAccepted: Boolean(accepted), detailsForm: flow.ok };
      console.log(`Accepting Calendly's optional cookies: banner ${Boolean(accepted)}, details form ${flow.ok}, ${thirdParties.accepted.hosts.length} outside hosts`);
    } catch (e) {
      thirdParties.acceptedError = e.message;
      console.log(`Accepting Calendly's optional cookies: ERROR ${e.message}`);
    }
    await context.close();
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

  // What the booking flow loaded, by banner choice. Locally it replaces the list the privacy
  // policy and cookie notice are built from; with --live, facts.mjs compares it with the pages.
  const measured = Boolean(thirdParties.declined && thirdParties.accepted?.detailsForm && thirdParties.accepted?.bannerAccepted);
  if (thirdParties.declined) {
    console.log(`Outside hosts up to the details form, declining Calendly's optional cookies: ${thirdParties.declined.hosts.join(', ')}`);
    console.log(`Cookies: ${thirdParties.declined.cookies.map((c) => `${c.name} (${c.domain})`).join(', ')}`);
  }
  if (thirdParties.accepted) {
    const extra = thirdParties.accepted.hosts.filter((h) => !thirdParties.declined?.hosts.includes(h));
    console.log(`Hosts added by accepting them: ${extra.join(', ') || 'none'}`);
  }
  if (!arg('widths') && !arg('pages')) {
    writeJson('calendly.json', { inline, popup, noJs, thirdParties, calendarText });
    if (measured && !LIVE) {
      const { checked, declined, accepted } = thirdParties;
      const { bannerAccepted, detailsForm, ...acceptedSeen } = accepted;
      fs.mkdirSync(path.join(ROOT, 'src', 'data'), { recursive: true });
      fs.writeFileSync(path.join(ROOT, 'src', 'data', 'calendly-third-parties.json'), `${JSON.stringify({ checked, declined, accepted: acceptedSeen }, null, 2)}\n`);
    }
  }
  const all = [...inline, ...popup, noJs];
  if (widths.includes(1440) && !process.argv.includes('--skip-inline')) all.push({ pass: measured, name: 'outside services measured both ways' });
  const failed = all.filter((r) => !r.pass);
  console.log(`\n${all.length - failed.length}/${all.length} Calendly checks pass.`);
  process.exitCode = failed.length ? 1 : 0;
} finally {
  await browser.close();
}
