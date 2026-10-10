/* Stylised cameo silhouettes for the five suspects.
   Each is an SVG string; `currentColor` is the ink, var(--cameo-paper) the backing. */
(function () {
  const frame = (inner, id) => `
<svg class="cameo cameo--${id}" viewBox="0 0 200 240" role="img" aria-label="Portrait silhouette" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cp-${id}" cx="50%" cy="38%" r="70%">
      <stop offset="0" stop-color="var(--cameo-paper-hi)"/>
      <stop offset="1" stop-color="var(--cameo-paper)"/>
    </radialGradient>
    <clipPath id="cc-${id}"><ellipse cx="100" cy="120" rx="92" ry="112"/></clipPath>
  </defs>
  <ellipse cx="100" cy="120" rx="92" ry="112" fill="url(#cp-${id})"/>
  <g clip-path="url(#cc-${id})" fill="currentColor">${inner}</g>
  <ellipse cx="100" cy="120" rx="92" ry="112" fill="none" stroke="var(--cameo-rim)" stroke-width="3"/>
</svg>`;

  const shoulders = (y = 150) =>
    `<path d="M-10 ${y + 95} C 10 ${y + 10} 60 ${y} 100 ${y} C 140 ${y} 190 ${y + 10} 210 ${y + 95} Z"/>`;

  const P = {};

  // Lord Percival — top hat, white tie, waxed moustache
  P.percival = frame(`
    <rect x="58" y="22" width="84" height="70" rx="4"/>
    <rect x="40" y="86" width="120" height="10" rx="5"/>
    <ellipse cx="100" cy="118" rx="33" ry="38"/>
    <rect x="86" y="146" width="28" height="22"/>
    ${shoulders(158)}
    <path d="M70 126 q30 -18 60 0 q-30 -6 -60 0z" fill="var(--cameo-paper)" opacity=".95"/>
    <path d="M86 170 l14 10 l14 -10 l-4 8 l4 8 l-14 -8 l-14 8 l4 -8z" fill="var(--cameo-paper)"/>
    <path d="M78 46 h44" stroke="var(--cameo-paper)" stroke-width="3" opacity=".5"/>
  `, 'percival');

  // Miss Thorne — hair in a high bun, lace collar, jet earring
  P.thorne = frame(`
    <circle cx="100" cy="52" r="20"/>
    <ellipse cx="100" cy="112" rx="34" ry="40"/>
    <path d="M66 100 q34 -40 68 0 q-34 -20 -68 0z"/>
    <path d="M62 112 q-6 -46 38 -58 q44 12 38 58 q-14 -30 -38 -30 q-24 0 -38 30z"/>
    <rect x="88" y="146" width="24" height="18"/>
    ${shoulders(156)}
    <path d="M64 166 q36 -22 72 0 l-6 10 q-30 -14 -60 0z" fill="var(--cameo-paper)" opacity=".92"/>
    <circle cx="100" cy="176" r="4" fill="var(--cameo-accent)"/>
    <circle cx="134" cy="128" r="3.5" fill="var(--cameo-paper)"/>
  `, 'thorne');

  // Mr. Marlowe — receding hair, round spectacles, cravat, watch chain
  P.marlowe = frame(`
    <ellipse cx="100" cy="112" rx="34" ry="40"/>
    <path d="M66 100 q10 -10 10 -22 q-14 10 -16 24z M134 100 q-10 -10 -10 -22 q14 10 16 24z"/>
    <rect x="86" y="146" width="28" height="20"/>
    ${shoulders(158)}
    <circle cx="86" cy="112" r="11" fill="none" stroke="var(--cameo-paper)" stroke-width="2.5"/>
    <circle cx="116" cy="112" r="11" fill="none" stroke="var(--cameo-paper)" stroke-width="2.5"/>
    <path d="M97 112 h8" stroke="var(--cameo-paper)" stroke-width="2.5"/>
    <path d="M100 166 l-12 10 l12 26 l12 -26z" fill="var(--cameo-paper)" opacity=".9"/>
    <path d="M60 206 q40 -22 80 0" fill="none" stroke="var(--cameo-accent)" stroke-width="2.5" stroke-dasharray="3 3"/>
  `, 'marlowe');

  // Dr. Vance — side-parted hair, full beard, high collar
  P.vance = frame(`
    <ellipse cx="100" cy="112" rx="35" ry="42"/>
    <path d="M64 100 q6 -40 50 -36 q26 2 24 36 q-20 -16 -44 -14 q-20 4 -30 14z"/>
    <path d="M70 128 q30 44 60 0 q-6 36 -30 40 q-24 -4 -30 -40z"/>
    <rect x="88" y="150" width="24" height="14"/>
    ${shoulders(158)}
    <path d="M84 162 l16 12 l16 -12 l-2 8 l-14 8 l-14 -8z" fill="var(--cameo-paper)" opacity=".92"/>
    <path d="M78 116 q8 -6 16 0 M106 116 q8 -6 16 0" fill="none" stroke="var(--cameo-paper)" stroke-width="2"/>
  `, 'vance');

  // Mrs. Finch — centre parting, lace cap, brooch at the throat
  P.finch = frame(`
    <ellipse cx="100" cy="114" rx="33" ry="38"/>
    <path d="M64 108 q0 -46 36 -46 q36 0 36 46 q-8 -26 -36 -26 q-28 0 -36 26z"/>
    <path d="M60 86 q40 -36 80 0 q-6 -10 -40 -12 q-34 2 -40 12z" fill="var(--cameo-paper)" opacity=".9"/>
    <rect x="88" y="148" width="24" height="16"/>
    ${shoulders(158)}
    <path d="M70 164 q30 -14 60 0 l-4 8 q-26 -10 -52 0z" fill="var(--cameo-paper)" opacity=".92"/>
    <ellipse cx="100" cy="176" rx="6" ry="7" fill="var(--cameo-accent)"/>
    <ellipse cx="100" cy="176" rx="2.5" ry="3" fill="var(--cameo-paper)"/>
  `, 'finch');

  window.PORTRAITS = P;
})();
