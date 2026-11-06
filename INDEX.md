# DeepRest-live-slips: the index

## About

description: A git worktree of DeepRest on its own branch: the static website of DeepRest, Nick Finnemore's tech-addiction mentoring practice, with the scripts that build, serve and check it and the evidence the checks left.
aim: To build the site from site.config.json and src/, check every page locally or live, and publish it to GitHub Pages on deepestrest.com.
numerical_result_summary: 9 pages, 8 plus an error page; 16 modules in scripts/verify; 0 placeholders remain; verification/ holds 314 of the 373 tracked files.

## Contents

- `scripts/` — The Node scripts that build the site into dist/, serve it as GitHub Pages does and render its icon, and in verify/ the checks of every page and the writer of verification/REPORT.md.
- `src/` — The site's source: page modules in pages/, shared rendering code in lib/, the measured Calendly third parties in data/, and the stylesheet, font, images and script in assets/.
- `*.json` — npm's package.json and package-lock.json, and site.config.json, which holds every fact the site states with its source.
