// Checks every built page, and the stylesheet, with the W3C Nu HTML Checker (the engine
// behind validator.w3.org/nu), run locally so nothing is uploaded.
// Get the checker once from https://github.com/validator/validator/releases
// (vnu.windows.zip, vnu.linux.zip or vnu.osx.zip need no Java) and unpack it into .tools/.
//
// Known warning: checking files, the checker has no web origin for the page, so it
// cannot match the Content Security Policy's 'self' and warns that the site's own
// stylesheet and script are blocked. In a browser they are not: scripts/verify/calendly.mjs
// records every CSP violation, and finds none.
//
// With --live it first downloads every page, and the stylesheet, from the published site
// into a temporary folder, and checks those copies: what visitors are actually served.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BASE, LIVE, PAGES, ROOT, pageHtml, writeJson } from './common.mjs';

// The launcher scripts only call the bundled Java runtime; calling it directly avoids a shell.
const java = path.join(ROOT, '.tools', 'vnu-runtime-image', 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
if (!fs.existsSync(java)) {
  console.error('Nu HTML Checker not found: unpack it into .tools/vnu-runtime-image.');
  process.exit(2);
}
const run = (args) =>
  execFileSync(java, ['-m', 'vnu/nu.validator.client.SimpleCommandLineValidator', ...args], {
    maxBuffer: 32 * 1024 * 1024,
  }).toString();

let DIST = path.join(ROOT, 'dist');
if (LIVE) {
  DIST = fs.mkdtempSync(path.join(os.tmpdir(), 'deeprest-live-'));
  for (const p of PAGES) {
    const file = p.slug === '404' ? path.join(DIST, '404.html') : path.join(DIST, p.path, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, await pageHtml(p));
  }
  const home = await pageHtml(PAGES[0]);
  const css = home.match(/href="(assets\/css\/site\.css[^"]*)"/)[1];
  fs.mkdirSync(path.join(DIST, 'assets', 'css'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'assets', 'css', 'site.css'), await (await fetch(new URL(css, BASE))).text());
  console.log(`Downloaded ${PAGES.length} pages and the stylesheet from ${BASE} into ${DIST}`);
}
const slash = (p) => p.split(path.sep).join('/');
const files = fs
  .readdirSync(DIST, { recursive: true })
  .filter((f) => /\.(html|css)$/.test(f))
  .map((f) => slash(f));

const version = run(['--version']).trim();
let output;
try {
  output = run(['--format', 'json', '--also-check-css', '--stdout', ...files.map((f) => path.join(DIST, f))]);
} catch (e) {
  output = e.stdout.toString(); // the checker exits non-zero when it reports errors
}
const { messages } = JSON.parse(output);

// file:///C:/.../dist/about/index.html -> about/index.html
const fileOf = (url) => {
  const full = decodeURIComponent(new URL(url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
  return slash(path.relative(DIST, full));
};
const KNOWN = /^Resource violates Content Security Policy \(meta tag\): external (stylesheet|script) .(\.\.\/)?assets\//;
const line = (m) => `${m.lastLine ?? '-'}: ${m.message}`;

const results = files.map((file) => {
  const mine = messages.filter((m) => m.url && fileOf(m.url) === file);
  const warnings = mine.filter((m) => m.type === 'info' && m.subType === 'warning');
  return {
    file,
    errors: mine.filter((m) => m.type === 'error' || m.type === 'non-document-error').map(line),
    warnings: warnings.filter((m) => !KNOWN.test(m.message)).map(line),
    knownCspWarnings: warnings.filter((m) => KNOWN.test(m.message)).map(line),
    info: mine.filter((m) => m.type === 'info' && m.subType !== 'warning').map(line),
  };
});
const unattached = messages.filter((m) => !m.url || !files.includes(fileOf(m.url)));

console.log(`Nu HTML Checker ${version}`);
for (const r of results) {
  console.log(
    `${r.errors.length ? 'FAIL' : 'PASS'} ${r.file.padEnd(22)} errors ${r.errors.length}  warnings ${r.warnings.length}  known CSP warnings ${r.knownCspWarnings.length}  info ${r.info.length}`,
  );
  for (const m of [...r.errors, ...r.warnings, ...r.info]) console.log(`      ${m}`);
}
for (const m of unattached) console.log(`      (no file) ${m.type}: ${m.message}`);
writeJson('html-validation.json', { checker: `Nu HTML Checker ${version}`, results, unattached });
if (LIVE) fs.rmSync(DIST, { recursive: true, force: true });
const errors = results.reduce((n, r) => n + r.errors.length, 0) + unattached.filter((m) => m.type !== 'info').length;
console.log(`\n${errors} errors in ${results.length} files.`);
process.exitCode = errors ? 1 : 0;
