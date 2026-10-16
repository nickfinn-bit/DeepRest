import { ext, pageHead } from '../lib/ui.mjs';

const CALENDLY_PRIVACY = 'https://calendly.com/legal/privacy-notice';
const GITHUB_PRIVACY = 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement';
const ICO_COMPLAINT = 'https://ico.org.uk/make-a-complaint/';

const SECTIONS = [
  ['who-we-are', 'Who we are'],
  ['information', 'The information we collect'],
  ['lawful-bases', 'How we use it, and our lawful bases'],
  ['sharing', 'Who we share it with'],
  ['transfers', 'Transfers outside the UK'],
  ['retention', 'How long we keep it'],
  ['security', 'Keeping it secure'],
  ['rights', 'Your rights'],
  ['complaints', 'Complaints'],
  ['changes', 'Cookies and changes to this policy'],
];

// Keeps legal references such as 6(1)(b) or 9(2)(h) on one line.
const keepRefsTogether = (html) => html.replace(/\b(\d\(\d\)\([a-z]\))/g, '<span class="nowrap">$1</span>');

export default {
  slug: 'privacy',
  name: 'Privacy policy',
  title: () => 'Privacy policy | DeepRest',
  description: () =>
    'How DeepRest collects, uses and protects personal information, including health information, and your rights under UK data protection law.',
  main: (ctx) => {
    const { F, href } = ctx;
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
      <p class="doc-meta">Last reviewed: ${F.text('privacy.lastUpdated')}</p>

      <h2 id="who-we-are">Who we are</h2>
      <p>DeepRest is the psychology practice of ${F.text('psychologist.name')}, ${F.text('psychologist.title')}. In this policy, “we” and “us” mean DeepRest.</p>
      <p>The data controller responsible for your personal information is ${F.text('practice.legalName')}, ${F.lines('practice.address')}. You can contact us about your information at ${F.text('practice.email')} or on ${F.text('practice.phone')}.</p>
      <p>We are registered with the Information Commissioner’s Office (ICO), the UK’s data protection regulator, under registration number ${F.text('practice.icoRegistrationNumber')}.</p>

      <h2 id="information">The information we collect</h2>
      <p>Information about your physical or mental health is “special category” data under the UK GDPR, which the law protects more strongly. We treat everything you tell us about your health and wellbeing as special category data.</p>
      <ul>
        <li><strong>When you book.</strong> Bookings are made through Calendly. It collects your name and email address, the appointment you choose, and any answers you give to questions on the booking form.</li>
        <li><strong>When you contact us.</strong> Your contact details and what you tell us, by email or telephone.</li>
        <li><strong>When you are a client.</strong> Your contact details, other details needed to provide your care, such as your date of birth and your GP’s details if you give them, and records of your appointments, including session notes, assessments, letters and reports. These may include information about your physical and mental health and other sensitive information you choose to share.</li>
        <li><strong>When you pay.</strong> Invoices and payments and, if you claim through health insurance, your insurer, policy and authorisation details.</li>
        <li><strong>When you visit this website.</strong> The website uses no analytics and sets no cookies of its own. It is hosted on GitHub Pages, which logs the IP address of every visitor for security purposes. If you choose to load the booking calendar, Calendly collects information about your device and sets cookies, as the <a href="${href('cookies')}">cookie notice</a> explains.</li>
      </ul>

      <h2 id="lawful-bases">How we use it, and our lawful bases</h2>
      <p>The law allows us to use personal information only where we have a lawful basis under Article 6 of the UK GDPR. For health information we also need a condition under Article 9.</p>
      <div class="table-wrap">
        <table class="doc-table">
          <caption class="visually-hidden">Purposes and lawful bases</caption>
          <thead>
            <tr><th scope="col">What we use it for</th><th scope="col">Lawful basis (Article 6)</th><th scope="col">Condition for health information (Article 9)</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row" data-label="Purpose">Arranging and managing your appointments, and replying to your messages</th><td data-label="Lawful basis">Steps you ask us to take before entering a contract, and performing that contract: 6(1)(b)</td><td data-label="Health information">Health or social care: 9(2)(h), with the Data Protection Act 2018, Schedule 1, paragraph 2</td></tr>
            <tr><th scope="row" data-label="Purpose">Providing assessment and therapy, and keeping clinical records</th><td data-label="Lawful basis">Performing our contract with you: 6(1)(b)</td><td data-label="Health information">Health or social care, provided by a health professional who owes you a duty of confidentiality: 9(2)(h), with the Data Protection Act 2018, Schedule 1, paragraph 2</td></tr>
            <tr><th scope="row" data-label="Purpose">Taking payment and keeping financial records</th><td data-label="Lawful basis">Performing our contract with you, and our legal obligations under tax law: 6(1)(b) and 6(1)(c)</td><td data-label="Health information">Not applicable</td></tr>
            <tr><th scope="row" data-label="Purpose">Claiming from your health insurer, if you ask us to</th><td data-label="Lawful basis">Performing our contract with you: 6(1)(b)</td><td data-label="Health information">Your explicit consent: 9(2)(a)</td></tr>
            <tr><th scope="row" data-label="Purpose">Sharing information to protect you or someone else from serious harm</th><td data-label="Lawful basis">Vital interests, or our legitimate interest in preventing harm: 6(1)(d) or 6(1)(f)</td><td data-label="Health information">Vital interests: 9(2)(c), or safeguarding of children and of individuals at risk: 9(2)(g), with the Data Protection Act 2018, Schedule 1, paragraph 18</td></tr>
            <tr><th scope="row" data-label="Purpose">Meeting our legal and regulatory obligations, and dealing with complaints and legal claims</th><td data-label="Lawful basis">Legal obligation, and our legitimate interest in responding: 6(1)(c) and 6(1)(f)</td><td data-label="Health information">Legal claims: 9(2)(f)</td></tr>
          </tbody>
        </table>
      </div>
      <p>Loading the Calendly booking calendar, and the cookies Calendly then sets, depend on your choice, as the <a href="${href('cookies')}">cookie notice</a> explains. We do not make decisions about you based solely on automated processing.</p>

      <h2 id="sharing">Who we share it with</h2>
      <p>We share your information only where it is needed, and only with:</p>
      <ul>
        <li><strong>Calendly, LLC</strong>, which provides our booking system and holds booking details on our behalf, as our processor.</li>
        <li><strong>Other services that hold information on our behalf:</strong> ${F.text('privacy.providers')}</li>
        <li><strong>Your health insurer</strong>, if you ask us to claim from them: only the information the claim needs.</li>
        <li><strong>Your GP or other professionals involved in your care</strong>, with your agreement; or without it, where there is a serious risk of harm or the law requires it.</li>
        <li><strong>Regulators, courts and other authorities</strong>, where the law requires it.</li>
      </ul>
      <p>Processors handle your information on our behalf and only on our instructions. Calendly explains its own practices in its ${ext(CALENDLY_PRIVACY, 'privacy notice')}.</p>

      <h2 id="transfers">Transfers outside the UK</h2>
      <p>Calendly is based in the United States. Calendly, LLC states that it complies with the UK Extension to the EU-U.S. Data Privacy Framework, under which UK law treats personal data sent to certified US organisations as adequately protected.</p>
      <p>GitHub, which hosts this website and keeps the security logs described above, is also based in the United States. Its ${ext(GITHUB_PRIVACY, 'privacy statement')} says it adheres to the Data Privacy Framework principles for personal data received from the UK under the UK Extension.</p>

      <h2 id="retention">How long we keep it</h2>
      <p>${F.text('privacy.retention')}</p>

      <h2 id="security">Keeping it secure</h2>
      <p>${F.text('privacy.security')}</p>

      <h2 id="rights">Your rights</h2>
      <p>Under UK data protection law you have the right to:</p>
      <ul>
        <li><strong>be informed</strong> about how your information is used, which is what this policy is for;</li>
        <li><strong>access</strong> your information and receive a copy of it;</li>
        <li><strong>rectification</strong>: have inaccurate or incomplete information corrected;</li>
        <li><strong>erasure</strong>: have your information deleted, unless we must keep it, for example to meet a legal obligation;</li>
        <li><strong>restriction</strong>: ask us to limit how we use your information;</li>
        <li><strong>data portability</strong>: receive information you gave us in a format you can take elsewhere;</li>
        <li><strong>object</strong> to our using your information on the basis of our legitimate interests;</li>
        <li><strong>withdraw your consent</strong> at any time, where we rely on it.</li>
      </ul>
      <p>To use any of these rights, contact us at ${F.text('practice.email')}. You don’t usually have to pay. We will respond within one month; if your request is complex, the law lets us take up to two further months, and we will tell you if we need to.</p>

      <h2 id="complaints">Complaints</h2>
      <p>If you are unhappy with how we have handled your information, please tell us first, so we can try to put it right.</p>
      <p>You also have the right to complain to the Information Commissioner’s Office: ${ext(ICO_COMPLAINT, 'make a complaint on the ICO’s website')}, or call the ICO’s helpline on <a href="tel:03031231113">0303 123 1113</a>.</p>

      <h2 id="changes">Cookies and changes to this policy</h2>
      <p>The <a href="${href('cookies')}">cookie notice</a> explains what is stored on your device and the choices you have.</p>
      <p>We will update this policy whenever the way we use personal information changes. It was last reviewed on ${F.text('privacy.lastUpdated')}.</p>
    </div>
  </div>
</div>`);
  },
};
