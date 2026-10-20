// Every page of the site, in navigation order. Each renders to <slug>/index.html.
import about from './about.mjs';
import book from './book.mjs';
import contact from './contact.mjs';
import cookies from './cookies.mjs';
import faq from './faq.mjs';
import home from './home.mjs';
import mentoring from './mentoring.mjs';
import notFound from './not-found.mjs';
import privacy from './privacy.mjs';

export const PAGES = [home, mentoring, about, faq, book, contact, privacy, cookies, notFound];
