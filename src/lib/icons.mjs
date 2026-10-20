// Inline SVG icons. All are decorative (aria-hidden): the text beside them carries the meaning.

const svg = (body, size = 24, cls = 'icon') =>
  `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true" focusable="false">${body}</svg>`;

export const logo = (size = 34) =>
  `<svg class="logo" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">` +
  `<circle cx="20" cy="20" r="20" fill="#1e5650"/>` +
  `<path d="M9 17.5c3.7-3 7.3-3 11 0s7.3 3 11 0" fill="none" stroke="#cfe3dc" stroke-width="2.2" stroke-linecap="round"/>` +
  `<path d="M9 23.5c3.7-3 7.3-3 11 0s7.3 3 11 0" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>` +
  `</svg>`;

export const icons = {
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  calendar: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>'),
  info: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 20),
  chevron: svg('<path d="M6 9l6 6 6-6"/>', 20, 'icon chevron'),
  external: svg('<path d="M14 5h5v5M19 5l-8 8M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10"/>', 16, 'icon icon-ext'),
  gift: svg('<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v7.5h14v-7.5M12 8.5V20M12 8.5c-1.6-3.2-5.5-3.6-5.5-1.4 0 1.4 2.4 1.4 5.5 1.4zM12 8.5c1.6-3.2 5.5-3.6 5.5-1.4 0 1.4-2.4 1.4-5.5 1.4z"/>'),
  heart: svg('<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>'),
};
