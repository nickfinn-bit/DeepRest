import fs from 'node:fs';
import { CONSENT_KEY } from '../lib/layout.mjs';
import { esc } from '../lib/facts.mjs';
import { ext, pageHead } from '../lib/ui.mjs';

const CALENDLY_PRIVACY = 'https://calendly.com/legal/privacy-notice';

// Written by scripts/verify/calendly.mjs: the cookies seen after loading the calendar.
const observedFile = new URL('../data/calendly-cookies.json', import.meta.url);
const observed = fs.existsSync(observedFile)
  ? JSON.parse(fs.readFileSync(observedFile, 'utf8'))
  : { checked: null, cookies: [] };

// The company each cookie belongs to, recognised from its name.
const PROVIDERS = [
  [/^__stripe|^m$/, 'Stripe'],
  [/^__cf_bm$|^_cfuvid$|^cf_/, 'Cloudflare'],
  [/^Optanon/, 'OneTrust'],
  [/^_dd_s$/, 'Datadog'],
];
const provider = (name) => PROVIDERS.find(([re]) => re.test(name))?.[1] ?? 'Calendly';

const longDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function observedTable() {
  if (!observed.cookies.length) return '<p>No observation has been recorded yet.</p>';
  return `
      <p>When we last checked, on ${longDate(observed.checked)}, loading the calendar set these cookies. Calendly decides which cookies it uses, so the list can change.</p>
      <div class="table-wrap">
        <table class="doc-table">
          <caption class="visually-hidden">Cookies seen after loading the Calendly calendar</caption>
          <thead><tr><th scope="col">Cookie</th><th scope="col">Website that sets it</th><th scope="col">Belongs to</th></tr></thead>
          <tbody>
            ${observed.cookies
              .map(
                (c) =>
                  `<tr><th scope="row" data-label="Cookie"><code>${esc(c.name)}</code></th><td data-label="Website">${esc(c.domain.replace(/^\./, ''))}</td><td data-label="Belongs to">${esc(provider(c.name))}</td></tr>`,
              )
              .join('\n            ')}
          </tbody>
        </table>
      </div>`;
}

export default {
  slug: 'cookies',
  name: 'Cookie notice',
  title: () => 'Cookie notice | DeepRest',
  description: () =>
    'DeepRest’s website sets no cookies of its own. This notice explains the cookies Calendly sets if you choose to load the booking calendar, and how to change your choice.',
  main: (ctx) => {
    const { href } = ctx;
    return `
${pageHead({
  eyebrow: 'Cookies',
  title: 'Cookie notice',
  lead: 'This website sets no cookies of its own and uses no analytics or advertising trackers. Cookies are set only if you choose to load the booking calendar, and they come from Calendly.',
})}

<div class="section">
  <div class="container"><div class="prose doc">
    <h2 id="our-site">This website</h2>
    <p>We store one setting in your browser, and only after you choose to load the booking calendar:</p>
    <div class="table-wrap">
      <table class="doc-table">
        <caption class="visually-hidden">What this website stores</caption>
        <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Purpose</th><th scope="col">How long it lasts</th></tr></thead>
        <tbody>
          <tr><th scope="row" data-label="Name"><code>${CONSENT_KEY}</code></th><td data-label="Type">Local storage</td><td data-label="Purpose">Remembers that you chose to load Calendly, so we don’t ask again</td><td data-label="How long it lasts">Until you clear it below, or clear this site’s data in your browser</td></tr>
        </tbody>
      </table>
    </div>
    <p>If you come from one of our adverts on Facebook or Instagram, the web address carries tags that name the platform and the advert. They stay in the address and in the website’s links, and nothing is stored on your device. The website has no Meta code, such as Meta’s Pixel, so Meta sets no cookies through it. The <a href="${href('privacy')}#information">privacy policy</a> explains the tags.</p>

    <h2 id="calendly">Calendly, our booking system</h2>
    <p>Sessions are booked through Calendly, provided by Calendly, LLC in the United States. The booking calendar is not loaded until you ask for it, either with the button on the <a href="${href('book')}">booking page</a> or through the booking button at the top of each page.</p>
    <p>Once it is loaded, your browser connects to Calendly, which sets its own cookies. Calendly shows its own cookie settings inside the calendar, where you can accept or decline its optional cookies, and its ${ext(CALENDLY_PRIVACY, 'privacy notice')} explains how it uses cookies.</p>
    ${observedTable()}

    <h2 id="your-choice">Changing your choice</h2>
    <div class="consent-status">
      <p data-consent-status role="status">Your choice is stored in your browser. With JavaScript turned on, this page shows it here and lets you clear it.</p>
      <p><button class="btn btn-secondary" type="button" data-consent-forget disabled>Clear my choice</button></p>
    </div>
    <p>Clearing your choice means we will ask again before loading Calendly. It does not delete cookies Calendly has already set: you can delete those, or block them, in your browser’s settings for the site calendly.com.</p>

    <h2 id="questions">Questions</h2>
    <p>The <a href="${href('privacy')}">privacy policy</a> explains how we handle personal information and how to contact us.</p>
  </div></div>
</div>`;
  },
};
