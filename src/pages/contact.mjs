import { icons } from '../lib/icons.mjs';
import { emailLink } from '../lib/layout.mjs';
import { inWords, notice, pageHead } from '../lib/ui.mjs';

export default {
  slug: 'contact',
  name: 'Contact',
  title: () => 'Contact | DeepRest',
  description: ({ F }) => `How to contact DeepRest and ${F.plain('mentor.name')} by email, or book a free session online.`,
  main: (ctx) => {
    const { F, href } = ctx;
    const nick = F.text('mentor.firstName');
    return `
${pageHead({
  eyebrow: 'Contact',
  title: 'Get in touch',
  lead: `Questions before you book? You’re welcome to email ${nick}.`,
})}

<section class="section" aria-labelledby="details-title">
  <div class="container">
    <h2 id="details-title" class="visually-hidden">Contact details</h2>
    <div class="card-grid contact-grid">
      <div class="card contact-card">
        <h3>Email</h3>
        <p class="contact-value">${emailLink(F)}</p>
        <p>Emails to this address go to ${nick}.</p>
      </div>
      <div class="card contact-card">
        <h3>Book a free session</h3>
        <p class="contact-value">${icons.calendar}<a href="${href('book')}">Booking calendar</a></p>
        <p>Your first ${inWords(F.value('offer.freeSessions'))} sessions are free, as a diagnostic.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="writing-title">
  <div class="container split">
    <div>
      <h2 id="writing-title">When you write</h2>
      <p>Ordinary email is not encrypted from end to end, so please keep your first message short and leave out detailed personal or health information.</p>
      <p>The <a href="${href('privacy')}">privacy policy</a> explains how your messages are handled.</p>
    </div>
    <div>
      ${notice(
        'urgent',
        'This is not an emergency service',
        `<p>DeepRest cannot respond to urgent requests. If you need help now, call 999 in an emergency, NHS&nbsp;111 for urgent medical help or advice, or Samaritans free on 116&nbsp;123. <a href="#urgent-help">More about getting help now</a>.</p>`,
        icons.heart,
      )}
    </div>
  </div>
</section>`;
  },
};
