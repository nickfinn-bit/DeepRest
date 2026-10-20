import { ctaBand, figures, inWords, pageHead } from '../lib/ui.mjs';

// No photograph of Nick has been supplied, so the profile card shows his initials.
const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('');

export default {
  slug: 'about',
  name: 'About Nick',
  title: ({ F }) => `About ${F.plain('mentor.name')} | DeepRest`,
  description: ({ F }) =>
    `${F.plain('mentor.name')} has mentored ${F.plain('mentor.clientGroups')} through tech addiction for ${inWords(F.value('mentor.years'))} years, with a ${F.plain('mentor.satisfaction')} satisfaction rate across ${F.plain('mentor.clients')} clients.`,
  main: (ctx) => {
    const { F } = ctx;
    const nick = F.text('mentor.firstName');
    return `
${pageHead({
  eyebrow: 'About',
  title: F.text('mentor.name'),
  lead: `The mentor behind DeepRest. For ${inWords(F.value('mentor.years'))} years, ${nick} has helped ${F.text('mentor.clientGroups')} get out of tech addiction.`,
})}

<section class="section" aria-labelledby="story-title">
  <div class="container about-grid">
    <aside class="profile-card" aria-label="${F.plain('mentor.name')} at a glance">
      <p class="profile-initials" aria-hidden="true">${initials(F.plain('mentor.name'))}</p>
      <p class="profile-name">${F.text('mentor.name')}</p>
      <p class="profile-role">Mentor, DeepRest</p>
      ${figures(ctx, 'figures-compact')}
    </aside>
    <div class="prose">
      <h2 id="story-title">${inWords(F.value('mentor.years')).replace(/^./, (c) => c.toUpperCase())} years of mentoring</h2>
      <p>${nick} has spent the last ${inWords(F.value('mentor.years'))} years mentoring ${F.text('mentor.clientGroups')}.</p>
      <p>He is young, and that has played to his advantage. It has meant seeing many people go through tech addiction, and being able to help them get out of it.</p>
      <p>DeepRest is his own practice, set up to offer that mentoring to ${F.text('mentor.clientGroups')} who feel that tech has too much of a hold on them.</p>

      <h2 id="record-title">His record</h2>
      <p>Across the ${F.text('mentor.clients')} clients he has mentored, ${nick}’s satisfaction rate is ${F.text('mentor.satisfaction')}.</p>

      <h2 id="role-title">What ${nick} is, and isn’t</h2>
      <p>${nick} is a mentor. He is not a medical or mental health professional, and mentoring is not therapy or medical care.</p>
      <p>If you are worried about your mental or physical health, please talk to your GP. If you need help urgently, see <a href="#urgent-help">getting help now</a>.</p>
    </div>
  </div>
</section>

${ctaBand(ctx, {
  title: `Meet ${nick}`,
  text: `Your first ${inWords(F.value('offer.freeSessions'))} sessions are free, as a diagnostic. Book one online, or get in touch if you would like to ask something first.`,
})}`;
  },
};
