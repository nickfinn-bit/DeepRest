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

// An external link, marked as such for every reader. Its last word and the icon stay on one
// line, so the icon never starts a line on its own.
export const ext = (url, text) => {
  const i = text.lastIndexOf(' ');
  return `<a href="${url}" rel="noopener">${text.slice(0, i + 1)}<span class="nowrap">${text.slice(i + 1)}${icons.external}</span><span class="visually-hidden"> (external site)</span></a>`;
};

// A date such as "27 October 2026" that never breaks between the day and the month.
export const keepDate = (date) => date.replace(/^(\d{1,2}) /, '$1&nbsp;');

export const notice = (kind, title, body, icon = icons.info) => `
<div class="notice notice-${kind}">
  ${icon}
  <div>
    <p class="notice-title">${title}</p>
    ${body}
  </div>
</div>`;

// Nick's three facts, as given, each a large number with what it counts. The 23 clients
// are those his satisfaction rate covers, not a count of everyone he has mentored.
export const figures = ({ F }, className = '') => `
<dl class="figures${className ? ` ${className}` : ''}">
  <div class="figures-wide"><dt>Satisfaction rate across ${F.text('mentor.clients')} clients</dt><dd>${F.text('mentor.satisfaction')}</dd></div>
  <div><dt>Years mentoring ${F.text('mentor.clientGroups')}</dt><dd>${F.text('mentor.years')}</dd></div>
  <div><dt>Free sessions, as a diagnostic</dt><dd>${F.text('offer.freeSessions')}</dd></div>
</dl>`;

// How Calendly lets a visitor book all five free sessions: one at a time.
export const bookingSteps = ({ F }, { headingLevel = 3 } = {}) => {
  const free = inWords(F.value('offer.freeSessions'));
  const h = `h${headingLevel}`;
  return `
<ol class="steps">
  <li>
    <${h}>Book your first session</${h}>
    <p>Choose a day and time in the booking calendar, then confirm it with your name and email address. Calendly emails you a confirmation.</p>
  </li>
  <li>
    <${h}>Book the next one</${h}>
    <p>Calendly books one session at a time. Once it has confirmed a session, choose “Book another session” under the calendar on the booking page, or open the booking page again, and pick your next time.</p>
  </li>
  <li>
    <${h}>Repeat until all ${free} are booked</${h}>
    <p>Each session has its own confirmation email, with links to move or cancel it.</p>
  </li>
</ol>`;
};

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
