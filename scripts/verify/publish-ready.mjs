// The publishing guard: runs the strict build that the publishing workflow runs, into a
// temporary folder, and checks that it succeeds, renders every page with no placeholder,
// and uses the practice's own Calendly link. Nothing here touches site.config.json or dist/.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { listPlaceholders } from '../../src/lib/facts.mjs';
import { PAGES as BUILT } from '../../src/pages/index.mjs';
import { ROOT, writeJson } from './common.mjs';

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'deeprest-strict-'));
const out = path.join(tmp, 'dist');
const result = { placeholders: listPlaceholders(config).length };
try {
  result.buildOutput = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--strict', `--out=${out}`]).toString().trim();
  result.strictBuildSucceeded = true;
  const html = fs.readdirSync(out, { recursive: true }).filter((f) => f.endsWith('.html'));
  result.pages = html.length;
  result.pagesStillShowingPlaceholders = html.filter((f) => /data-ph=|class="ph/.test(fs.readFileSync(path.join(out, f), 'utf8')));
  const book = fs.readFileSync(path.join(out, 'book', 'index.html'), 'utf8');
  result.calendlyUrl = typeof config.calendly.url === 'string' ? config.calendly.url : null;
  result.calendlyLinkUsed = Boolean(result.calendlyUrl) && book.includes(result.calendlyUrl);
  result.demoNoticeGone = !book.includes('Demonstration calendar');
} catch (e) {
  result.strictBuildSucceeded = false;
  result.error = (e.stderr || e.message).toString();
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
result.pass =
  result.placeholders === 0 &&
  result.strictBuildSucceeded &&
  result.pages === BUILT.length &&
  !result.pagesStillShowingPlaceholders.length &&
  result.calendlyLinkUsed &&
  result.demoNoticeGone;
console.log(JSON.stringify(result, null, 2));
writeJson('publish-ready.json', result);
process.exitCode = result.pass ? 0 : 1;
