import { ctaBand, pageHead } from '../lib/ui.mjs';

function feeTable(F) {
  const rows = F.value('fees.items');
  return `
<table class="fee-table">
  <caption class="visually-hidden">Fees for each type of appointment</caption>
  <thead>
    <tr><th scope="col">Appointment</th><th scope="col">Length</th><th scope="col">Fee</th></tr>
  </thead>
  <tbody>
    ${rows
      .map(
        (_, i) => `<tr>
      <th scope="row" data-label="Appointment">${F.text(`fees.items.${i}.appointment`)}</th>
      <td data-label="Length">${F.text(`fees.items.${i}.length`)}</td>
      <td data-label="Fee">${F.text(`fees.items.${i}.fee`)}</td>
    </tr>`,
      )
      .join('\n    ')}
  </tbody>
</table>`;
}

export default {
  slug: 'fees',
  name: 'Fees and insurance',
  title: () => 'Fees and insurance | DeepRest',
  description: () =>
    'Fees for appointments at DeepRest, how to pay, cancelling or moving an appointment, and using private health insurance.',
  main: (ctx) => {
    const { F, href } = ctx;
    const insurers = F.isNone('fees.insurers')
      ? '<p>Sessions are not currently available through health insurers.</p>'
      : `<p>${F.text('psychologist.name')} is a registered provider with these insurers:</p>${F.list('fees.insurers')}`;
    return `
${pageHead({
  eyebrow: 'Fees and insurance',
  title: 'Fees and insurance',
  lead: 'What appointments cost, how to pay, and how to use private health insurance.',
})}

<section class="section" aria-labelledby="fees-title">
  <div class="container narrow">
    <h2 id="fees-title">Fees</h2>
    ${feeTable(F)}
  </div>
</section>

<section class="section section-alt" aria-labelledby="paying-title">
  <div class="container split">
    <div>
      <h2 id="paying-title">Paying</h2>
      <p>${F.text('fees.payment')}</p>
    </div>
    <div id="cancelling">
      <h2 id="cancelling-title">Cancelling or moving an appointment</h2>
      <p>${F.text('fees.cancellation')}</p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="insurance-title" id="insurance">
  <div class="container split">
    <div>
      <h2 id="insurance-title">Using health insurance</h2>
      ${insurers}
    </div>
    <div class="card">
      <h3>Before you book, check with your insurer</h3>
      <ul class="tick-list">
        <li>whether your policy covers sessions with a psychologist, and how many;</li>
        <li>whether you need a referral first, for example from your GP;</li>
        <li>how much your policy pays for each session, and whether there is an excess to pay;</li>
        <li>any authorisation number you need to quote.</li>
      </ul>
    </div>
  </div>
</section>

${ctaBand(ctx, {
  title: 'Questions about fees?',
  text: `If anything here is unclear, please <a href="${href('contact')}">get in touch</a> before you book.`,
})}`;
  },
};
