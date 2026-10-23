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
    `${F.plain('mentor.name')} has mentored ${F.plain('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years, with a ${F.plain('mentor.satisfaction')} satisfaction rate across ${F.plain('mentor.clients')} clients.`,
  main: (ctx) => {
    const { F } = ctx;
    const nick = F.text('mentor.firstName');
    return `
${pageHead({
  eyebrow: 'About',
  title: F.text('mentor.name'),
  lead: `The mentor behind DeepRest. ${nick} has mentored ${F.text('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years.`,
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
      <p>${nick} has mentored ${F.text('mentor.clientGroups')} for ${inWords(F.value('mentor.years'))} years. DeepRest is his own tech-addiction mentoring practice.</p>

      <h2 id="record-title">His record</h2>
      <p>${nick} has a ${F.text('mentor.satisfaction')} satisfaction rate across ${F.text('mentor.clients')} clients.</p>

      <h2 id="role-title">Mentoring, not therapy</h2>
      <p>${nick} is a mentor, and DeepRest offers mentoring, which is not therapy or medical care.</p>
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
