// Serves dist/ the way GitHub Pages does: under the site's base path (/DeepRest/),
// with directory indexes, gzip, a 10-minute cache and 404.html for missing pages.
//   node scripts/serve.mjs [port]      default port 4173
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const port = Number(process.argv[2] || process.env.PORT || 4173);
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const siteUrl = typeof config.site.url === 'string' ? config.site.url : config.site.url.interim;
const base = new URL(siteUrl).pathname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

function send(req, res, status, file) {
  const type = TYPES[path.extname(file)] || 'application/octet-stream';
  let body = fs.readFileSync(file);
  const headers = { 'Content-Type': type, 'Cache-Control': 'max-age=600', 'X-Content-Type-Options': 'nosniff' };
  if (/text|xml|svg|javascript/.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    body = zlib.gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
    headers.Vary = 'Accept-Encoding';
  }
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const notFound = () => send(req, res, 404, path.join(DIST, '404.html'));
  if (url.pathname === '/' && base !== '/') {
    res.writeHead(302, { Location: base });
    return res.end();
  }
  if (!url.pathname.startsWith(base)) return notFound();
  const rel = decodeURIComponent(url.pathname.slice(base.length));
  const file = path.join(DIST, rel);
  if (!file.startsWith(DIST)) return notFound();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
      return res.end();
    }
    const index = path.join(file, 'index.html');
    return fs.existsSync(index) ? send(req, res, 200, index) : notFound();
  }
  return fs.existsSync(file) ? send(req, res, 200, file) : notFound();
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving dist/ at http://localhost:${port}${base} (pid ${process.pid})`);
});
