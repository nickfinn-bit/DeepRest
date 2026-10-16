import { icons } from '../lib/icons.mjs';
import { ctaBand, ext } from '../lib/ui.mjs';
import { HCPC_REGISTER } from '../lib/layout.mjs';

export default {
  slug: '',
  name: 'Home',
  title: ({ F }) => `DeepRest: the psychology practice of ${F.plain('psychologist.name')}`,
  description: ({ F }) =>
    `DeepRest is the psychology practice of ${F.plain('psychologist.name')}, ${F.plain('psychologist.title')}, registered with the HCPC. Book an appointment online.`,
  main: (ctx) => {
    const { F, href } = ctx;
    return `
<section class="hero" aria-labelledby="hero-title">
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">Psychology practice</p>
      <h1 id="hero-title">A calm, confidential space to talk things through</h1>
      <p class="lead">DeepRest is the practice of ${F.text('psychologist.name')}, ${F.text('psychologist.title')}, registered with the Health and Care Professions Council.</p>
      <div class="button-row">
        <a class="btn btn-primary btn-lg" href="${href('book')}">Book a session</a>
        <a class="btn btn-secondary btn-lg" href="${href('about')}">About the psychologist</a>
      </div>
    </div>
    <aside class="hero-card" aria-labelledby="glance-title">
      <h2 id="glance-title" class="hero-card-title">At a glance</h2>
      <dl class="glance">
        <div><dt>${icons.shield}Registration</dt><dd>HCPC, number ${F.text('psychologist.hcpcNumber')}</dd></div>
        ${F.isNone('psychologist.bpsMembership') ? '' : `<div><dt>${icons.user}Membership</dt><dd>British Psychological Society: ${F.text('psychologist.bpsMembership')}</dd></div>`}
        <div><dt>${icons.calendar}Sessions</dt><dd>${F.text('sessions.formats')}</dd></div>
        <div><dt>${icons.info}Fees</dt><dd><a href="${href('fees')}">Fees and insurance</a></dd></div>
      </dl>
    </aside>
  </div>
</section>

<section class="section" aria-labelledby="start-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Getting started</p>
      <h2 id="start-title">How it works</h2>
    </div>
    <ol class="steps">
      <li>
        <h3>Choose a time</h3>
        <p>Pick an appointment that suits you in the online booking calendar. You’ll be asked for your name and email address to confirm it.</p>
      </li>
      <li>
        <h3>Your first appointment</h3>
        <p>You’ll talk about what has brought you here and what you would like to change, and decide together whether, and how, to continue.</p>
      </li>
      <li>
        <h3>Working together</h3>
        <p>Sessions follow a plan you agree together, and you’ll review along the way how things are going.</p>
      </li>
    </ol>
  </div>
</section>

<section class="section section-alt" aria-labelledby="help-title">
  <div class="container split">
    <div>
      <p class="eyebrow">Areas of work</p>
      <h2 id="help-title">What ${F.text('psychologist.name')} can help with</h2>
      <p>Who ${F.text('psychologist.name')} works with: ${F.text('psychologist.clientGroups')}.</p>
      <p><a class="link-arrow" href="${href('services')}">Services and approach${icons.arrow}</a></p>
    </div>
    <div>
      ${F.list('psychologist.specialisms')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="trust-title">
  <div class="container split">
    <div>
      <p class="eyebrow">Registered and accountable</p>
      <h2 id="trust-title">A registered practitioner psychologist</h2>
      <p>In the UK, titles such as clinical psychologist and counselling psychologist are protected by law. Only people on the Health and Care Professions Council’s register may use them, and they must meet its standards of conduct, performance and ethics.</p>
    </div>
    <div class="card">
      <h3>Check the register</h3>
      <p>${F.text('psychologist.name')} is registered as ${F.text('psychologist.title')}, registration number ${F.text('psychologist.hcpcNumber')}.</p>
      <p>${ext(HCPC_REGISTER, 'Check the HCPC register')}</p>
    </div>
  </div>
</section>

${ctaBand(ctx, {
  title: 'When you’re ready',
  text: 'You can book online at a time that suits you. If you would like to ask something first, you’re welcome to get in touch.',
})}`;
  },
};
