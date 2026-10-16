// Proves the site can be published once every placeholder is filled in: fills each
// one in a temporary copy of site.config.json with an obviously fake test value, runs
// the strict build used by the publishing workflow into a temporary folder, and checks
// that it succeeds and renders no placeholder. Nothing here touches site.config.json or dist/.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { listPlaceholders } from '../../src/lib/facts.mjs';
import { ROOT, writeJson } from './common.mjs';

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const LISTS = /bio|qualifications|specialisms|approach|insurers|providers|address/;
const fake = (key) => {
  if (key === 'site.url') return 'https://example.org/';
  if (key === 'calendly.url') return 'https://calendly.com/embed-demo-sales/discovery-call';
  if (key === 'psychologist.photo') return 'apple-touch-icon.png'; // any existing image
  if (key === 'practice.email') return 'test@example.org';
  if (key === 'practice.phone') return '020 7946 0000';
  return LISTS.test(key) ? [`TEST ${key} line 1`, `TEST ${key} line 2`] : `TEST ${key}`;
};
const filled = structuredClone(config);
const placeholders = listPlaceholders(config);
for (const { key } of placeholders) {
  const parts = key.split('.');
  const parent = parts.slice(0, -1).reduce((n, k) => n[k], filled);
  parent[parts.at(-1)] = fake(key);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'deeprest-publish-ready-'));
const cfg = path.join(tmp, 'site.config.json');
const out = path.join(tmp, 'dist');
fs.writeFileSync(cfg, JSON.stringify(filled, null, 2));
const result = { placeholdersFilled: placeholders.length };
try {
  result.buildOutput = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--strict', `--config=${cfg}`, `--out=${out}`]).toString().trim();
  result.strictBuildSucceeded = true;
  const html = fs.readdirSync(out, { recursive: true }).filter((f) => f.endsWith('.html'));
  const leftovers = html.filter((f) => /data-ph=|class="ph/.test(fs.readFileSync(path.join(out, f), 'utf8')));
  result.pages = html.length;
  result.pagesStillShowingPlaceholders = leftovers;
  result.calendlyLinkUsed = fs.readFileSync(path.join(out, 'book', 'index.html'), 'utf8').includes(filled.calendly.url);
  result.demoNoticeGone = !fs.readFileSync(path.join(out, 'book', 'index.html'), 'utf8').includes('Demonstration calendar');
} catch (e) {
  result.strictBuildSucceeded = false;
  result.error = (e.stderr || e.message).toString();
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
result.pass = result.strictBuildSucceeded && result.pages === 10 && !result.pagesStillShowingPlaceholders.length && result.calendlyLinkUsed && result.demoNoticeGone;
console.log(JSON.stringify(result, null, 2));
writeJson('publish-ready.json', result);
process.exitCode = result.pass ? 0 : 1;
