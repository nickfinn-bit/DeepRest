import { icons } from '../lib/icons.mjs';
import { ctaBand, ext, pageHead } from '../lib/ui.mjs';
import { HCPC_REGISTER } from '../lib/layout.mjs';
import { esc } from '../lib/facts.mjs';

const HCPC_STANDARDS = 'https://www.hcpc-uk.org/standards/standards-of-conduct-performance-and-ethics/';
const HCPC_CONCERNS = 'https://www.hcpc-uk.org/concerns/';

function portrait({ F, asset }) {
  if (F.isPlaceholder('psychologist.photo')) {
    F.value('psychologist.photo');
    return `<div class="portrait portrait-placeholder" data-ph="psychologist.photo">${icons.person}<p><span class="ph-tag">To be supplied</span> Portrait photograph</p></div>`;
  }
  const file = F.value('psychologist.photo');
  return `<img class="portrait" src="${asset(`img/${file}`, false)}" width="800" height="1000" alt="${esc(F.plain('psychologist.name'))}">`;
}

export default {
  slug: 'about',
  name: 'About',
  title: ({ F }) => `About ${F.plain('psychologist.name')}, ${F.plain('psychologist.title')} | DeepRest`,
  description: ({ F }) =>
    `About ${F.plain('psychologist.name')}, ${F.plain('psychologist.title')}: professional background, qualifications, HCPC registration and BPS membership.`,
  main: (ctx) => {
    const { F } = ctx;
    return `
${pageHead({
  eyebrow: 'About the psychologist',
  title: F.text('psychologist.name'),
  lead: `${F.text('psychologist.title')}, registered with the Health and Care Professions Council (HCPC).`,
})}

<section class="section" aria-labelledby="background-title">
  <div class="container about-grid">
    <div class="about-portrait">${portrait(ctx)}</div>
    <div class="prose">
      <h2 id="background-title">Professional background</h2>
      ${F.paras('psychologist.bio')}
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="credentials-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Credentials</p>
      <h2 id="credentials-title">Qualifications, registration and membership</h2>
    </div>
    <div class="card-grid">
      <div class="card">
        <h3>Qualifications</h3>
        ${F.list('psychologist.qualifications')}
      </div>
      <div class="card">
        <h3>HCPC registration</h3>
        <p>Registered as ${F.text('psychologist.title')}, registration number ${F.text('psychologist.hcpcNumber')}.</p>
        <p>${ext(HCPC_REGISTER, 'Check the HCPC register')}</p>
      </div>
      ${F.isNone('psychologist.bpsMembership') ? '' : `<div class="card">
        <h3>British Psychological Society</h3>
        <p>${F.text('psychologist.bpsMembership')}</p>
      </div>`}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="standards-title">
  <div class="container"><div class="prose">
    <h2 id="standards-title">Professional standards</h2>
    <p>In the UK, titles such as clinical psychologist and counselling psychologist are protected by law: only people on the HCPC’s register may use them. Everyone on the register must meet the HCPC’s standards of conduct, performance and ethics, which include respecting confidentiality and keeping their knowledge and skills up to date.</p>
    <ul class="link-list">
      <li>${ext(HCPC_STANDARDS, 'The HCPC’s standards of conduct, performance and ethics')}</li>
      <li>${ext(HCPC_CONCERNS, 'Raising a concern about a registered professional with the HCPC')}</li>
    </ul>
  </div></div>
</section>

${ctaBand(ctx, {
  title: 'Would you like to meet?',
  text: 'Book a first appointment online, or get in touch if you have a question first.',
})}`;
  },
};
