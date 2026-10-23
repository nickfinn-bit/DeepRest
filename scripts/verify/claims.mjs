// The words the site, and any advert for it, must never use: protected professional titles
// and clinical or medical claims. Shared by facts.mjs and any script that checks other text.

// Titles that are protected in the UK, or that would present Nick as a clinician:
// the HCPC's protected titles, the BPS's grades and "psychologist", "therapist" and
// "counsellor" in every form. None may appear anywhere on the site.
export const PROTECTED = [
  /psycholog/i, // psychologist, psychology, psychological, practitioner psychologist and every HCPC psychologist title
  /therapist/i, // arts, drama, music, occupational, speech and language therapist; psychotherapist
  /counsel+or/i,
  /\bcounsel+ing\b/i,
  /psychiatr/i,
  /\bHCPC\b|Health and Care Professions Council/i,
  /\bBPS\b|British Psychological Society|\bCPsychol\b|\b[AM]?F?BPsS\b|\bchartered\b/i,
  /\b(dietitian|physiotherapist|paramedic|radiographer|podiatrist|chiropodist|orthoptist|prosthetist|orthotist|biomedical scientist|clinical scientist|hearing aid dispenser|operating department practitioner|social worker|nurse|doctor)\b/i,
  /\bDr\.?\s/,
];

// Words that would make a clinical or medical claim about what mentoring does.
// "diagnostic" is Nick's own word for the free sessions; the medical "diagnose" and
// "diagnosis" are not used.
export const CLINICAL = [/\bclinic(al|ian|s)?\b/i, /\bcur(e|es|ed|ing)\b/i, /\btreat(s|ed|ing|ment|ments)?\b/i, /\bpatients?\b/i, /\bdiagnos(e|es|ed|is|ing)\b/i, /\bprescri/i, /\bdisorder/i, /\bsymptom/i];

// Every match of the lists in a piece of text, with 40 characters either side.
export function findClaims(text) {
  const find = (list) => list.flatMap((re) => [...text.matchAll(new RegExp(re.source, `${re.flags.replace('g', '')}g`))].map((m) => text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).trim()));
  return { protectedTitles: find(PROTECTED), clinicalClaims: find(CLINICAL) };
}

// Claims the site made beyond Nick's three facts (five years mentoring students and young
// adults; a 100% satisfaction rate across 23 clients; the first five sessions free, as a
// diagnostic), found when every page was read against them, each with where it was and what
// replaced it. The pattern matches the claim in any wording close to the one removed: none may
// come back. The last two entries are privacy statements that measuring the booking
// calendar showed to be untrue.
export const RETIRED = [
  {
    claim: 'That Nick got clients out of tech addiction',
    found: [
      ['home', 'For five years he has mentored students and young adults through tech addiction, and helped them out of it.'],
      ['home', 'he has seen many people go through tech addiction, and has been able to help them get out of it.'],
      ['about', 'For five years, Nick has helped students and young adults get out of tech addiction.'],
      ['about', 'It has meant seeing many people go through tech addiction, and being able to help them get out of it.'],
      ['mentoring', 'has seen many people go through tech addiction and come out of it.'],
      ['mentoring', 'someone on your side, who has helped others through the same thing.'],
    ],
    fix: 'Each says only that he has mentored students and young adults for five years.',
    re: /\bout of (it|tech)|\b(has|have|had|been able to) help(ed)?\b|\bhelp(ed)? (them|others|students|young)\b|\bseen many people\b|\bthrough the same thing\b/i,
  },
  {
    claim: 'That his five years of mentoring were for tech addiction',
    found: [
      ['home', 'he has mentored students and young adults through tech addiction'],
      ['about', 'Nick Finnemore has mentored students and young adults through tech addiction for five years (description)'],
    ],
    fix: '“has mentored students and young adults for five years”; DeepRest is described separately as his tech-addiction mentoring practice.',
    re: /\bthrough tech addiction\b/i,
  },
  {
    claim: 'That he has mentored 23 clients in all',
    found: [
      ['home', 'Clients mentored: 23 (figures panel)'],
      ['about', 'Clients mentored: 23 (figures panel)'],
      ['home', 'A 100% satisfaction rate across the 23 clients Nick has mentored.'],
      ['about', 'Across the 23 clients he has mentored, Nick’s satisfaction rate is 100%.'],
    ],
    fix: 'The figure is given only as he gave it: “Satisfaction rate across 23 clients: 100%”.',
    re: /\bclients mentored\b|\bclients (Nick|he) (has )?mentored\b/i,
  },
  {
    claim: 'That he is young, and that being young is an advantage',
    found: [
      ['home', 'Young, and that’s the advantage (heading)'],
      ['home', 'He is young, and that has played to his advantage'],
      ['about', 'He is young, and that has played to his advantage.'],
    ],
    fix: 'Heading “Five years of mentoring”, over the three facts.',
    re: /\bhe is young\b|\byoung, and\b|\badvantage\b/i,
  },
  {
    claim: 'Who the practice is for',
    found: [
      ['home', 'Mentoring for students and young adults who want to break free from tech addiction (description)'],
      ['mentoring', 'One-to-one mentoring for students and young adults who want to break free from tech addiction (description and lead)'],
      ['mentoring', 'Who it’s for: DeepRest is for students and young adults who feel that their phone, games or time online have taken over more of their life than they would like'],
      ['about', 'set up to offer that mentoring to students and young adults who feel that tech has too much of a hold on them.'],
      ['faq', 'Who is DeepRest for? Students and young adults who feel that tech has too much of a hold on them'],
      ['faq', 'Answers to common questions … who it is for (description)'],
      ['footer', 'Tech-addiction mentoring for students and young adults, with Nick Finnemore.'],
    ],
    fix: 'Removed. The pages say whom he has mentored (students and young adults, for five years), not whom DeepRest is for; the footer reads “Tech-addiction mentoring with Nick Finnemore.”',
    re: /\bbreak free\b|\btaken over\b|\bhold on (them|you)\b|\bwho (it is|it’s|it's|DeepRest is) for\b|\bwho is DeepRest for\b|\bmentoring for students\b/i,
  },
  {
    claim: 'How sessions are held, and what mentoring is like',
    found: [
      ['home', 'Mentoring is practical, one-to-one support from someone on your side.'],
      ['mentoring', 'Mentoring is practical, one-to-one support from someone on your side'],
      ['mentoring', 'One-to-one mentoring for students and young adults (lead)'],
      ['faq', 'No. Mentoring is practical, one-to-one support.'],
    ],
    fix: '“Mentoring, not therapy”: mentoring is not therapy or medical care. How sessions are held is listed under _dropped in site.config.json.',
    re: /\bone-to-one\b|\bon your side\b|\bpractical(,)? (one-to-one )?support\b/i,
  },
  {
    claim: 'What the five free diagnostic sessions cover',
    found: [
      ['home', 'With Nick, you look at how tech fits into your days, what it is costing you and what you would like to change, and you find out whether mentoring is right for you.'],
      ['home', 'Over your first five sessions, which are free, you and Nick build a clear picture of your tech habits and what you want to change.'],
      ['mentoring', 'a chance to understand your tech habits and what you want to change, and to see whether mentoring with Nick suits you.'],
      ['mentoring', 'Over your first five sessions, you and Nick look at how tech fits into your days, what it is costing you and what you would like to change.'],
      ['faq', 'so that you and Nick can understand your situation and decide whether mentoring is right for you.'],
    ],
    fix: '“Your first five sessions are free, as a diagnostic. There is nothing to pay for them.” What the diagnostic covers is listed under _dropped.',
    re: /\bhow tech fits\b|\bwhat it is costing you\b|\bclear picture\b|\bunderstand your (tech habits|situation)\b|\bfind out whether\b|\bwhether mentoring with Nick suits you\b|\bwhat you (want|would like) to change\b/i,
  },
  {
    claim: 'What happens after the five free sessions',
    found: [
      ['home', 'After the five free sessions, you decide together whether to carry on. There is no obligation to continue.'],
      ['mentoring', 'There is nothing to pay for them, and no obligation to continue afterwards.'],
      ['mentoring', 'When the five free sessions are over, you decide together whether to carry on. It is your choice.'],
      ['faq', 'What happens after the five free sessions? You and Nick decide together whether to carry on. There is no obligation to continue.'],
    ],
    fix: 'Removed; listed under _dropped until Nick says what happens after the five free sessions.',
    re: /\bdecide together\b|\bno obligation\b|\bit is your choice\b|\bafter the five free sessions\b|\bcarry on\b/i,
  },
  {
    claim: 'His professional background',
    found: [
      ['about', 'He is not a medical or mental health professional'],
      ['faq', 'Nick is not a medical or mental health professional.'],
    ],
    fix: '“Nick is a mentor, and mentoring is not therapy or medical care.” His background is not one of his facts.',
    re: /\bmental health professional\b/i,
  },
  {
    claim: 'That no Meta code can reach a visitor through the site',
    found: [
      ['privacy', 'The website has no Meta code, such as Meta’s Pixel, and sends Meta nothing about your visit or your booking.'],
      ['cookies', 'The website has no Meta code, such as Meta’s Pixel, so Meta sets no cookies through it.'],
    ],
    fix: 'The site’s own pages have no Meta code; Calendly’s page loads Meta’s code only if the visitor accepts Calendly’s optional cookies, as both pages now say.',
    re: /\bMeta sets no cookies\b|\bThe website has no Meta code\b/i,
  },
  {
    claim: 'That the booking calendar’s cookies all come from Calendly',
    found: [
      ['cookies', 'Cookies are set only if you choose to load the booking calendar, and they come from Calendly.'],
      ['cookies', 'Once it is loaded, your browser connects to Calendly, which sets its own cookies.'],
      ['privacy', 'If you choose to load the booking calendar, Calendly collects information about your device and sets cookies'],
    ],
    fix: 'Both pages name every service the calendar loads, as measured: Calendly, Cloudflare, OneTrust, Stripe, Google reCAPTCHA and Airbrake, and those that load only if Calendly’s optional cookies are accepted.',
    re: /\bthey come from Calendly\.|\bconnects to Calendly, which sets its own cookies\b|\bCalendly collects information about your device and sets cookies\b/i,
  },
];

// Every retired claim that appears in a piece of text, with 40 characters either side.
export function findRetired(text) {
  return RETIRED.flatMap((r) =>
    [...text.matchAll(new RegExp(r.re.source, `${r.re.flags.replace('g', '')}g`))].map((m) => ({
      claim: r.claim,
      words: text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).trim(),
    })),
  );
}
