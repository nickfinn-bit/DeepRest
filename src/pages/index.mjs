// Every page of the site, in navigation order. Each renders to <slug>/index.html.
import about from './about.mjs';
import book from './book.mjs';
import contact from './contact.mjs';
import cookies from './cookies.mjs';
import faq from './faq.mjs';
import fees from './fees.mjs';
import home from './home.mjs';
import notFound from './not-found.mjs';
import privacy from './privacy.mjs';
import services from './services.mjs';

export const PAGES = [home, about, services, fees, faq, book, contact, privacy, cookies, notFound];
