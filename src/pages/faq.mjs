import { icons } from '../lib/icons.mjs';
import { ctaBand, inWords, pageHead } from '../lib/ui.mjs';
import { emailLink } from '../lib/layout.mjs';

const item = (id, q, a) => `
<details class="faq-item" id="${id}">
  <summary><h2 class="faq-q">${q}</h2>${icons.chevron}</summary>
  <div class="faq-a">${a}</div>
</details>`;

export default {
  slug: 'faq',
  name: 'FAQ',
  title: () => 'Questions and answers | DeepRest',
  description: ({ F }) =>
    `Answers to questions about mentoring at DeepRest: the ${inWords(F.value('offer.freeSessions'))} free sessions, booking all ${inWords(F.value('offer.freeSessions'))}, cancelling and urgent help.`,
  main: (ctx) => {
    const { F, href } = ctx;
    const nick = F.text('mentor.firstName');
    const free = inWords(F.value('offer.freeSessions'));
    return `
${pageHead({
  eyebrow: 'FAQ',
  title: 'Questions and answers',
  lead: 'If your question isn’t answered here, you’re welcome to <a href="' + href('contact') + '">get in touch</a>.',
})}

<section class="section" aria-label="Questions">
  <div class="container narrow faq-list">
    ${item('free', `Are the first ${free} sessions really free?`, `
      <p>Yes. Your first ${free} sessions are free, as a diagnostic. There is nothing to pay for them.</p>`)}
    ${item('nick', `Who is ${nick}?`, `
      <p>${F.text('mentor.name')} is the mentor behind DeepRest. He has mentored ${F.text('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years, with a ${F.text('mentor.satisfaction')} satisfaction rate across ${F.text('mentor.clients')} clients.</p>
      <p><a href="${href('about')}">More about ${nick}</a></p>`)}
    ${item('therapy', 'Is mentoring the same as therapy?', `
      <p>No. ${nick} is a mentor, and mentoring is not therapy or medical care.</p>
      <p>If you are worried about your mental or physical health, please talk to your GP.</p>`)}
    ${item('book', 'How do I book?', `
      <p>Choose a day and time in the <a href="${href('book')}">booking calendar</a>, and confirm it with your name and email address. Calendly books one session at a time, so you book each of your ${free} free sessions separately: the booking page explains <a href="${href('book')}#all-five">how to book all ${free}</a>.</p>
      <p>The calendar is provided by Calendly and loads only once you agree to it. Calendly then sets cookies on your device and connects to services it uses, such as Google reCAPTCHA and Stripe. The <a href="${href('cookies')}#calendly">cookie notice</a> lists what is loaded.</p>`)}
    ${item('length', 'How long is a session, and how do we meet?', `
      <p>The booking calendar shows how long a session lasts and how you will meet, and your confirmation email has the details.</p>`)}
    ${item('cancel', 'Can I cancel or move a session?', `
      <p>Yes. Your confirmation email from Calendly has links to cancel the session or move it to another time.</p>`)}
    ${item('urgent', 'What if I need help urgently?', `
      <p><strong>DeepRest is not an emergency service.</strong> If you or someone else is in immediate danger, call 999 or go to your nearest A&amp;E. For urgent medical help or advice that isn’t an emergency, call NHS 111. You can talk to Samaritans free, day or night, on 116 123.</p>`)}
    ${item('data', 'What happens to the details I give?', `
      <p>Bookings are made through Calendly, which holds your booking details for DeepRest. The <a href="${href('privacy')}">privacy policy</a> explains what is collected and why, and how to ask about it: write to ${emailLink(F, false)}.</p>`)}
  </div>
</section>

${ctaBand(ctx, {
  title: 'Still have a question?',
  text: `Book your first free session online, or get in touch first.`,
})}`;
  },
};
