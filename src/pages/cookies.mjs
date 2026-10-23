import { CONSENT_KEY } from '../lib/layout.mjs';
import { esc } from '../lib/facts.mjs';
import { service, thirdParties } from '../lib/third-parties.mjs';
import { ext, pageHead } from '../lib/ui.mjs';

const CALENDLY_PRIVACY = 'https://calendly.com/legal/privacy-notice';

const longDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// Short company names for the table, from the full names in third-parties.mjs.
const owner = (id) => service(id).name.replace(/,? (LLC|Inc\.)$/, '').replace(/ \(.*\)$/, '');

// One table of measured cookies and stored items. Each row carries what it lists, so the
// verification can compare the page with what was measured.
function itemTable(items, caption, when) {
  return `
      <div class="table-wrap">
        <table class="doc-table">
          <caption class="visually-hidden">${caption}</caption>
          <thead><tr><th scope="col">Name</th><th scope="col">Kept as</th><th scope="col">Belongs to</th><th scope="col">What it is for</th><th scope="col">How long it lasts</th></tr></thead>
          <tbody>
            ${items
              .map(
                (i) =>
                  `<tr data-third-party-item="${esc(`${i.type} ${i.name} ${i.host}`)}" data-when="${when}"><th scope="row" data-label="Name"><code>${esc(i.name)}</code></th><td data-label="Kept as">${i.kind}, ${esc(i.host)}</td><td data-label="Belongs to">${esc(owner(i.service))}</td><td data-label="What it is for">${esc(i.purpose)}</td><td data-label="How long it lasts">${i.lasts}</td></tr>`,
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
    'DeepRest’s website sets no cookies of its own. This notice lists the cookies and stored items that Calendly, and the services it uses, set if you choose to load the booking calendar.',
  main: (ctx) => {
    const { href, site } = ctx;
    const seen = thirdParties(new URL(site.url).hostname);
    const measured = seen
      ? `
      <p>When we last checked, on ${longDate(seen.checked)}, loading the calendar and opening its booking form stored the following on the visitor’s device. Calendly decides what its page uses, so the list can change.</p>
      <h3 id="always">Whatever you answer to Calendly’s banner</h3>
      ${itemTable(seen.always.items, 'Stored whatever you answer to Calendly’s cookie banner', 'always')}
      <h3 id="if-accepted">Only if you accept Calendly’s optional cookies</h3>
      <p>Accepting them in Calendly’s banner also loads ${seen.optional.services.map((id) => service(id).name).join(', ').replace(/, ([^,]*)$/, ' and $1')}, which stored:</p>
      ${itemTable(seen.optional.items, 'Stored only if you accept Calendly’s optional cookies', 'accepted')}
      <p>The <a href="${href('privacy')}#booking-services">privacy policy</a> describes each of these services and what it collects.</p>`
      : '<p>No observation has been recorded yet.</p>';
    return `
${pageHead({
  eyebrow: 'Cookies',
  title: 'Cookie notice',
  lead: 'This website sets no cookies of its own and uses no analytics or advertising trackers. Cookies are set only if you choose to load the booking calendar, and they come from Calendly and the services it uses.',
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
    <p>If you come from one of our adverts on Facebook or Instagram, the web address carries tags that name the platform and the advert. They stay in the address and in the website’s links, and nothing is stored on your device. This website’s own pages have no Meta code, such as Meta’s Pixel. Inside the booking calendar, Calendly’s page loads Meta’s code only if you accept Calendly’s optional cookies, as the list below shows. The <a href="${href('privacy')}#information">privacy policy</a> explains the tags.</p>

    <h2 id="calendly">Calendly, our booking system</h2>
    <p>Sessions are booked through Calendly, provided by Calendly, LLC in the United States. The booking calendar is not loaded until you ask for it, either with the button on the <a href="${href('book')}">booking page</a> or through the booking button at the top of each page.</p>
    <p>Once it is loaded, your browser connects to Calendly and to services Calendly’s page uses, which set cookies and store items on your device. Calendly shows its own cookie banner inside the calendar, where you can accept or decline its optional cookies, and its ${ext(CALENDLY_PRIVACY, 'privacy notice')} explains how it uses cookies.</p>
    ${measured}

    <h2 id="your-choice">Changing your choice</h2>
    <div class="consent-status">
      <p data-consent-status role="status">Your choice is stored in your browser. With JavaScript turned on, this page shows it here and lets you clear it.</p>
      <p><button class="btn btn-secondary" type="button" data-consent-forget disabled>Clear my choice</button></p>
    </div>
    <p>Clearing your choice means we will ask again before loading Calendly. It does not delete what Calendly and the services it uses have already stored: you can delete that, or block it, in your browser’s settings for those sites, such as calendly.com.</p>

    <h2 id="questions">Questions</h2>
    <p>The <a href="${href('privacy')}">privacy policy</a> explains how we handle personal information and how to contact us.</p>
  </div></div>
</div>`;
  },
};
