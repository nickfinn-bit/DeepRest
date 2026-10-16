import { pageHead } from '../lib/ui.mjs';

// GitHub Pages serves 404.html for any missing address, at any depth, so this
// page links from the site root through a <base> element instead of relative paths.
export default {
  slug: '404',
  name: 'Page not found',
  is404: true,
  title: () => 'Page not found | DeepRest',
  description: () => 'The page you were looking for is not on the DeepRest website.',
  main: ({ href }) => `
${pageHead({
  eyebrow: 'Error 404',
  title: 'Page not found',
  lead: 'The page you were looking for isn’t here. It may have moved, or the address may be mistyped.',
})}

<section class="section" aria-labelledby="next-title">
  <div class="container narrow">
    <h2 id="next-title">Where to next</h2>
    <ul class="link-list">
      <li><a href="${href('')}">Home page</a></li>
      <li><a href="${href('book')}">Book a session</a></li>
      <li><a href="${href('faq')}">Questions and answers</a></li>
      <li><a href="${href('contact')}">Contact</a></li>
    </ul>
  </div>
</section>`,
};
