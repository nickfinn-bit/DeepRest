import { icons } from '../lib/icons.mjs';
import { ctaBand, figures, inWords } from '../lib/ui.mjs';

export default {
  slug: '',
  name: 'Home',
  title: ({ F }) => `DeepRest: tech-addiction mentoring with ${F.plain('mentor.name')}`,
  description: ({ F }) =>
    `Mentoring for ${F.plain('mentor.clientGroups')} who want to break free from tech addiction. ` +
    `A ${F.plain('mentor.satisfaction')} satisfaction rate across ${F.plain('mentor.clients')} clients, and your first ${inWords(F.value('offer.freeSessions'))} sessions are free.`,
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
      <p class="lead">DeepRest is ${F.text('mentor.name')}’s mentoring practice. For ${inWords(F.value('mentor.years'))} years he has mentored ${F.text('mentor.clientGroups')} through tech addiction, and helped them out of it.</p>
      <p class="hero-offer">${icons.gift}<span><strong>Your first ${free} sessions are free</strong>, as a diagnostic.</span></p>
      <div class="button-row">
        <a class="btn btn-primary btn-lg" href="${href('book')}">Book a free session</a>
        <a class="btn btn-secondary btn-lg" href="${href('mentoring')}">How mentoring works</a>
      </div>
    </div>
    <aside class="hero-card" aria-labelledby="record-title">
      <h2 id="record-title" class="hero-card-title">${nick}’s record</h2>
      ${figures(ctx)}
      <p class="figures-note">A ${F.text('mentor.satisfaction')} satisfaction rate across the ${F.text('mentor.clients')} clients ${nick} has mentored.</p>
    </aside>
  </div>
</section>

<section class="section" aria-labelledby="free-title">
  <div class="container split">
    <div>
      <p class="eyebrow">Start free</p>
      <h2 id="free-title">Your first ${free} sessions are free</h2>
      <p>They work as a diagnostic. With ${nick}, you look at how tech fits into your days, what it is costing you and what you would like to change, and you find out whether mentoring is right for you.</p>
      <p>There is nothing to pay for these ${free} sessions.</p>
      <p><a class="link-arrow" href="${href('mentoring')}">How mentoring works${icons.arrow}</a></p>
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
      <h2 id="how-title">How it works</h2>
    </div>
    <ol class="steps">
      <li>
        <h3>Book a free session</h3>
        <p>Pick a day and time that suits you in the online booking calendar, and confirm it with your name and email address.</p>
      </li>
      <li>
        <h3>The diagnostic</h3>
        <p>Over your first ${free} sessions, which are free, you and ${nick} build a clear picture of your tech habits and what you want to change.</p>
      </li>
      <li>
        <h3>Decide what’s next</h3>
        <p>After the ${free} free sessions, you decide together whether to carry on. There is no obligation to continue.</p>
      </li>
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="mentor-title">
  <div class="container split">
    <div>
      <p class="eyebrow">Your mentor</p>
      <h2 id="mentor-title">Young, and that’s the advantage</h2>
      <p>${F.text('mentor.name')} has mentored ${F.text('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years. He is young, and that has played to his advantage: he has seen many people go through tech addiction, and has been able to help them get out of it.</p>
      <p><a class="link-arrow" href="${href('about')}">About ${nick}${icons.arrow}</a></p>
    </div>
    <div class="card card-quiet">
      <h3>${icons.info}What mentoring is, and isn’t</h3>
      <p>Mentoring is practical, one-to-one support from someone on your side.</p>
      <p>It is not therapy or medical care, and it can’t replace help from your GP or a health professional. If you need help urgently, see <a href="#urgent-help">getting help now</a>.</p>
    </div>
  </div>
</section>

${ctaBand(ctx, {
  title: 'Ready to start?',
  text: `Book your first free session online. If you would like to ask something first, you’re welcome to get in touch.`,
})}`;
  },
};
