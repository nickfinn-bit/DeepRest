import { icons } from '../lib/icons.mjs';
import { notice, pageHead } from '../lib/ui.mjs';
import { esc } from '../lib/facts.mjs';

export default {
  slug: 'book',
  name: 'Book a session',
  title: () => 'Book a session | DeepRest',
  description: ({ F }) =>
    `Book an appointment with ${F.plain('psychologist.name')} at DeepRest online, at a day and time that suits you.`,
  main: (ctx) => {
    const { F, href } = ctx;
    const calendlyUrl = F.value('calendly.url');
    const demo = F.isPlaceholder('calendly.url')
      ? notice(
          'demo',
          'Demonstration calendar',
          `<p>Until DeepRest’s own booking link is added, this page shows <span class="ph" data-ph="calendly.url">Calendly’s own demo scheduling page</span>, not DeepRest’s calendar. Please don’t use it to book.</p>`,
        )
      : '';
    return `
${pageHead({
  eyebrow: 'Booking',
  title: 'Book a session',
  lead: 'Choose a day and time that suits you in the booking calendar.',
})}

<section class="section section-tight" aria-labelledby="calendar-title">
  <div class="container">
    <h2 id="calendar-title" class="visually-hidden">Booking calendar</h2>
    ${demo}
    <div class="booking-frame" id="booking-frame" data-calendly-inline>
      <div class="booking-gate">
        <div class="booking-gate-inner">
          <span class="booking-gate-icon">${icons.calendar}</span>
          <h3>The booking calendar is provided by Calendly</h3>
          <p class="booking-gate-text">To show the calendar, this page loads it from Calendly, which sets its own cookies on your device. Nothing is loaded from Calendly until you choose to show it. <a href="${href('cookies')}">Read the cookie notice</a></p>
          <p class="booking-gate-js"><button class="btn btn-primary btn-lg" type="button" data-calendly-consent>Show the booking calendar</button></p>
          <p class="booking-gate-nojs">Your browser isn’t running JavaScript, so the calendar can’t be shown on this page.</p>
          <p class="booking-gate-alt">You can also <a href="${esc(calendlyUrl)}" rel="noopener">book on Calendly’s website${icons.external}<span class="visually-hidden"> (external site)</span></a>.</p>
        </div>
        <p class="booking-loading" role="status">Loading the booking calendar…</p>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="before-title" id="before-you-book">
  <div class="container">
    <div class="section-head">
      <h2 id="before-title">Before you book</h2>
    </div>
    <div class="card-grid">
      <div class="card">
        <h3>Fees and payment</h3>
        <p>What each appointment costs and how to pay are on the <a href="${href('fees')}">fees and insurance</a> page.</p>
      </div>
      <div class="card">
        <h3>Using health insurance</h3>
        <p>If you plan to claim, <a href="${href('fees')}#insurance">check your cover with your insurer</a> before you book.</p>
      </div>
      <div class="card">
        <h3>Cancelling or moving</h3>
        <p>${F.text('fees.cancellation')}</p>
      </div>
      <div class="card">
        <h3>No suitable time?</h3>
        <p>If none of the times suit you, or you would like to ask something first, please <a href="${href('contact')}">get in touch</a>.</p>
      </div>
    </div>
  </div>
</section>`;
  },
};
