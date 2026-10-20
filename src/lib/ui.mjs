// Small building blocks shared by the pages.
import { icons } from './icons.mjs';

// Small whole numbers as words, for running text: 5 -> "five".
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
export const inWords = (n) => WORDS[n] ?? String(n);

export const pageHead = ({ eyebrow, title, lead }) => `
<div class="page-head">
  <div class="container">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
</div>`;

// An external link, marked as such for every reader.
export const ext = (url, text) =>
  `<a href="${url}" rel="noopener">${text}${icons.external}<span class="visually-hidden"> (external site)</span></a>`;

export const notice = (kind, title, body, icon = icons.info) => `
<div class="notice notice-${kind}">
  ${icon}
  <div>
    <p class="notice-title">${title}</p>
    ${body}
  </div>
</div>`;

// Nick's own figures, as a list of large numbers with what each counts.
export const figures = ({ F }, className = '') => `
<dl class="figures${className ? ` ${className}` : ''}">
  <div><dt>Client satisfaction</dt><dd>${F.text('mentor.satisfaction')}</dd></div>
  <div><dt>Clients mentored</dt><dd>${F.text('mentor.clients')}</dd></div>
  <div><dt>Years mentoring</dt><dd>${F.text('mentor.years')}</dd></div>
  <div><dt>Free sessions to start</dt><dd>${F.text('offer.freeSessions')}</dd></div>
</dl>`;

export const ctaBand = (ctx, { title, text }) => `
<section class="section cta-band" aria-labelledby="cta-title">
  <div class="container cta-inner">
    <div>
      <h2 id="cta-title">${title}</h2>
      <p>${text}</p>
    </div>
    <div class="button-row">
      <a class="btn btn-primary btn-lg" href="${ctx.href('book')}">Book a free session</a>
      <a class="btn btn-secondary btn-lg" href="${ctx.href('contact')}">Ask a question first</a>
    </div>
  </div>
</section>`;
