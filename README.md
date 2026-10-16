# DeepRest website

The website of DeepRest, a psychologist's practice: nine pages plus an error page, with appointments booked through Calendly. It is a static site, built by a small Node script with no dependencies and published to GitHub Pages.

**Not yet publishable.** Facts about the practice are not known yet: each is a marked placeholder in `site.config.json`, listed with where it appears in [PLACEHOLDERS.md](PLACEHOLDERS.md). The booking calendar is Calendly's own demo until the real link is added.

## Filling in the details

1. In `site.config.json`, replace each `{ "placeholder": ... }` object with the real value. Its `needs` text says what to write.
2. Put the portrait photograph in `src/assets/img/` and write its file name under `psychologist.photo`.
3. Run `npm run build`. This rebuilds `dist/` and regenerates `PLACEHOLDERS.md`.
4. Ask the psychologist to check the general wording listed at the end of `PLACEHOLDERS.md`, the privacy policy above all.

## Building and checking

```sh
npm install          # verification tools only: Puppeteer, Lighthouse, pdf-lib
npm run build        # builds dist/ and PLACEHOLDERS.md
npm run serve        # serves dist/ at http://localhost:4173/DeepRest/, as GitHub Pages would
npm run verify       # every check, then verification/REPORT.md
```

`npm run verify` needs the W3C Nu HTML Checker unpacked into `.tools/vnu-runtime-image`: download `vnu.windows.zip`, `vnu.linux.zip` or `vnu.osx.zip` from https://github.com/validator/validator/releases. These builds need no Java.

## Publishing

Publishing is done by hand, once no placeholder remains:

1. GitHub: Settings > Pages > Build and deployment > Source: **GitHub Actions**. GitHub Pages from a private repository needs a paid GitHub plan.
2. Actions > **Publish to GitHub Pages** > Run workflow.

The workflow runs `npm run build:strict`, which refuses to build while any placeholder remains, so an unfinished site cannot be published.
