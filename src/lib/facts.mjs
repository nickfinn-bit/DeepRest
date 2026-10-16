// Reads facts from site.config.json. A fact that is not known yet is an object
// with a "placeholder" key: it renders as a visibly marked placeholder, and every
// use is recorded so PLACEHOLDERS.md can list where it appears.

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const isPlaceholder = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && 'placeholder' in v;

// Every placeholder in the config, in file order, as { key, placeholder, needs, interim }.
export function listPlaceholders(node, prefix = '') {
  if (isPlaceholder(node)) return [{ key: prefix, ...node }];
  if (node === null || typeof node !== 'object') return [];
  return Object.entries(node)
    .filter(([k]) => !k.startsWith('_'))
    .flatMap(([k, v]) => listPlaceholders(v, prefix ? `${prefix}.${k}` : k));
}

const isNone = (v) => typeof v === 'string' && v.trim().toLowerCase() === 'none';
const asList = (v) => (Array.isArray(v) ? v : [v]);

export function createFacts(config) {
  const usage = [];
  let context = { page: '', region: '' };

  const lookup = (key) => {
    const value = key.split('.').reduce((node, part) => node?.[part], config);
    if (value === undefined) throw new Error(`site.config.json has no "${key}"`);
    return value;
  };
  const record = (key) => usage.push({ key, ...context });
  const mark = (key, label) =>
    `<span class="ph" data-ph="${esc(key)}">[${esc(label)}]</span>`;
  const block = (key, v) =>
    `<div class="ph-block" data-ph="${esc(key)}"><p class="ph-block-label">` +
    `<span class="ph-tag">To be supplied</span> ${esc(v.placeholder)}</p>` +
    `<p class="ph-block-needs">${esc(v.needs)}</p></div>`;

  return {
    usage,
    setContext(page, region) {
      context = { page, region };
    },
    isPlaceholder: (key) => isPlaceholder(lookup(key)),
    // True when the fact is confirmed as "none": the caller leaves its line out.
    isNone: (key) => isNone(lookup(key)),

    // The value to use in code: the real value, or the interim value of a placeholder.
    value(key) {
      const v = lookup(key);
      if (!isPlaceholder(v)) return v;
      record(key);
      return v.interim ?? null;
    },

    // Inline HTML: the escaped value, or a marked placeholder.
    text(key) {
      const v = lookup(key);
      if (!isPlaceholder(v)) return asList(v).map(esc).join(', ');
      record(key);
      return mark(key, v.placeholder);
    },

    // Plain text for <title>, meta tags and attributes.
    plain(key) {
      const v = lookup(key);
      if (!isPlaceholder(v)) return asList(v).join(', ');
      record(key);
      return `[${v.placeholder}]`;
    },

    // A list of values as <ul>, or a placeholder block.
    list(key, className = 'tick-list') {
      const v = lookup(key);
      if (isPlaceholder(v)) {
        record(key);
        return block(key, v);
      }
      return `<ul class="${className}">${asList(v).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    },

    // Paragraphs, or a placeholder block.
    paras(key) {
      const v = lookup(key);
      if (isPlaceholder(v)) {
        record(key);
        return block(key, v);
      }
      return asList(v).map((p) => `<p>${esc(p)}</p>`).join('');
    },

    // Address or other multi-line text, lines separated by <br>.
    lines(key) {
      const v = lookup(key);
      if (isPlaceholder(v)) {
        record(key);
        return mark(key, v.placeholder);
      }
      return asList(v).map(esc).join('<br>');
    },
  };
}
