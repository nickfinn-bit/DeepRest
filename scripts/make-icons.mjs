// Renders src/assets/img/apple-touch-icon.png (180 x 180) from the logo, using Puppeteer's Chrome.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const ROOT = path.resolve(import.meta.dirname, '..');
const svg = fs.readFileSync(path.join(ROOT, 'src/assets/img/favicon.svg'), 'utf8')
  .replace('<svg ', '<svg width="132" height="132" ');
const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 180, height: 180 });
  await page.setContent(`<body style="margin:0;width:180px;height:180px;display:grid;place-items:center;background:#fbf9f5">${svg}</body>`);
  await page.screenshot({ path: path.join(ROOT, 'src/assets/img/apple-touch-icon.png') });
} finally {
  await browser.close();
}
console.log('Wrote src/assets/img/apple-touch-icon.png');
