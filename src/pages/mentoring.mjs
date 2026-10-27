import { icons } from '../lib/icons.mjs';
import { emailLink } from '../lib/layout.mjs';
import { ctaBand, inWords, pageHead } from '../lib/ui.mjs';

export default {
  slug: 'mentoring',
  name: 'Mentoring',
  title: () => 'Mentoring | DeepRest',
  description: ({ F }) =>
    `Tech-addiction mentoring with ${F.plain('mentor.name')}. He has mentored ${F.plain('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years, and your first ${inWords(F.value('offer.freeSessions'))} sessions are free, as a diagnostic.`,
  main: (ctx) => {
    const { F, href } = ctx;
    const nick = F.text('mentor.firstName');
    const free = inWords(F.value('offer.freeSessions'));
    return `
${pageHead({
  eyebrow: 'Mentoring',
  title: 'Mentoring at DeepRest',
  lead: `Tech-addiction mentoring with ${F.text('mentor.name')}. Your first ${free} sessions are free, as a diagnostic.`,
})}

<section class="section" aria-labelledby="who-title">
  <div class="container split">
    <div>
      <h2 id="who-title">Your mentor</h2>
      <p>${nick} has mentored ${F.text('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years, with a ${F.text('mentor.satisfaction')} satisfaction rate across ${F.text('mentor.clients')} clients.</p>
      <p><a class="link-arrow" href="${href('about')}">About ${nick}${icons.arrow}</a></p>
    </div>
    <div>
      <h2 id="what-title">Mentoring, not therapy</h2>
      <p>Mentoring is not therapy or medical care, and it can’t replace help from your GP or a health professional.</p>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="free-title">
  <div class="container split">
    <div>
      <p class="eyebrow">The free diagnostic</p>
      <h2 id="free-title">${free.replace(/^./, (c) => c.toUpperCase())} free sessions to start</h2>
      <p>Your first ${free} sessions are free, as a diagnostic. There is nothing to pay for them.</p>
      <p>If you have a question before you book, email ${emailLink(F, false)}.</p>
    </div>
    <div class="card">
      <h3>${icons.calendar}Booking</h3>
      <p>Each session is booked separately in the <a href="${href('book')}">booking calendar</a>, which shows how long it lasts and how you will meet. Your confirmation email has the details, and links to move or cancel the session.</p>
      <p><a class="link-arrow" href="${href('book')}#all-five">How to book all ${free}${icons.arrow}</a></p>
    </div>
  </div>
</section>

${ctaBand(ctx, {
  title: 'Take the first step',
  text: `Book your first free session online. If you are not sure whether mentoring is right for you, you can ask a question first.`,
})}`;
  },
};
