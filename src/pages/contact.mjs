import { icons } from '../lib/icons.mjs';
import { notice, pageHead } from '../lib/ui.mjs';
import { contactLink } from '../lib/layout.mjs';

export default {
  slug: 'contact',
  name: 'Contact',
  title: () => 'Contact | DeepRest',
  description: () => 'How to contact DeepRest by email or telephone, and the practice address.',
  main: (ctx) => {
    const { F, href } = ctx;
    return `
${pageHead({
  eyebrow: 'Contact',
  title: 'Get in touch',
  lead: `Questions before you book? You’re welcome to contact ${F.text('psychologist.name')} by email or telephone.`,
})}

<section class="section" aria-labelledby="details-title">
  <div class="container">
    <h2 id="details-title" class="visually-hidden">Contact details</h2>
    <div class="card-grid contact-grid">
      <div class="card contact-card">
        <h3>Email</h3>
        <p class="contact-value">${contactLink(F, 'email')}</p>
      </div>
      <div class="card contact-card">
        <h3>Telephone</h3>
        <p class="contact-value">${contactLink(F, 'phone')}</p>
      </div>
      <div class="card contact-card">
        <h3>Address</h3>
        <p class="contact-value">${icons.pin}<span>${F.lines('practice.address')}</span></p>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="writing-title">
  <div class="container split">
    <div>
      <h2 id="writing-title">When you write</h2>
      <p>Ordinary email is not encrypted from end to end, so please keep your first message short and leave out detailed personal or medical information. There will be time to talk about it when you meet.</p>
      <p>To book an appointment, you can use the <a href="${href('book')}">booking calendar</a> at any time.</p>
    </div>
    <div>
      ${notice(
        'urgent',
        'This is not an emergency service',
        `<p>DeepRest cannot respond to urgent requests. If you need help now, call 999 in an emergency, NHS 111 for urgent medical help or advice, or Samaritans free on 116 123. <a href="#urgent-help">More about getting help now</a></p>`,
        icons.heart,
      )}
    </div>
  </div>
</section>`;
  },
};
