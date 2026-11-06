# verification: the index

## About

description: The evidence the checks in scripts/verify leave: each check's JSON results, REPORT.md written from them, and the screenshots, captures, Lighthouse reports and PDFs behind them.
aim: To show, page by page and width by width, that the site passes every check before a change is called finished or the site is published.
numerical_result_summary: 11 JSON files; 176 human-pass captures, 70 layout screenshots, 25 Calendly captures, 20 Lighthouse reports and 11 PDFs.

## Contents

- `calendly/` — Captures from scripts/verify/calendly.mjs: the booking page's inline calendar at each width, and the header button's Calendly popup on each page at 360 and 1,440 pixels.
- `human-pass/` — Screen captures from scripts/verify/human-pass.mjs of each page scrolled at reading speed at 360 and 390 pixels (the home page also at 768), named page, width and stop.
- `lighthouse/` — Lighthouse's HTML report for each page, mobile and desktop, from scripts/verify/lighthouse.mjs, the booking page also with Calendly's calendar loaded.
- `pdf/` — A PDF of each page printed at desktop width by scripts/verify/pdf.mjs, the booking page also with Calendly's calendar loaded, and one PDF of every page combined.
- `screenshots/` — A full-page screenshot of each page at each of 7 widths from scripts/verify/layout.mjs, one folder per page, the FAQ also with its answers open.
- `*.json` — Each check's results, named after its check and read by scripts/verify/report.mjs into REPORT.md; human-pass-review.json is the hand-written record of looking at the captures.
