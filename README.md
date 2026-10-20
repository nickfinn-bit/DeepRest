# DeepRest website

The website of DeepRest, Nick Finnemore's tech-addiction mentoring practice for students and young adults, live at **https://deepestrest.com/**. Eight pages plus an error page; sessions are booked through Calendly, whose calendar loads only after the visitor agrees to its cookies. It is a static site, built by a small Node script with no dependencies and published to GitHub Pages.

## Facts

Every fact the site states lives in `site.config.json`, with where it came from under `_sources`. Facts that are not known are left off the pages and listed under `_dropped`; `npm run build` copies that list, and the wording Nick should check, into [PLACEHOLDERS.md](PLACEHOLDERS.md).

Nick is a mentor: the site never calls him a psychologist, therapist or counsellor, uses no HCPC or BPS title, and makes no clinical claim. `npm run verify:facts` checks every page for these, and for any figure without a recorded source.

## Building and checking

```sh
npm install           # verification tools only: Puppeteer, Lighthouse, pdf-lib
npm run build         # builds dist/ and PLACEHOLDERS.md
npm run serve         # serves dist/ at http://localhost:4173/, as GitHub Pages would
npm run verify        # every check, locally, then verification/REPORT.md
npm run verify:live   # every check against https://deepestrest.com/, plus DNS, HTTPS and redirects
```

The HTML check needs the W3C Nu HTML Checker unpacked into `.tools/vnu-runtime-image`: download `vnu.windows.zip`, `vnu.linux.zip` or `vnu.osx.zip` from https://github.com/validator/validator/releases. These builds need no Java.

## Publishing

Publishing is done by hand: Actions > **Publish to GitHub Pages** > Run workflow, on `main`. The workflow runs `npm run build:strict`, which refuses to build while any placeholder remains, and deploys `dist/` to GitHub Pages, which serves it on deepestrest.com (Settings > Pages: source GitHub Actions, custom domain deepestrest.com, HTTPS enforced).

The domain's DNS is on Nick's Cloudflare account, not proxied: the apex points at GitHub Pages' addresses and `www` at `nickfinn-bit.github.io`. Mail to hello@deepestrest.com is forwarded to Nick by Cloudflare Email Routing.
