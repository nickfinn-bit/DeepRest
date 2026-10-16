// Lighthouse, mobile and desktop, on every page, against the local server
// (scripts/serve.mjs). Each page and form factor runs several times; the report keeps
// the median run (by Performance) and the lowest score seen in any run.
//   node scripts/verify/lighthouse.mjs [--runs=3] [--pages=home,book] [--retry-failed]
// --retry-failed runs again only the page and form-factor pairs that failed in
// verification/lighthouse.json, and keeps the failed attempt alongside the new one.
// Each run records its blocking time, Chrome's main-thread time and Lighthouse's CPU
// benchmark: this machine also runs other services, and when they take the CPU a page
// can get long main-thread tasks that are not its own work, which Lighthouse's mobile
// setting then multiplies by four.
import fs from 'node:fs';
import path from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse, { desktopConfig } from 'lighthouse';
import puppeteer from 'puppeteer';
import { BASE, OUT, PAGES, writeJson } from './common.mjs';

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const runs = Number(arg('runs') || 3);
const pages = arg('pages') ? PAGES.filter((p) => arg('pages').split(',').includes(p.slug)) : PAGES;
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const REPORTS = path.join(OUT, 'lighthouse');
fs.mkdirSync(REPORTS, { recursive: true });

const CHROME = await puppeteer.executablePath();

// Lighthouse will not audit a page served with status 404, so the error page is
// audited at its own file name, where the same file is served with status 200.
const urlFor = (p) => (p.slug === '404' ? `${BASE}404.html` : BASE + p.path);

// consented: the visitor has already chosen to load Calendly, so the booking calendar loads by itself.
async function runOnce(url, formFactor, consented = false) {
  const chrome = await chromeLauncher.launch({
    chromePath: CHROME,
    chromeFlags: ['--headless=new', '--no-first-run', '--disable-extensions'],
  });
  try {
    if (consented) {
      const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
      const page = await browser.newPage();
      await page.goto(BASE);
      await page.evaluate(() => localStorage.setItem('deeprest-calendly-consent', 'granted'));
      await page.close();
      await browser.disconnect();
    }
    const flags = { port: chrome.port, output: 'html', logLevel: 'error', onlyCategories: CATEGORIES, disableStorageReset: consented };
    const result = await lighthouse(url, flags, formFactor === 'desktop' ? desktopConfig : undefined);
    const lhr = result.lhr;
    if (lhr.runtimeError) throw new Error(`${lhr.runtimeError.code}: ${lhr.runtimeError.message}`);
    const scores = Object.fromEntries(CATEGORIES.map((c) => [c, Math.round(lhr.categories[c].score * 100)]));
    const metric = (id) => lhr.audits[id]?.numericValue;
    const failing = [];
    for (const c of CATEGORIES) {
      for (const ref of lhr.categories[c].auditRefs) {
        const a = lhr.audits[ref.id];
        if (ref.weight > 0 && a.score !== null && a.score < 1) failing.push(`${c}: ${a.id} (${a.score})`);
      }
    }
    const mainThread = lhr.audits['mainthread-work-breakdown']?.numericValue;
    return {
      scores,
      run: {
        scores,
        mainThreadMs: Math.round(mainThread),
        tbtMs: Math.round(metric('total-blocking-time')),
        benchmarkIndex: lhr.environment.benchmarkIndex,
        at: lhr.fetchTime,
      },
      metrics: {
        fcp: metric('first-contentful-paint'),
        lcp: metric('largest-contentful-paint'),
        tbt: metric('total-blocking-time'),
        cls: metric('cumulative-layout-shift'),
        si: metric('speed-index'),
      },
      failing,
      warnings: lhr.runWarnings,
      lighthouseVersion: lhr.lighthouseVersion,
      userAgent: lhr.environment.hostUserAgent,
      report: result.report,
    };
  } finally {
    chrome.kill();
  }
}

const previous = fs.existsSync(path.join(OUT, 'lighthouse.json'))
  ? JSON.parse(fs.readFileSync(path.join(OUT, 'lighthouse.json'), 'utf8'))
  : null;
const retry = process.argv.includes('--retry-failed');
if (retry && !previous) throw new Error('--retry-failed needs an earlier verification/lighthouse.json');
const results = retry ? previous.results.map((r) => ({ ...r })) : [];
for (const p of pages) {
  for (const formFactor of ['mobile', 'desktop']) {
    const earlier = retry ? results.find((r) => r.page === p.slug && r.formFactor === formFactor) : null;
    if (retry && earlier?.pass) continue;
    const all = [];
    for (let i = 0; i < runs; i++) all.push(await runOnce(urlFor(p), formFactor));
    const sorted = [...all].sort((a, b) => a.scores.performance - b.scores.performance);
    const median = sorted[Math.floor(sorted.length / 2)];
    const lowest = Object.fromEntries(CATEGORIES.map((c) => [c, Math.min(...all.map((r) => r.scores[c]))]));
    fs.writeFileSync(path.join(REPORTS, `${p.slug}-${formFactor}.html`), median.report);
    const row = {
      page: p.slug,
      url: urlFor(p),
      formFactor,
      runs,
      median: median.scores,
      lowest,
      metrics: median.metrics,
      failingAudits: [...new Set(all.flatMap((r) => r.failing))],
      warnings: [...new Set(all.flatMap((r) => r.warnings))],
      lighthouseVersion: median.lighthouseVersion,
      eachRun: all.map((r) => r.run),
    };
    if (earlier) row.failedAttempt = { median: earlier.median, lowest: earlier.lowest, eachRun: earlier.eachRun, failedAttempt: earlier.failedAttempt };
    row.pass = CATEGORIES.every((c) => lowest[c] >= 95);
    if (earlier) results[results.indexOf(earlier)] = row;
    else results.push(row);
    console.log(
      `${row.pass ? 'PASS' : 'FAIL'} ${p.slug.padEnd(8)} ${formFactor.padEnd(7)} median ${CATEGORIES.map((c) => row.median[c]).join('/')}  lowest ${CATEGORIES.map((c) => lowest[c]).join('/')}  LCP ${Math.round(row.metrics.lcp)}ms TBT ${Math.round(row.metrics.tbt)}ms CLS ${row.metrics.cls.toFixed(3)}`,
    );
    for (const f of row.failingAudits) console.log(`      ${f}`);
    for (const w of row.warnings) console.log(`      warning: ${w}`);
  }
}
// Supplementary: the booking page for a returning visitor whose calendar loads at once.
// Not part of the pass mark, which is about what every visitor gets first.
const supplementary = [];
if ((!arg('pages') && !retry) || process.argv.includes('--consented')) {
  const book = PAGES.find((p) => p.slug === 'book');
  for (const formFactor of ['mobile', 'desktop']) {
    const all = [];
    for (let i = 0; i < runs; i++) all.push(await runOnce(urlFor(book), formFactor, true));
    const sorted = [...all].sort((a, b) => a.scores.performance - b.scores.performance);
    const median = sorted[Math.floor(sorted.length / 2)];
    const lowest = Object.fromEntries(CATEGORIES.map((c) => [c, Math.min(...all.map((r) => r.scores[c]))]));
    fs.writeFileSync(path.join(REPORTS, `book-calendar-loaded-${formFactor}.html`), median.report);
    const row = {
      page: 'book (Calendly already chosen, calendar loads at once)',
      formFactor,
      runs,
      median: median.scores,
      lowest,
      metrics: median.metrics,
      failingAudits: [...new Set(all.flatMap((r) => r.failing))],
      eachRun: all.map((r) => r.run),
    };
    supplementary.push(row);
    console.log(`INFO book+calendar ${formFactor.padEnd(7)} median ${CATEGORIES.map((c) => row.median[c]).join('/')}  lowest ${CATEGORIES.map((c) => lowest[c]).join('/')}  LCP ${Math.round(row.metrics.lcp)}ms TBT ${Math.round(row.metrics.tbt)}ms CLS ${row.metrics.cls.toFixed(3)}`);
    for (const f of row.failingAudits) console.log(`      ${f}`);
  }
}
if (retry) writeJson('lighthouse.json', { ...previous, results });
else if (!arg('pages')) writeJson('lighthouse.json', { runsPerPage: runs, results, supplementary });
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} page and form-factor combinations score 95+ in all four categories in every run.`);
process.exitCode = failed.length ? 1 : 0;
