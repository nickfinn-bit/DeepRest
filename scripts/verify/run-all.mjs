// Builds the site, serves it, runs every check and writes verification/REPORT.md.
// The server it starts is stopped by its own PID when the checks finish.
//   npm run verify
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { BASE, PORT, ROOT, sleep } from './common.mjs';

const node = process.execPath;
const script = (name) => path.join(ROOT, 'scripts', name);
const results = [];

function step(name, file, args = []) {
  console.log(`\n=== ${name}`);
  const started = Date.now();
  const r = spawnSync(node, [script(file), ...args], { cwd: ROOT, stdio: 'inherit' });
  results.push({ name, ok: r.status === 0, seconds: Math.round((Date.now() - started) / 1000) });
}

step('Build', 'build.mjs');
// Reuse a server that is already running on the port; otherwise start one, and stop it at the end.
const running = await fetch(BASE).then((r) => r.ok).catch(() => false);
const server = running ? null : spawn(node, [script('serve.mjs'), String(PORT)], { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] });
if (server) console.log(`Started the local server (pid ${server.pid}).`);
try {
  for (let i = 0; i < 50 && server; i++) {
    const up = await fetch(BASE).then((r) => r.ok).catch(() => false);
    if (up) break;
    await sleep(200);
  }
  // Calendly first: it records the cookies Calendly sets, which the cookie notice lists,
  // so the site is rebuilt before the checks that read its pages.
  step('Calendly embed and popup', 'verify/calendly.mjs');
  step('Rebuild with the recorded Calendly cookies', 'build.mjs');
  step('Layout at every width, with screenshots', 'verify/layout.mjs');
  step('HTML validation', 'verify/validate.mjs');
  step('Links', 'verify/links.mjs');
  step('Placeholders and invented facts', 'verify/facts.mjs');
  step('Ready to publish once placeholders are filled', 'verify/publish-ready.mjs');
  step('Lighthouse', 'verify/lighthouse.mjs');
  step('PDF of every page', 'verify/pdf.mjs');
} finally {
  if (server) {
    server.kill();
    console.log(`Stopped the local server (pid ${server.pid}).`);
  }
}
step('Report', 'verify/report.mjs');

console.log('\n=== Summary');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name} (${r.seconds}s)`);
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
