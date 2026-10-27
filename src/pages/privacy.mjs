import { emailLink } from '../lib/layout.mjs';
import { esc } from '../lib/facts.mjs';
import { service, thirdParties } from '../lib/third-parties.mjs';
import { ext, keepDate, pageHead } from '../lib/ui.mjs';

const CALENDLY_PRIVACY = 'https://calendly.com/legal/privacy-notice';
const GOOGLE_PRIVACY = 'https://policies.google.com/privacy?hl=en-GB';
const CLOUDFLARE_PRIVACY = 'https://www.cloudflare.com/privacypolicy/';
const GITHUB_PRIVACY = 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement';
const ICO_COMPLAINT = 'https://ico.org.uk/make-a-complaint/';
const META_PRIVACY = 'https://privacycenter.instagram.com/policy/';

const SECTIONS = [
  ['who-we-are', 'Who we are'],
  ['information', 'The information we collect'],
  ['lawful-bases', 'How we use it, and our lawful bases'],
  ['sharing', 'The services that hold it'],
  ['booking-services', 'Services the booking calendar loads'],
  ['transfers', 'Transfers outside the UK'],
  ['retention', 'How long we keep it'],
  ['rights', 'Your rights'],
  ['complaints', 'Complaints'],
  ['changes', 'Cookies and changes to this policy'],
];

const longDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// A name as the start of a sentence: "Calendly, LLC." but "Cloudflare, Inc.", not "Inc..".
const stop = (name) => (/[.!?]$/.test(name) ? name : `${name}.`);

// The services Calendly's page loads, as measured, each marked so the verification can
// compare the policy with what was measured.
function bookingServices(seen, href) {
  if (!seen) return '<p>No observation has been recorded yet.</p>';
  const always = seen.always.services.map(service);
  const optional = seen.optional.services.map(service);
  return `
      <p>The booking calendar is Calendly’s own page, shown inside ours. When you load it, Calendly’s page connects your browser to the services below, which Calendly chooses. We list what we saw when we last checked, on ${keepDate(longDate(seen.checked))}, by loading the calendar and opening its booking form; Calendly can change them. Each collects your IP address and details of your browser, as any connection does, and the information described.</p>
      <p><strong>Whatever you answer to Calendly’s cookie banner:</strong></p>
      <ul>
        ${always.map((s) => `<li data-third-party="${s.id}" data-when="always"><strong>${esc(stop(s.name))}</strong> ${esc(s.role)} It collects ${esc(s.collects)} See its ${ext(s.privacy, 'privacy policy')}.</li>`).join('\n        ')}
      </ul>
      <p><strong>Only if you accept Calendly’s optional cookies.</strong> Calendly’s banner says it uses optional cookies “to improve and personalize your experience, to understand website interactions (including clicks, cursor movement and screen recordings), and for marketing”. If you accept them, Calendly’s page also loads:</p>
      <ul>
        ${optional.map((s) => `<li data-third-party="${s.id}" data-when="accepted"><strong>${esc(s.name)}</strong>: ${esc(s.role)}</li>`).join('\n        ')}
      </ul>
      <p>These are Calendly’s tools, used for Calendly’s own purposes under its ${ext(CALENDLY_PRIVACY, 'privacy notice')}; DeepRest receives nothing from them. If you decline Calendly’s optional cookies, none of them was loaded when we checked. The <a href="${href('cookies')}">cookie notice</a> lists what each service stores on your device.</p>`;
}

// Keeps legal references such as "Article 6(1)(b)", "6(1)(d)" or "Article 9" on one line.
const keepRefsTogether = (html) => html.replace(/\bArticle \d+(?:\(\d\)\([a-z]\))?|\b\d\(\d\)\([a-z]\)/g, '<span class="nowrap">$&</span>');

export default {
  slug: 'privacy',
  name: 'Privacy policy',
  title: () => 'Privacy policy | DeepRest',
  description: () =>
    'How DeepRest collects, uses and protects personal information when you visit the website, book a session or get in touch, and your rights under UK data protection law.',
  main: (ctx) => {
    const { F, href, site } = ctx;
    const nick = F.text('mentor.firstName');
    const email = emailLink(F, false);
    const seen = thirdParties(new URL(site.url).hostname);
    return keepRefsTogether(`
${pageHead({
  eyebrow: 'Privacy',
  title: 'Privacy policy',
  lead: 'How DeepRest collects, uses and protects your personal information, and your rights under UK data protection law: the UK GDPR and the Data Protection Act&nbsp;2018.',
})}

<div class="section">
  <div class="container doc-grid">
    <nav class="doc-toc" aria-label="On this page">
      <p class="doc-toc-title">On this page</p>
      <ol>
        ${SECTIONS.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('\n        ')}
      </ol>
    </nav>
    <div class="prose doc">
      <p class="doc-meta">Last updated: ${keepDate(F.text('privacy.lastUpdated'))}</p>

      <h2 id="who-we-are">Who we are</h2>
      <p>DeepRest is the mentoring practice of ${F.text('mentor.legalName')} (${nick}). ${nick} is responsible for your personal information: he is its “data controller”. In this policy, “we” and “us” mean DeepRest and ${nick}.</p>
      <p>You can contact us about your information at ${email}.</p>

      <h2 id="information">The information we collect</h2>
      <ul>
        <li><strong>When you book.</strong> Bookings are made through Calendly. It collects your name and email address, the session and time you choose, your time zone, anything you write in answer to the booking form’s optional question (“Please share anything that will help prepare for our meeting.”), and the email address of any guest you add. If you cancel or move a session, Calendly also records that, and any reason you give.</li>
        <li><strong>Your session.</strong> Calendly adds the booking to ${nick}’s Google Calendar. The session is held on the web-conferencing service whose details come with your booking confirmation; that service handles the call, and what it collects, under its own privacy policy.</li>
        <li><strong>When you email us.</strong> Your email address and what you write. Email sent to ${email} passes through Cloudflare, which forwards it to ${nick}’s Google email account.</li>
        <li><strong>When you visit this website.</strong> The website uses no analytics and sets no cookies of its own. It is hosted on GitHub Pages, which logs the IP address of every visitor for security purposes. If you choose to load the booking calendar, Calendly and the services its page uses collect information about your device and store cookies and other items on it, as <a href="#booking-services">Services the booking calendar loads</a> and the <a href="${href('cookies')}">cookie notice</a> explain.</li>
        <li><strong>If you come from one of our adverts.</strong> A link in one of our adverts on Facebook or Instagram adds tags to the web address that name the platform and the advert, such as <code>utm_source=ig</code> and <code>utm_content=ad_b</code>. The tags say nothing about you. The website keeps them in its links as you move between pages, and passes them to Calendly if you book, which records them with your booking. That lets us see which adverts lead to bookings. This website’s own pages have no Meta code, such as Meta’s Pixel, and send Meta nothing about your visit or your booking. Inside the booking calendar, Calendly’s page loads Meta’s code only if you accept Calendly’s optional cookies (see <a href="#booking-services">Services the booking calendar loads</a>). What Meta collects when you see or tap an advert on its apps is covered by ${ext(META_PRIVACY, 'Meta’s Privacy Policy')}.</li>
      </ul>
      <p>We don’t ask for information about your health. If you choose to tell us about it, for example in the booking form or in a session, we handle it with the extra care the law requires for health information.</p>

      <h2 id="lawful-bases">How we use it, and our lawful bases</h2>
      <p>The law allows us to use personal information only where we have a lawful basis under Article 6 of the UK GDPR. For health information we also need a condition under Article 9.</p>
      <div class="table-wrap">
        <table class="doc-table">
          <caption class="visually-hidden">Purposes and lawful bases</caption>
          <thead>
            <tr><th scope="col">What we use it for</th><th scope="col">Lawful basis</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row" data-label="Purpose">Arranging and holding the sessions you book, and sending you what you need for them</th><td data-label="Lawful basis">Providing the mentoring you ask for: Article 6(1)(b)</td></tr>
            <tr><th scope="row" data-label="Purpose">Replying to your emails</th><td data-label="Lawful basis">Our legitimate interest in answering the questions people send us: Article 6(1)(f)</td></tr>
            <tr><th scope="row" data-label="Purpose">Using any health information you choose to share, only to mentor you</th><td data-label="Lawful basis">Providing the mentoring you ask for: Article 6(1)(b); and your explicit consent, which you can withdraw at any time: Article 9(2)(a)</td></tr>
            <tr><th scope="row" data-label="Purpose">Loading the Calendly booking calendar, and the cookies and other items Calendly and the services its page uses then store</th><td data-label="Lawful basis">Your consent, given when you choose to load it: Article 6(1)(a)</td></tr>
            <tr><th scope="row" data-label="Purpose">Recording which advert led to a booking, from the tags in the advert’s link</th><td data-label="Lawful basis">Our legitimate interest in knowing which adverts help people find us, so that we spend only on those: Article 6(1)(f)</td></tr>
            <tr><th scope="row" data-label="Purpose">Sharing information where the law requires it, or to protect you or someone else from serious harm</th><td data-label="Lawful basis">Legal obligation, or vital interests: Article 6(1)(c) or 6(1)(d)</td></tr>
            <tr><th scope="row" data-label="Purpose">Keeping the website secure (GitHub’s logs)</th><td data-label="Lawful basis">Our legitimate interest in keeping the website safe and available: Article 6(1)(f)</td></tr>
          </tbody>
        </table>
      </div>
      <p>We do not sell your information, share it with advertisers or use it to choose who sees our adverts, and we do not make decisions about you based solely on automated processing.</p>

      <h2 id="sharing">The services that hold it</h2>
      <p>We use these services to run DeepRest. Each holds the information described above for us:</p>
      <ul>
        <li><strong>Calendly, LLC</strong>, which provides the booking system. Its ${ext(CALENDLY_PRIVACY, 'privacy notice')} explains its own practices.</li>
        <li><strong>Google LLC</strong>, which provides ${nick}’s calendar and email. See Google’s ${ext(GOOGLE_PRIVACY, 'privacy policy')}.</li>
        <li><strong>The web-conferencing service</strong> whose details come with your booking confirmation, which carries the session’s call.</li>
        <li><strong>Cloudflare, Inc.</strong>, which forwards email sent to ${email}. See Cloudflare’s ${ext(CLOUDFLARE_PRIVACY, 'privacy policy')}.</li>
        <li><strong>GitHub, Inc.</strong>, which hosts this website and keeps the security logs described above. See GitHub’s ${ext(GITHUB_PRIVACY, 'privacy statement')}.</li>
      </ul>
      <p>We share your information with anyone else only if the law requires it, or if it is needed to protect you or someone else from serious harm.</p>

      <h2 id="booking-services">Services the booking calendar loads</h2>
      ${bookingServices(seen, href)}

      <h2 id="transfers">Transfers outside the UK</h2>
      <p>Calendly, Google, Cloudflare and GitHub are based in the United States. Each states that it complies with the UK Extension to the EU-U.S. Data Privacy Framework, under which UK law regards personal data sent to certified US organisations as adequately protected.</p>
      <p>The other services Calendly’s page loads are Calendly’s choice. Their own privacy policies, linked above, explain where they hold information and how they protect it, as the web-conferencing service’s policy does for the call.</p>

      <h2 id="retention">How long we keep it</h2>
      <p>We keep booking details and emails only for as long as we need them to mentor you and to deal with any questions afterwards, and then delete them. You can ask us to delete your information sooner.</p>
      <p>GitHub decides how long it keeps its security logs, as its privacy statement explains.</p>

      <h2 id="rights">Your rights</h2>
      <p>Under UK data protection law you have the right to:</p>
      <ul>
        <li><strong>be informed</strong> about how your information is used, which is what this policy is for;</li>
        <li><strong>access</strong> your information and receive a copy of it;</li>
        <li><strong>rectification</strong>: have inaccurate or incomplete information corrected;</li>
        <li><strong>erasure</strong>: have your information deleted;</li>
        <li><strong>restriction</strong>: ask us to limit how we use your information;</li>
        <li><strong>data portability</strong>: receive information you gave us in a format you can take elsewhere;</li>
        <li><strong>object</strong> to our using your information on the basis of our legitimate interests;</li>
        <li><strong>withdraw your consent</strong> at any time, where we rely on it.</li>
      </ul>
      <p>To use any of these rights, contact us at ${email}. You don’t usually have to pay. We will respond within one month; if your request is complex, the law lets us take up to two further months, and we will tell you if we need to.</p>

      <h2 id="complaints">Complaints</h2>
      <p>If you are unhappy with how we have handled your information, please tell us first, so we can try to put it right.</p>
      <p>You also have the right to complain to the Information Commissioner’s Office (ICO), the UK’s data protection regulator: ${ext(ICO_COMPLAINT, 'make a complaint on the ICO’s website')}, or call the ICO’s helpline on <a href="tel:03031231113">0303 123 1113</a>.</p>

      <h2 id="changes">Cookies and changes to this policy</h2>
      <p>The <a href="${href('cookies')}">cookie notice</a> explains what is stored on your device and the choices you have.</p>
      <p>We will update this policy whenever the way we use personal information changes. It was last updated on ${keepDate(F.text('privacy.lastUpdated'))}.</p>
    </div>
  </div>
</div>`);
  },
};
