// The page shell shared by every page: head, header with the booking popup button,
// footer with crisis signposting, and the Calendly consent dialog.
import { esc } from './facts.mjs';
import { logo, icons } from './icons.mjs';
import { inWords } from './ui.mjs';

export const CONSENT_KEY = 'deeprest-calendly-consent';

// Runs before first paint so the page never shifts when JavaScript starts:
// it swaps the no-js class and notes a remembered choice to load Calendly.
export const HEAD_SCRIPT =
  `(function(d){d.className='js';try{if(localStorage.getItem('${CONSENT_KEY}')==='granted')` +
  `d.classList.add('calendly-consented')}catch(e){}})(document.documentElement)`;

export const NAV = [
  { slug: 'mentoring', label: 'Mentoring' },
  { slug: 'about', label: 'About Nick' },
  { slug: 'faq', label: 'FAQ' },
  { slug: 'contact', label: 'Contact' },
];

export const FOOTER_PAGES = [
  { slug: '', label: 'Home' },
  { slug: 'mentoring', label: 'Mentoring' },
  { slug: 'about', label: 'About Nick' },
  { slug: 'faq', label: 'Questions and answers' },
  { slug: 'book', label: 'Book a free session' },
  { slug: 'contact', label: 'Contact' },
];

export function renderPage(ctx, page, main) {
  const { F, href, asset, csp, site, year } = ctx;
  const current = (slug) => (slug === page.slug ? ' aria-current="page"' : '');

  F.setContext(page.name, 'Page title and description');
  const title = page.title(ctx);
  const description = page.description(ctx);

  F.setContext(page.name, 'Header');
  F.value('calendly.url'); // the header button opens this link in Calendly's popup
  const header = `
<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header">
  <div class="container header-bar">
    <a class="brand" href="${href('')}">${logo()}<span class="brand-name">DeepRest</span></a>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      <ul class="site-nav-list">
        ${NAV.map((n) => `<li><a href="${href(n.slug)}"${current(n.slug)}>${n.label}</a></li>`).join('\n        ')}
      </ul>
    </nav>
    <div class="header-actions">
      <a class="btn btn-primary btn-book" href="${href('book')}" data-calendly-popup${current('book')}>${icons.calendar}<span>Book<span class="btn-book-more"> a free session</span></span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">${icons.menu}<span class="nav-toggle-label">Menu</span></button>
    </div>
  </div>
</header>`;

  F.setContext(page.name, 'Footer');
  const footer = `
<footer class="site-footer">
  <section class="crisis" id="urgent-help" aria-labelledby="urgent-help-title">
    <div class="container">
      <div class="crisis-head">
        <h2 id="urgent-help-title">Need help now?</h2>
        <p><strong>DeepRest is not an emergency service</strong> and cannot respond to urgent requests. If you need help now, please don’t wait for a reply from us.</p>
      </div>
      <ul class="crisis-list">
        <li class="crisis-item">
          <a class="crisis-number" href="tel:999">999</a>
          <p><strong>Emergency.</strong> If you or someone else is in immediate danger, or a life is at risk, call 999 or go to your nearest A&amp;E.</p>
        </li>
        <li class="crisis-item">
          <a class="crisis-number" href="tel:111">NHS 111</a>
          <p><strong>Urgent, but not an emergency.</strong> Call 111 for urgent medical help or advice.</p>
        </li>
        <li class="crisis-item">
          <a class="crisis-number" href="tel:116123">116 123</a>
          <p><strong>Samaritans.</strong> Free to call, day or night, 365 days a year, whatever you’re going through.</p>
        </li>
      </ul>
    </div>
  </section>
  <div class="footer-main">
    <div class="container footer-grid">
      <div class="footer-about">
        <p class="footer-brand">${logo(30)}<span>DeepRest</span></p>
        <p>Tech-addiction mentoring with ${F.text('mentor.name')}.</p>
        <p>Your first ${inWords(F.value('offer.freeSessions'))} sessions are free, as a diagnostic.</p>
      </div>
      <nav class="footer-col" aria-label="Footer">
        <h2 class="footer-heading">Pages</h2>
        <ul class="footer-links">
          ${FOOTER_PAGES.map((n) => `<li><a href="${href(n.slug)}"${current(n.slug)}>${n.label}</a></li>`).join('\n          ')}
        </ul>
      </nav>
      <div class="footer-col">
        <h2 class="footer-heading">Information</h2>
        <ul class="footer-links">
          <li><a href="${href('privacy')}"${current('privacy')}>Privacy policy</a></li>
          <li><a href="${href('cookies')}"${current('cookies')}>Cookie notice</a></li>
          <li><a href="${href('book')}#before-you-book">Before you book</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h2 class="footer-heading">Contact</h2>
        <ul class="footer-links footer-contact">
          <li>${emailLink(F)}</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-base">
    <div class="container"><p>© ${year} DeepRest</p></div>
  </div>
</footer>`;

  F.setContext(page.name, 'Booking dialog');
  const dialog = `
<dialog class="consent-dialog" id="calendly-consent" aria-labelledby="calendly-consent-title" aria-describedby="calendly-consent-text">
  <form method="dialog" class="consent-dialog-form">
    <p class="eyebrow">Booking</p>
    <h2 id="calendly-consent-title">Booking opens Calendly</h2>
    <p id="calendly-consent-text">DeepRest’s sessions are booked through Calendly. If you continue, this page loads Calendly’s booking calendar. Calendly then sets cookies on your device and connects to services it uses, such as Google reCAPTCHA and Stripe. <a href="${href('cookies')}#calendly">See what is loaded</a></p>
    <div class="consent-dialog-actions">
      <button class="btn btn-primary" value="continue">Continue to booking</button>
      <button class="btn btn-secondary" value="cancel">Not now</button>
    </div>
  </form>
</dialog>`;

  F.setContext(page.name, 'Main content');
  const body = main(ctx);

  const canonical = site.url + (page.slug ? `${page.slug}/` : '');
  return `<!doctype html>
<html lang="en-GB" class="no-js" data-calendly-url="${esc(ctx.calendlyUrl)}">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${esc(csp)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${page.is404 ? `<base href="${esc(site.basePath)}">` : `<link rel="canonical" href="${esc(canonical)}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="DeepRest">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${page.is404 ? '' : `<meta property="og:url" content="${esc(canonical)}">\n`}<meta name="theme-color" content="#1e5650">
<link rel="icon" href="${asset('img/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${asset('img/apple-touch-icon.png')}">
<link rel="preload" href="${asset('fonts/source-serif-4-latin-wght.woff2', false)}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset('css/site.css')}">
<script>${HEAD_SCRIPT}</script>
<script src="${asset('js/site.js')}" defer></script>
</head>
<body>
${header}
<main id="main" tabindex="-1">
${body}
</main>
${footer}
${dialog}
</body>
</html>
`;
}

// The practice's email address as a link, with its icon unless asked not to.
export function emailLink(F, withIcon = true) {
  const icon = withIcon ? icons.mail : '';
  if (F.isPlaceholder('practice.email')) return `${icon}${F.text('practice.email')}`;
  const v = F.value('practice.email');
  return `${icon}<a href="mailto:${esc(v)}">${esc(v)}</a>`;
}
