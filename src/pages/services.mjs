import { icons } from '../lib/icons.mjs';
import { ctaBand, pageHead } from '../lib/ui.mjs';

export default {
  slug: 'services',
  name: 'Services and approach',
  title: () => 'Services and approach | DeepRest',
  description: ({ F }) =>
    `What ${F.plain('psychologist.name')} offers at DeepRest, who it is for, the approach and therapies used, and what working together involves.`,
  main: (ctx) => {
    const { F, href } = ctx;
    return `
${pageHead({
  eyebrow: 'Services and approach',
  title: 'How we can work together',
  lead: `What ${F.text('psychologist.name')} offers, who it is for, and what to expect from your sessions.`,
})}

<section class="section" aria-labelledby="who-title">
  <div class="container split">
    <div>
      <h2 id="who-title">Who ${F.text('psychologist.name')} works with</h2>
      <p>${F.text('psychologist.clientGroups')}</p>
    </div>
    <div>
      <h2 id="areas-title">Areas of work</h2>
      ${F.list('psychologist.specialisms')}
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="approach-title">
  <div class="container"><div class="prose">
    <h2 id="approach-title">Approach and therapies</h2>
    ${F.paras('psychologist.approach')}
  </div></div>
</section>

<section class="section" aria-labelledby="formats-title">
  <div class="container split">
    <div>
      <h2 id="formats-title">How sessions take place</h2>
      <p>${F.text('sessions.formats')}</p>
      <p>The length and fee of each type of appointment are on the <a href="${href('fees')}">fees and insurance</a> page.</p>
    </div>
    <div class="card">
      <h3>${icons.lock}Confidentiality</h3>
      <p>What you discuss is kept confidential. There are limits that apply to every registered psychologist: information may have to be shared if there is a serious risk of harm to you or to someone else, or if the law or a court requires it. Wherever it is possible and safe, this would be discussed with you first.</p>
      <p>You can ask about these limits at any point, including before you book.</p>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="expect-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">What to expect</p>
      <h2 id="expect-title">From first appointment to ending</h2>
    </div>
    <ol class="steps">
      <li>
        <h3>The first appointment</h3>
        <p>A conversation about what has brought you, what you hope might change, and whether working together feels right for you.</p>
      </li>
      <li>
        <h3>Working together</h3>
        <p>You agree together what you would like to work on and how. Along the way you review how things are going, and adjust the plan if it would help.</p>
      </li>
      <li>
        <h3>Ending</h3>
        <p>You are free to stop at any point. Before finishing, you can look back together at what has helped and what you would like to take forward.</p>
      </li>
    </ol>
  </div>
</section>

${ctaBand(ctx, {
  title: 'Taking the first step',
  text: 'Book a first appointment online. If you are not sure whether this is the right service for you, you can ask a question first.',
})}`;
  },
};
