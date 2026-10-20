// The published site's hosting, checked from outside: DNS, HTTPS, redirects, status
// codes, and that every live page is byte-for-byte the page in dist/ (so what was
// verified locally is what visitors get). Needs the site published; run after a build.
//   node scripts/verify/live.mjs
import dns from 'node:dns/promises';
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';
import { DIST, PAGES, SITE_URL, writeJson } from './common.mjs';

const host = new URL(SITE_URL).hostname;
const resolver = new dns.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);
const GITHUB_A = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'];
const GITHUB_AAAA = ['2606:50c0:8000::153', '2606:50c0:8001::153', '2606:50c0:8002::153', '2606:50c0:8003::153'];

const checks = [];
const check = (name, ok, detail) => {
  checks.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? `: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`);
};
const safe = (p) => p.catch((e) => ({ error: e.code || e.message }));
const get = (url, redirect = 'manual') => fetch(url, { redirect, headers: { 'Cache-Control': 'no-cache' } });

// DNS: GitHub Pages' addresses for the domain, www pointing at the account's Pages host,
// and the Cloudflare Email Routing records for hello@.
const a = await safe(resolver.resolve4(host));
check(`${host} A records are GitHub Pages'`, Array.isArray(a) && GITHUB_A.every((ip) => a.includes(ip)), a);
const aaaa = await safe(resolver.resolve6(host));
check(`${host} AAAA records are GitHub Pages'`, Array.isArray(aaaa) && GITHUB_AAAA.every((ip) => aaaa.includes(ip)), aaaa);
const www = await safe(resolver.resolveCname(`www.${host}`));
check(`www.${host} is a CNAME to nickfinn-bit.github.io`, Array.isArray(www) && www.includes('nickfinn-bit.github.io'), www);
const mx = await safe(resolver.resolveMx(host));
check(`${host} MX records are Cloudflare Email Routing's`, Array.isArray(mx) && mx.length === 3 && mx.every((m) => /^route\d\.mx\.cloudflare\.net$/.test(m.exchange)), mx);
const txt = await safe(resolver.resolveTxt(host));
check(`${host} SPF record allows Cloudflare Email Routing`, Array.isArray(txt) && txt.some((t) => t.join('').startsWith('v=spf1 include:_spf.mx.cloudflare.net')), txt);

// HTTPS certificate.
const cert = await new Promise((resolve) => {
  const socket = tls.connect({ host, port: 443, servername: host }, () => {
    const c = socket.getPeerCertificate();
    resolve({ authorized: socket.authorized, subject: c.subject?.CN, altNames: c.subjectaltname, issuer: c.issuer?.O, validTo: c.valid_to });
    socket.end();
  });
  socket.on('error', (e) => resolve({ error: e.message }));
});
check('HTTPS certificate is valid for the domain', cert.authorized && cert.altNames?.includes(`DNS:${host}`), cert);

// Redirects to the one canonical address.
for (const from of [`http://${host}/`, `https://www.${host}/`, `http://www.${host}/`, 'https://nickfinn-bit.github.io/DeepRest/']) {
  const res = await safe(get(from));
  const to = res.headers?.get('location');
  const final = await safe(get(from, 'follow'));
  check(`${from} redirects to ${SITE_URL}`, res.status >= 300 && res.status < 400 && final.url === SITE_URL && final.status === 200, { status: res.status, location: to, final: final.url });
}

// Every page: status, server, and identical to the build.
const pages = [];
for (const p of PAGES) {
  const url = SITE_URL + p.path;
  const res = await get(url, 'follow');
  const body = await res.text();
  const file = p.slug === '404' ? path.join(DIST, '404.html') : path.join(DIST, p.path, 'index.html');
  const built = fs.readFileSync(file, 'utf8');
  const expected = p.slug === '404' ? 404 : 200;
  const row = { page: p.slug, url, status: res.status, server: res.headers.get('server'), sameAsBuild: body === built, bytes: body.length };
  row.pass = res.status === expected && row.sameAsBuild;
  pages.push(row);
  check(`${url} answers ${expected} and matches dist/`, row.pass, { status: row.status, server: row.server, sameAsBuild: row.sameAsBuild });
}
for (const f of ['sitemap.xml', 'robots.txt', '404.html']) {
  const res = await get(SITE_URL + f, 'follow');
  const same = (await res.text()) === fs.readFileSync(path.join(DIST, f), 'utf8');
  check(`${SITE_URL}${f} answers 200 and matches dist/`, res.status === 200 && same, { status: res.status, sameAsBuild: same });
}

const failed = checks.filter((c) => !c.ok);
writeJson('live.json', { site: SITE_URL, checks, pages, pass: !failed.length });
console.log(`\n${checks.length - failed.length}/${checks.length} hosting checks pass.`);
process.exitCode = failed.length ? 1 : 0;
