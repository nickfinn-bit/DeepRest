import { icons } from '../lib/icons.mjs';
import { ctaBand, inWords, pageHead } from '../lib/ui.mjs';

export default {
  slug: 'mentoring',
  name: 'How mentoring works',
  title: () => 'How mentoring works | DeepRest',
  description: ({ F }) =>
    `One-to-one mentoring for ${F.plain('mentor.clientGroups')} who want to break free from tech addiction, starting with ${inWords(F.value('offer.freeSessions'))} free sessions as a diagnostic.`,
  main: (ctx) => {
    const { F, href } = ctx;
    const nick = F.text('mentor.firstName');
    const free = inWords(F.value('offer.freeSessions'));
    return `
${pageHead({
  eyebrow: 'Mentoring',
  title: 'How mentoring works',
  lead: `One-to-one mentoring for ${F.text('mentor.clientGroups')} who want to break free from tech addiction, starting with ${free} free sessions.`,
})}

<section class="section" aria-labelledby="who-title">
  <div class="container split">
    <div>
      <h2 id="who-title">Who it’s for</h2>
      <p>DeepRest is for ${F.text('mentor.clientGroups')} who feel that their phone, games or time online have taken over more of their life than they would like, and who want to change that.</p>
      <p>${nick} has mentored ${F.text('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years, and has seen many people go through tech addiction and come out of it.</p>
    </div>
    <div>
      <h2 id="what-title">What mentoring is</h2>
      <p>Mentoring is practical, one-to-one support from someone on your side, who has helped others through the same thing.</p>
      <p>It is not therapy or medical care, and it can’t replace help from your GP or a health professional.</p>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="free-title">
  <div class="container split">
    <div>
      <p class="eyebrow">The free diagnostic</p>
      <h2 id="free-title">${free.replace(/^./, (c) => c.toUpperCase())} free sessions to start</h2>
      <p>Your first ${free} sessions are free, as a diagnostic: a chance to understand your tech habits and what you want to change, and to see whether mentoring with ${nick} suits you.</p>
      <p>There is nothing to pay for them, and no obligation to continue afterwards.</p>
    </div>
    <div class="card">
      <h3>${icons.calendar}Booking</h3>
      <p>Each session is booked separately in the <a href="${href('book')}">booking calendar</a>, which shows how long it lasts and how you will meet. Your confirmation email has the details, and links to move or cancel the session.</p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="steps-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">What to expect</p>
      <h2 id="steps-title">From your first session onwards</h2>
    </div>
    <ol class="steps">
      <li>
        <h3>Book a free session</h3>
        <p>Choose a day and time that suits you in the booking calendar, and confirm it with your name and email address.</p>
      </li>
      <li>
        <h3>The diagnostic</h3>
        <p>Over your first ${free} sessions, you and ${nick} look at how tech fits into your days, what it is costing you and what you would like to change.</p>
      </li>
      <li>
        <h3>Decide what’s next</h3>
        <p>When the ${free} free sessions are over, you decide together whether to carry on. It is your choice.</p>
      </li>
    </ol>
  </div>
</section>

${ctaBand(ctx, {
  title: 'Take the first step',
  text: `Book your first free session online. If you are not sure whether mentoring is right for you, you can ask a question first.`,
})}`;
  },
};
