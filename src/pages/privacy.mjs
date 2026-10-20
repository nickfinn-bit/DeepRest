import { emailLink } from '../lib/layout.mjs';
import { ext, pageHead } from '../lib/ui.mjs';

const CALENDLY_PRIVACY = 'https://calendly.com/legal/privacy-notice';
const GOOGLE_PRIVACY = 'https://policies.google.com/privacy?hl=en-GB';
const CLOUDFLARE_PRIVACY = 'https://www.cloudflare.com/privacypolicy/';
const GITHUB_PRIVACY = 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement';
const ICO_COMPLAINT = 'https://ico.org.uk/make-a-complaint/';

const SECTIONS = [
  ['who-we-are', 'Who we are'],
  ['information', 'The information we collect'],
  ['lawful-bases', 'How we use it, and our lawful bases'],
  ['sharing', 'The services that hold it'],
  ['transfers', 'Transfers outside the UK'],
  ['retention', 'How long we keep it'],
  ['rights', 'Your rights'],
  ['complaints', 'Complaints'],
  ['changes', 'Cookies and changes to this policy'],
];

// Keeps legal references such as 6(1)(b) or 9(2)(a) on one line.
const keepRefsTogether = (html) => html.replace(/\b(\d\(\d\)\([a-z]\))/g, '<span class="nowrap">$1</span>');

export default {
  slug: 'privacy',
  name: 'Privacy policy',
  title: () => 'Privacy policy | DeepRest',
  description: () =>
    'How DeepRest collects, uses and protects personal information when you visit the website, book a session or get in touch, and your rights under UK data protection law.',
  main: (ctx) => {
    const { F, href } = ctx;
    const nick = F.text('mentor.firstName');
    const email = emailLink(F, false);
    return keepRefsTogether(`
${pageHead({
  eyebrow: 'Privacy',
  title: 'Privacy policy',
  lead: 'How DeepRest collects, uses and protects your personal information, and your rights under UK data protection law: the UK GDPR and the Data Protection Act 2018.',
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
      <p class="doc-meta">Last updated: ${F.text('privacy.lastUpdated')}</p>

      <h2 id="who-we-are">Who we are</h2>
      <p>DeepRest is the mentoring practice of ${F.text('mentor.legalName')} (${nick}). ${nick} is responsible for your personal information: he is its “data controller”. In this policy, “we” and “us” mean DeepRest and ${nick}.</p>
      <p>You can contact us about your information at ${email}.</p>

      <h2 id="information">The information we collect</h2>
      <ul>
        <li><strong>When you book.</strong> Bookings are made through Calendly. It collects your name and email address, the session and time you choose, your time zone, anything you write in answer to the booking form’s optional question (“Please share anything that will help prepare for our meeting.”), and the email address of any guest you add. If you cancel or move a session, Calendly also records that, and any reason you give.</li>
        <li><strong>Your session.</strong> Calendly adds the booking to ${nick}’s Google Calendar, and creates the Google Meet video call link for the session, which Google provides.</li>
        <li><strong>When you email us.</strong> Your email address and what you write. Email sent to ${email} passes through Cloudflare, which forwards it to ${nick}’s Google email account.</li>
        <li><strong>When you visit this website.</strong> The website uses no analytics and sets no cookies of its own. It is hosted on GitHub Pages, which logs the IP address of every visitor for security purposes. If you choose to load the booking calendar, Calendly collects information about your device and sets cookies, as the <a href="${href('cookies')}">cookie notice</a> explains.</li>
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
            <tr><th scope="row" data-label="Purpose">Loading the Calendly booking calendar, and the cookies Calendly then sets</th><td data-label="Lawful basis">Your consent, given when you choose to load it: Article 6(1)(a)</td></tr>
            <tr><th scope="row" data-label="Purpose">Sharing information where the law requires it, or to protect you or someone else from serious harm</th><td data-label="Lawful basis">Legal obligation, or vital interests: Article 6(1)(c) or 6(1)(d)</td></tr>
            <tr><th scope="row" data-label="Purpose">Keeping the website secure (GitHub’s logs)</th><td data-label="Lawful basis">Legitimate interests in keeping the website safe and available: Article 6(1)(f)</td></tr>
          </tbody>
        </table>
      </div>
      <p>We do not sell your information, use it for advertising, or make decisions about you based solely on automated processing.</p>

      <h2 id="sharing">The services that hold it</h2>
      <p>We use these services to run DeepRest. Each holds the information described above for us:</p>
      <ul>
        <li><strong>Calendly, LLC</strong>, which provides the booking system. Its ${ext(CALENDLY_PRIVACY, 'privacy notice')} explains its own practices.</li>
        <li><strong>Google LLC</strong>, which provides ${nick}’s calendar and email, and the Google Meet video calls. See Google’s ${ext(GOOGLE_PRIVACY, 'privacy policy')}.</li>
        <li><strong>Cloudflare, Inc.</strong>, which forwards email sent to ${email}. See Cloudflare’s ${ext(CLOUDFLARE_PRIVACY, 'privacy policy')}.</li>
        <li><strong>GitHub, Inc.</strong>, which hosts this website and keeps the security logs described above. See GitHub’s ${ext(GITHUB_PRIVACY, 'privacy statement')}.</li>
      </ul>
      <p>We share your information with anyone else only if the law requires it, or if it is needed to protect you or someone else from serious harm.</p>

      <h2 id="transfers">Transfers outside the UK</h2>
      <p>Calendly, Google, Cloudflare and GitHub are based in the United States. Each states that it complies with the UK Extension to the EU-U.S. Data Privacy Framework, under which UK law regards personal data sent to certified US organisations as adequately protected.</p>

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
      <p>We will update this policy whenever the way we use personal information changes. It was last updated on ${F.text('privacy.lastUpdated')}.</p>
    </div>
  </div>
</div>`);
  },
};
