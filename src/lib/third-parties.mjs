// The outside services the booking calendar loads, as measured by scripts/verify/calendly.mjs
// (src/data/calendly-third-parties.json), described from each service's own documentation.
// The privacy policy and cookie notice are written from these, so they name exactly what was
// measured. A host, cookie or stored item that matches no service here stops the build: it
// must be identified, with a source, before the pages can claim to be complete.
import fs from 'node:fs';

const DATA = new URL('../data/calendly-third-parties.json', import.meta.url);

const CALENDLY_PRIVACY = 'https://calendly.com/legal/privacy-notice';

// Every service, with the hosts the browser contacted for it and where its description comes from.
export const SERVICES = [
  {
    id: 'calendly',
    name: 'Calendly, LLC',
    hosts: [/(^|\.)calendly\.com$/],
    role: 'Provides the booking calendar and the booking form.',
    collects:
      'what you enter in the booking form and, like any website, your IP address, browser, device and operating system, your approximate location, and how you use the booking page.',
    privacy: CALENDLY_PRIVACY,
    privacyName: 'privacy notice',
    source: 'Calendly Privacy Notice, effective 3 July 2026, "log data": https://calendly.com/legal/privacy-notice',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare, Inc.',
    hosts: [],
    role: 'Protects Calendly’s website from automated traffic. It sets its cookies through Calendly’s own address.',
    collects:
      'a score of how likely your visit is to be automated, and an identifier that tells apart visitors who share an IP address, kept in two cookies on calendly.com.',
    privacy: 'https://www.cloudflare.com/privacypolicy/',
    source: 'Cloudflare cookies: https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/',
  },
  {
    id: 'onetrust',
    name: 'OneTrust, LLC',
    hosts: [/(^|\.)cookielaw\.org$/, /(^|\.)onetrust\.com$/],
    role: 'Runs the cookie banner Calendly shows inside the calendar.',
    collects:
      'your approximate location, looked up from your IP address so that the banner suits your country, and your answer to the banner, kept in cookies on calendly.com.',
    privacy: 'https://www.onetrust.com/privacy-notice/',
    source: 'Requests to geolocation.onetrust.com/cookieconsentpub/v1/geo/location seen in the test; OneTrust Cookies: https://my.onetrust.com/s/article/UUID-2dc719a8-4be5-8d16-1dc8-c7b4147b88e0',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    hosts: [/(^|\.)stripe\.com$/, /(^|\.)stripe\.network$/],
    role: 'Fraud prevention. Calendly’s page runs Stripe’s script even though the free sessions involve no payment.',
    collects:
      'information about your device and browser, and about how you use the page, such as mouse movements and time spent. Stripe says it uses this only for fraud detection and security, and never for advertising.',
    privacy: 'https://stripe.com/privacy',
    source: 'Stripe, Advanced fraud detection: https://docs.stripe.com/disputes/prevention/advanced-fraud-detection',
  },
  {
    id: 'google',
    name: 'Google LLC',
    hosts: [/(^|\.)recaptcha\.net$/, /(^|\.)gstatic\.com$/, /^accounts\.google\.com$/, /^www\.google\.com$/],
    role: 'reCAPTCHA, which checks on the booking form that a person, not a program, is booking. Calendly’s page also loads Google’s sign-in script.',
    collects:
      'hardware and software information, such as device and application data. Google says it uses this only to run and improve reCAPTCHA and for security, and not for personalised advertising.',
    privacy: 'https://policies.google.com/privacy?hl=en-GB',
    source: 'Google Cloud Service Specific Terms, reCAPTCHA: https://cloud.google.com/terms/service-terms; Sign in with Google client library (accounts.google.com/gsi/client): https://developers.google.com/identity/gsi/web/guides/client-library',
  },
  {
    id: 'airbrake',
    name: 'Airbrake',
    hosts: [/(^|\.)airbrake\.io$/],
    role: 'Error monitoring for Calendly’s page, which fetches Airbrake’s settings so that faults in the page can be reported.',
    collects: 'reports of faults in the page, if any occur.',
    privacy: 'https://www.airbrake.io/privacy',
    source: 'Request to notifier-configs.airbrake.io (notifier airbrake-js/browser) seen in the test',
  },
  // Loaded only if the visitor accepts Calendly's optional cookies. Calendly's banner gives
  // their purpose: "to improve and personalize your experience, to understand website
  // interactions (including clicks, cursor movement and screen recordings), and for marketing".
  // Their roles follow a colon on the privacy policy, so they start in lower case.
  { id: 'google-analytics', name: 'Google Analytics and Google Tag Manager (Google LLC)', hosts: [/(^|\.)google-analytics\.com$/, /(^|\.)googletagmanager\.com$/], role: 'measure how people use Calendly’s website.' },
  { id: 'meta', name: 'Meta Platforms (the Meta Pixel)', hosts: [/(^|\.)facebook\.net$/, /(^|\.)facebook\.com$/], role: 'Meta’s advertising code, for Calendly’s own marketing.' },
  { id: 'segment', name: 'Segment (Twilio Inc.)', hosts: [/(^|\.)segment\.io$/, /(^|\.)segment\.com$/], role: 'collects how people use Calendly’s page, and passes it on to Calendly’s other tools.' },
  { id: 'braze', name: 'Braze, Inc.', hosts: [/(^|\.)appboycdn\.com$/, /(^|\.)braze\.com$/, /(^|\.)braze\.eu$/], role: 'customer messaging.' },
  { id: 'sprig', name: 'Sprig', hosts: [/(^|\.)sprig\.com$/, /(^|\.)userleap\.com$/], role: 'surveys and recordings of how people use the page.' },
  { id: 'survicate', name: 'Survicate', hosts: [/(^|\.)survicate\.com$/], role: 'surveys.' },
];

// Every cookie and stored item, by name: whose it is and what it is for.
export const ITEMS = [
  { name: /^__cf_bm$/, service: 'cloudflare', purpose: 'A score of how likely your visit is to be automated' },
  { name: /^_cfuvid$/, service: 'cloudflare', purpose: 'Tells apart visitors who share an IP address' },
  { name: /^OptanonConsent$/, service: 'onetrust', purpose: 'Your answer to Calendly’s cookie banner' },
  { name: /^OptanonAlertBoxClosed$/, service: 'onetrust', purpose: 'That you have answered Calendly’s cookie banner' },
  { name: /^m$/, host: /stripe\.com$/, service: 'stripe', purpose: 'Stripe’s fraud prevention' },
  { name: /^(_ab|_mf|1|id)$/, host: /stripe\.network$/, service: 'stripe', purpose: 'Stripe’s fraud prevention' },
  { name: /^_cache$/, host: /calendly\.com$/, service: 'calendly', purpose: 'Used by Calendly’s booking page' },
  { name: /^rc::[a-z]$/, host: /recaptcha\.net$|google\.com$/, service: 'google', purpose: 'reCAPTCHA’s check that a person is booking' },
  { name: /^_GRECAPTCHA$/, service: 'google', purpose: 'reCAPTCHA’s check that a person is booking' },
  { name: /^ajs_/, service: 'segment', purpose: 'Identifies your browser to Segment' },
  { name: /^(userleap|sprig)\./, service: 'sprig', purpose: 'Identifies your browser to Sprig' },
];

const KIND = { cookie: 'Cookie', local: 'Local storage', session: 'Session storage' };

export const serviceOf = (host) => SERVICES.find((s) => s.hosts.some((re) => re.test(host)));
export const itemOf = (name, host) => ITEMS.find((i) => i.name.test(name) && (!i.host || i.host.test(host)));

// How long a cookie lasts, from the seconds it had left when it was measured. That is some
// seconds after the cookie was set, so a short lifetime is given to the nearest 5 minutes:
// Cloudflare's 30-minute cookie, read with 1,769 seconds left, is "30 minutes".
export function lifetime(item) {
  if (item.type === 'local') return 'Until it is deleted';
  if (item.type === 'session') return 'Until you close the tab';
  const s = item.seconds;
  if (s === null || s === undefined) return 'Until you close your browser';
  const minutes = Math.max(5, Math.round(s / 300) * 5);
  if (minutes < 120) return `${minutes} minutes`;
  const days = s / 86400;
  if (days < 2) return `${Math.round(s / 3600)} hours`;
  if (days < 60) return `${Math.round(days)} days`;
  const months = Math.round(days / 30.44);
  if (months % 12 === 0) return months === 12 ? '1 year' : `${months / 12} years`;
  return `${months} months`;
}

// The measured services and items of one observation, each matched to its service.
// Throws if anything cannot be matched.
export function describe(observation, siteHost) {
  const unknown = [];
  const services = new Set();
  for (const host of observation.hosts) {
    if (!host || host === siteHost) continue;
    const s = serviceOf(host);
    if (s) services.add(s.id);
    else unknown.push(`host ${host}`);
  }
  const items = [];
  for (const c of observation.cookies) items.push({ type: 'cookie', name: c.name, host: c.domain.replace(/^\./, ''), seconds: c.seconds });
  for (const s of observation.storage) items.push({ type: s.type, name: s.key, host: new URL(s.origin).hostname });
  const described = [];
  for (const it of items) {
    if (it.host === siteHost) continue; // the site's own setting, listed separately
    const match = itemOf(it.name, it.host);
    if (!match) {
      unknown.push(`${KIND[it.type].toLowerCase()} ${it.name} on ${it.host}`);
      continue;
    }
    services.add(match.service);
    described.push({ ...it, kind: KIND[it.type], service: match.service, purpose: match.purpose, lasts: lifetime(it) });
  }
  return { services: SERVICES.filter((s) => services.has(s.id)).map((s) => s.id), items: described, unknown };
}

const itemKey = (i) => `${i.type} ${i.name} ${i.host}`;

// The measurement as the pages present it: what loads whatever the visitor answers to
// Calendly's banner, and what loads only if they accept its optional cookies.
export function thirdParties(siteHost) {
  if (!fs.existsSync(DATA)) return null;
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const always = describe(data.declined, siteHost);
  const accepted = describe(data.accepted, siteHost);
  const unknown = [...new Set([...always.unknown, ...accepted.unknown])];
  if (unknown.length) {
    throw new Error(
      `src/data/calendly-third-parties.json has hosts or stored items that src/lib/third-parties.mjs does not identify: ${unknown.join('; ')}. Identify each, with a source, before building.`,
    );
  }
  const seen = new Set(always.items.map(itemKey));
  return {
    checked: data.checked,
    always: { services: always.services, items: always.items },
    optional: {
      services: accepted.services.filter((s) => !always.services.includes(s)),
      items: accepted.items.filter((i) => !seen.has(itemKey(i))),
    },
  };
}

export const service = (id) => SERVICES.find((s) => s.id === id);
