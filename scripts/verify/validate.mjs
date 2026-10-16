// Checks every built page, and the stylesheet, with the W3C Nu HTML Checker (the engine
// behind validator.w3.org/nu), run locally so nothing is uploaded.
// Get the checker once from https://github.com/validator/validator/releases
// (vnu.windows.zip, vnu.linux.zip or vnu.osx.zip need no Java) and unpack it into .tools/.
//
// Known warning: checking files, the checker has no web origin for the page, so it
// cannot match the Content Security Policy's 'self' and warns that the site's own
// stylesheet and script are blocked. In a browser they are not: scripts/verify/calendly.mjs
// records every CSP violation, and finds none.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, writeJson } from './common.mjs';

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

const DIST = path.join(ROOT, 'dist');
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
const errors = results.reduce((n, r) => n + r.errors.length, 0) + unattached.filter((m) => m.type !== 'info').length;
console.log(`\n${errors} errors in ${results.length} files.`);
process.exitCode = errors ? 1 : 0;
