import { icons } from '../lib/icons.mjs';
import { emailLink } from '../lib/layout.mjs';
import { bookingSteps, inWords, notice, pageHead } from '../lib/ui.mjs';
import { esc } from '../lib/facts.mjs';

export default {
  slug: 'book',
  name: 'Book a free session',
  title: () => 'Book a free session | DeepRest',
  description: ({ F }) =>
    `Book a mentoring session with ${F.plain('mentor.name')} online. Your first ${inWords(F.value('offer.freeSessions'))} sessions are free, as a diagnostic.`,
  main: (ctx) => {
    const { F, href } = ctx;
    const calendlyUrl = F.value('calendly.url');
    const free = inWords(F.value('offer.freeSessions'));
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
  title: 'Book a free session',
  lead: `Your first ${free} sessions are free, as a diagnostic. Calendly books them one at a time: choose a day and time for the first below.`,
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
          <p class="booking-gate-text">To show the calendar, this page loads it from Calendly. Calendly then sets cookies on your device and connects to services it uses, such as Google reCAPTCHA and Stripe. Nothing is loaded until you choose to show it. <a href="${href('cookies')}#calendly">See what is loaded</a></p>
          <p class="booking-gate-js"><button class="btn btn-primary btn-lg" type="button" data-calendly-consent>Show the booking calendar</button></p>
          <p class="booking-gate-nojs">Your browser isn’t running JavaScript, so the calendar can’t be shown on this page.</p>
          <p class="booking-gate-alt">You can also <a href="${esc(calendlyUrl)}" rel="noopener">book on Calendly’s website${icons.external}<span class="visually-hidden"> (external site)</span></a>.</p>
        </div>
        <p class="booking-loading" role="status">Loading the booking calendar…</p>
      </div>
    </div>
    <div class="booking-next" data-booking-next>
      <p data-booking-next-text role="status">Booked a session? Book the next of your ${free} free sessions here.</p>
      <button class="btn btn-secondary" type="button" data-calendly-restart>Book another session</button>
    </div>
    <div class="booking-all" id="all-five">
      <h2 id="all-five-title">Booking all ${free} free sessions</h2>
      ${bookingSteps(ctx)}
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
        <h3>Cancelling or moving</h3>
        <p>Your confirmation email from Calendly has links to cancel the session or move it to another time.</p>
      </div>
      <div class="card">
        <h3>No suitable time?</h3>
        <p>If none of the times suit you, or you would like to ask something first, email ${emailLink(F, false)}.</p>
      </div>
      <div class="card">
        <h3>Need help urgently?</h3>
        <p>DeepRest is not an emergency service. If you need help now, see <a href="#urgent-help">getting help now</a>.</p>
      </div>
    </div>
  </div>
</section>`;
  },
};
