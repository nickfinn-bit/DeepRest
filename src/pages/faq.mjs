import { icons } from '../lib/icons.mjs';
import { ctaBand, ext, pageHead } from '../lib/ui.mjs';
import { HCPC_REGISTER } from '../lib/layout.mjs';

const item = (id, q, a) => `
<details class="faq-item" id="${id}">
  <summary><h2 class="faq-q">${q}</h2>${icons.chevron}</summary>
  <div class="faq-a">${a}</div>
</details>`;

export default {
  slug: 'faq',
  name: 'FAQ',
  title: () => 'Questions and answers | DeepRest',
  description: () =>
    'Answers to common questions about seeing a psychologist at DeepRest: registration, confidentiality, first appointments, fees, cancelling and urgent help.',
  main: (ctx) => {
    const { F, href } = ctx;
    return `
${pageHead({
  eyebrow: 'FAQ',
  title: 'Questions and answers',
  lead: 'If your question isn’t answered here, you’re welcome to <a href="' + href('contact') + '">get in touch</a>.',
})}

<section class="section" aria-label="Questions">
  <div class="container narrow faq-list">
    ${item('difference', 'What is the difference between a psychologist, a psychiatrist and a counsellor?', `
      <p>Practitioner psychologists, such as clinical and counselling psychologists, are trained to assess psychological difficulties and to offer psychological therapy. In the UK they must be registered with the Health and Care Professions Council (HCPC).</p>
      <p>Psychiatrists are medical doctors who specialise in mental health, and they can prescribe medication. Psychologists do not prescribe medication.</p>
      <p>Counsellors and psychotherapists are not regulated by law in the same way, although many belong to professional bodies with their own registers.</p>`)}
    ${item('registration', `How can I check ${F.text('psychologist.name')}’s registration?`, `
      <p>${F.text('psychologist.name')} is registered with the HCPC as ${F.text('psychologist.title')}, registration number ${F.text('psychologist.hcpcNumber')}. You can search for that name or number on the HCPC’s online register.</p>
      <p>${ext(HCPC_REGISTER, 'Check the HCPC register')}</p>`)}
    ${item('confidential', 'Is what I say confidential?', `
      <p>Yes, with limits that apply to every registered psychologist. Information may have to be shared if there is a serious risk of harm to you or to someone else, or if the law or a court requires it. Wherever it is possible and safe, this would be discussed with you first.</p>
      <p>How your information is kept is explained in the <a href="${href('privacy')}">privacy policy</a>.</p>`)}
    ${item('first-appointment', 'What happens at the first appointment?', `
      <p>It’s a conversation about what has brought you, what you hope might change, and whether working together feels right for you. You can ask questions too, about the approach, confidentiality or anything else.</p>`)}
    ${item('how-many', 'How many sessions will I need?', `
      <p>It depends on what you would like help with. You’ll review together how things are going, and decide together on next steps.</p>`)}
    ${item('formats', 'Are sessions online or in person?', `<p>${F.text('sessions.formats')}</p>`)}
    ${item('cost', 'How much does it cost, and can I use health insurance?', `
      <p>Fees, payment and health insurance are explained on the <a href="${href('fees')}">fees and insurance</a> page. If you plan to claim on insurance, check your cover with your insurer before you book.</p>`)}
    ${item('cancel', 'How do I cancel or move an appointment?', `<p>${F.text('fees.cancellation')}</p>`)}
    ${item('urgent', 'What if I need help urgently?', `
      <p><strong>DeepRest is not an emergency service.</strong> If you or someone else is in immediate danger, call 999 or go to your nearest A&amp;E. For urgent medical help or advice that isn’t an emergency, call NHS 111. You can talk to Samaritans free, day or night, on 116 123.</p>`)}
    ${item('booking-data', 'What happens to the details I give when I book?', `
      <p>Bookings are made through Calendly, which holds your booking details on DeepRest’s behalf. The <a href="${href('privacy')}">privacy policy</a> explains what is collected and why, and the <a href="${href('cookies')}">cookie notice</a> explains the cookies Calendly sets.</p>`)}
  </div>
</section>

${ctaBand(ctx, {
  title: 'Still have a question?',
  text: 'You can book a first appointment online, or get in touch first.',
})}`;
  },
};
