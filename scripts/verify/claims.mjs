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
