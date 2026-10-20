// A second opinion on Lighthouse from Google's own servers: PageSpeed Insights, run for
// every page of the live site, mobile and desktop. It reads the public web page
// (pagespeed.web.dev), because the keyless API's shared daily quota is often used up.
// Signed out, the web page hits the same quota ("Unable to resolve" the address), so
// --browser-url can name a Chrome signed in to Google: the script opens a tab of its own
// there and closes it, and never closes that browser.
// Its results are supplementary to verify/lighthouse.mjs, which runs on this machine.
//   node scripts/verify/pagespeed.mjs [--browser-url=http://127.0.0.1:9222] [--pages=faq,book]
// --pages runs only those pages and replaces their rows in verification/pagespeed.json.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { OUT, PAGES, SITE_URL, sleep, writeJson } from './common.mjs';

const CATS = ['Performance', 'Accessibility', 'Best Practices', 'SEO'];
// The 404 page is read at its own file name, served with status 200, as Lighthouse requires.
const urlFor = (p) => (p.slug === '404' ? `${SITE_URL}404.html` : SITE_URL + p.path);

async function read(page) {
  // Wait until this form factor's scores and metrics are on the page.
  for (let i = 0; i < 120; i++) {
    const text = await page.evaluate(() => document.body.innerText);
    const s = text.match(/Diagnose performance issues\s+(\d+)\s+Performance\s+(\d+)\s+Accessibility\s+(\d+)\s+Best Practices\s+(\d+)\s+SEO/);
    const metric = (name) => text.match(new RegExp(`${name}\\s+([\\d.,]+\\s?(?:ms|s)?)`))?.[1];
    if (s && metric('Speed Index')) {
      return {
        scores: Object.fromEntries(CATS.map((c, k) => [c, Number(s[k + 1])])),
        metrics: { fcp: metric('First Contentful Paint'), lcp: metric('Largest Contentful Paint'), tbt: metric('Total Blocking Time'), cls: metric('Cumulative Layout Shift'), si: metric('Speed Index') },
        captured: text.match(/Captured at ([^\n]+)/)?.[1],
        lighthouse: text.match(/Lighthouse ([\d.]+)/)?.[1],
      };
    }
    const problem = text.match(/Unable to resolve[^\n]*|Lighthouse returned error[^\n]*|Something went wrong[^\n]*/i);
    if (problem) return { error: problem[0] };
    await sleep(1000);
  }
  return { error: 'timed out waiting for results' };
}

const browserURL = process.argv.find((a) => a.startsWith('--browser-url='))?.split('=')[1];
const browser = browserURL ? await puppeteer.connect({ browserURL, defaultViewport: null }) : await puppeteer.launch();
console.log(`Chrome ${await browser.version()} (${browserURL ? `connected at ${browserURL}` : `pid ${browser.process()?.pid}`})`);
const only = process.argv.find((a) => a.startsWith('--pages='))?.split('=')[1]?.split(',');
const previous = path.join(OUT, 'pagespeed.json');
const results = only && fs.existsSync(previous) ? JSON.parse(fs.readFileSync(previous, 'utf8')).results.filter((r) => !only.includes(r.page)) : [];
const opened = new Set(); // only these tabs are ever closed
try {
  for (const p of PAGES.filter((x) => !only || only.includes(x.slug))) {
    const page = await browser.newPage();
    opened.add(page);
    if (!browserURL) await page.setViewport({ width: 1366, height: 900 });
    await page.goto(`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(urlFor(p))}&form_factor=mobile`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const mobile = await read(page);
    // The same analysis, shown for desktop.
    const report = page.url().split('?')[0];
    await page.goto(`${report}?form_factor=desktop`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const desktop = await read(page);
    await page.close();
    opened.delete(page);
    const row = { page: p.slug, url: urlFor(p), report, mobile, desktop };
    row.pass = [mobile, desktop].every((r) => r.scores && Object.values(r.scores).every((v) => v >= 95));
    results.push(row);
    const show = (r) => (r.scores ? `${Object.values(r.scores).join('/')} (SI ${r.metrics.si}, LCP ${r.metrics.lcp})` : `ERROR ${r.error}`);
    console.log(`${row.pass ? 'PASS' : 'FAIL'} ${p.slug.padEnd(9)} mobile ${show(mobile)}  desktop ${show(desktop)}  ${report}`);
  }
} finally {
  for (const pg of opened) await pg.close().catch(() => {});
  if (browserURL) await browser.disconnect();
  else await browser.close();
}
results.sort((a, b) => PAGES.findIndex((p) => p.slug === a.page) - PAGES.findIndex((p) => p.slug === b.page));
writeJson('pagespeed.json', { tool: 'PageSpeed Insights (pagespeed.web.dev)', results });
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} pages score 95+ in all four categories on mobile and desktop.`);
process.exitCode = failed.length ? 1 : 0;
