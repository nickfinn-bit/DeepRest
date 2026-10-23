import { icons } from '../lib/icons.mjs';
import { bookingSteps, ctaBand, figures, inWords } from '../lib/ui.mjs';

export default {
  slug: '',
  name: 'Home',
  title: ({ F }) => `DeepRest: tech-addiction mentoring with ${F.plain('mentor.name')}`,
  description: ({ F }) =>
    `Tech-addiction mentoring with ${F.plain('mentor.name')}: ${inWords(F.value('mentor.years'))} years mentoring ${F.plain('mentor.clientGroups')}, ` +
    `a ${F.plain('mentor.satisfaction')} satisfaction rate across ${F.plain('mentor.clients')} clients, and your first ${inWords(F.value('offer.freeSessions'))} sessions free.`,
  main: (ctx) => {
    const { F, href } = ctx;
    const free = inWords(F.value('offer.freeSessions'));
    const nick = F.text('mentor.firstName');
    return `
<section class="hero" aria-labelledby="hero-title">
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">Tech-addiction mentoring</p>
      <h1 id="hero-title">Take back your time from tech</h1>
      <p class="lead">DeepRest is ${F.text('mentor.name')}’s tech-addiction mentoring practice. He has mentored ${F.text('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years.</p>
      <p class="hero-offer">${icons.gift}<span><strong>Your first ${free} sessions are free</strong>, as a diagnostic.</span></p>
      <div class="button-row">
        <a class="btn btn-primary btn-lg" href="${href('book')}">Book a free session</a>
        <a class="btn btn-secondary btn-lg" href="${href('mentoring')}">About the mentoring</a>
      </div>
    </div>
    <aside class="hero-card" aria-labelledby="record-title">
      <h2 id="record-title" class="hero-card-title">${nick}’s record</h2>
      ${figures(ctx)}
    </aside>
  </div>
</section>

<section class="section" aria-labelledby="free-title">
  <div class="container split">
    <div>
      <p class="eyebrow">Start free</p>
      <h2 id="free-title">Your first ${free} sessions are free</h2>
      <p>They are a diagnostic, and there is nothing to pay for them.</p>
      <p><a class="link-arrow" href="${href('book')}#all-five">How to book all ${free}${icons.arrow}</a></p>
    </div>
    <div class="card">
      <h3>${icons.calendar}Booking a free session</h3>
      <ul class="tick-list">
        <li>Choose a day and time that suits you in the online booking calendar.</li>
        <li>You only need your name and email address to book.</li>
        <li>Book each session separately, one at a time.</li>
        <li>Your confirmation email has links to move or cancel the session.</li>
      </ul>
      <p><a class="btn btn-primary" href="${href('book')}">Book a free session</a></p>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="how-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Getting started</p>
      <h2 id="how-title">Booking your ${free} free sessions</h2>
    </div>
    ${bookingSteps(ctx)}
  </div>
</section>

<section class="section" aria-labelledby="mentor-title">
  <div class="container split">
    <div>
      <p class="eyebrow">Your mentor</p>
      <h2 id="mentor-title">${inWords(F.value('mentor.years')).replace(/^./, (c) => c.toUpperCase())} years of mentoring</h2>
      <p>${F.text('mentor.name')} has mentored ${F.text('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years, with a ${F.text('mentor.satisfaction')} satisfaction rate across ${F.text('mentor.clients')} clients.</p>
      <p><a class="link-arrow" href="${href('about')}">About ${nick}${icons.arrow}</a></p>
    </div>
    <div class="card card-quiet">
      <h3>${icons.info}Mentoring, not therapy</h3>
      <p>Mentoring is not therapy or medical care, and it can’t replace help from your GP or a health professional. If you need help urgently, see <a href="#urgent-help">getting help now</a>.</p>
    </div>
  </div>
</section>

${ctaBand(ctx, {
  title: 'Ready to start?',
  text: `Book your first free session online. If you would like to ask something first, you’re welcome to get in touch.`,
})}`;
  },
};
