// Checks every link and resource reference on every page: internal pages and assets,
// #fragments, external sites, tel: and mailto: links, and the Calendly link the booking
// buttons use. Locally (scripts/serve.mjs) the site's own public address, used by the
// canonical and sharing tags, is checked against the same page on the local server;
// with --live everything is checked on the published site itself.
//   node scripts/verify/links.mjs [--live]
import { BASE, LIVE, PAGES, SITE_URL, pageHtml, writeJson } from './common.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0 Safari/537.36';

const pages = PAGES.map((p) => ({ ...p, url: BASE + p.path }));

// Every href/src on the page, and the Calendly link on <html>.
function references(html) {
  const refs = [];
  for (const m of html.matchAll(/<(a|link|script|img)\b[^>]*?\s(href|src)="([^"]*)"/g)) refs.push({ tag: m[1], url: m[3] });
  for (const m of html.matchAll(/<meta property="og:url" content="([^"]*)"/g)) refs.push({ tag: 'meta[og:url]', url: m[1] });
  const cal = html.match(/data-calendly-url="([^"]*)"/);
  if (cal) refs.push({ tag: 'html[data-calendly-url]', url: cal[1] });
  return refs.map((r) => ({ ...r, url: r.url.replace(/&amp;/g, '&') }));
}

const fetchCache = new Map();
function get(url) {
  if (!fetchCache.has(url)) {
    fetchCache.set(
      url,
      fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(30000) })
        .then(async (res) => ({ status: res.status, finalUrl: res.url, body: /html/.test(res.headers.get('content-type') || '') ? await res.text() : '' }))
        .catch((e) => ({ status: 0, error: e.cause?.code || e.message })),
    );
  }
  return fetchCache.get(url);
}

const results = [];
for (const page of pages) {
  const html = await pageHtml(page);
  const base = html.match(/<base href="([^"]*)"/)?.[1];
  const baseUrl = base ? new URL(base, page.url).href : page.url;
  for (const ref of references(html)) {
    const row = { page: page.slug, tag: ref.tag, href: ref.url };
    if (ref.url.startsWith('tel:')) {
      row.kind = 'telephone';
      row.ok = /^tel:\+?\d{3,15}$/.test(ref.url);
    } else if (ref.url.startsWith('mailto:')) {
      row.kind = 'email';
      row.ok = /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ref.url);
    } else {
      const target = new URL(ref.url, baseUrl);
      row.resolved = target.href;
      row.kind = target.origin === new URL(BASE).origin || target.href.startsWith(SITE_URL) ? 'internal' : 'external';
      let fetchUrl = target.href.split('#')[0];
      if (!LIVE && target.href.startsWith(SITE_URL)) {
        row.kind = 'own public address (checked locally)';
        fetchUrl = BASE + target.href.slice(SITE_URL.length).split('#')[0];
        row.checkedLocallyAt = fetchUrl;
      }
      const res = await get(fetchUrl);
      row.status = res.status;
      row.ok = res.status >= 200 && res.status < 400;
      if (res.error) row.error = res.error;
      if (row.ok && target.hash && row.kind === 'internal') {
        const id = decodeURIComponent(target.hash.slice(1));
        row.fragmentFound = new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(res.body);
        row.ok = row.fragmentFound;
      }
    }
    results.push(row);
  }
}

const unique = new Map();
for (const r of results) {
  const key = r.resolved || r.href;
  if (!unique.has(key)) unique.set(key, { ...r, pages: [] });
  unique.get(key).pages.push(r.page);
}
const list = [...unique.values()];
for (const kind of ['internal', 'own public address (checked locally)', 'external', 'telephone', 'email']) {
  const of = list.filter((r) => r.kind === kind);
  if (!of.length) continue;
  console.log(`\n${kind}: ${of.length} distinct, ${of.filter((r) => !r.ok).length} broken`);
  for (const r of of) {
    if (kind === 'internal' && r.ok && !r.resolved.includes('#')) continue; // too many to list
    console.log(
      `  ${r.ok ? 'OK  ' : 'FAIL'} ${r.status ?? ''} ${r.resolved || r.href}${r.checkedLocallyAt ? ` -> local ${r.checkedLocallyAt}` : ''}${r.error ? ` (${r.error})` : ''}${r.fragmentFound === false ? ' (no such #id)' : ''}`,
    );
  }
}
const broken = results.filter((r) => !r.ok);
writeJson('links.json', { checked: results.length, distinct: list.length, broken, distinctLinks: list });
console.log(`\n${results.length} references (${list.length} distinct) on ${pages.length} pages; ${broken.length} broken.`);
process.exitCode = broken.length ? 1 : 0;
