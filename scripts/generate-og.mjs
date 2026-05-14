// Generates public/og.png from a hand-authored SVG.
//
// Run: `npm run og`
//
// This is a build-time tool. The PNG is committed to the repo so it ships
// without anyone needing to run the script — only re-run when the design
// changes (name, title, accent colors, etc.).

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, '..', 'public', 'og.png');

// Design tokens — keep in sync with src/styles/global.css.
const BG = '#0a0a0a';
const FG = '#e6e6e6';
const FG_MUTED = '#a0a0a0';
const FG_DIM = '#6b6b6b';
const ACCENT = '#7ee7c7';
const ACCENT_DIM = '#4fa88d';
const TRACE = '#2a5d4f';

const W = 1200;
const H = 630;

// PCB-trace motif on the right side: a few dots connected by L-shaped lines,
// echoing the Three.js background on the live hero without trying to reproduce it.
const motif = `
  <g opacity="0.55">
    <line x1="780" y1="120" x2="900" y2="120" stroke="${TRACE}" stroke-width="1.5"/>
    <line x1="900" y1="120" x2="900" y2="210" stroke="${TRACE}" stroke-width="1.5"/>
    <line x1="900" y1="210" x2="1080" y2="210" stroke="${TRACE}" stroke-width="1.5"/>
    <circle cx="780" cy="120" r="4" fill="${ACCENT}"/>
    <circle cx="900" cy="120" r="3" fill="${ACCENT_DIM}"/>
    <circle cx="900" cy="210" r="3" fill="${ACCENT_DIM}"/>
    <circle cx="1080" cy="210" r="4" fill="${ACCENT}"/>

    <line x1="870" y1="380" x2="1110" y2="380" stroke="${TRACE}" stroke-width="1.5"/>
    <line x1="1110" y1="380" x2="1110" y2="490" stroke="${TRACE}" stroke-width="1.5"/>
    <circle cx="870" cy="380" r="4" fill="${ACCENT}"/>
    <circle cx="1110" cy="490" r="4" fill="${ACCENT}"/>

    <line x1="720" y1="540" x2="820" y2="540" stroke="${TRACE}" stroke-width="1.5"/>
    <line x1="820" y1="540" x2="820" y2="460" stroke="${TRACE}" stroke-width="1.5"/>
    <circle cx="720" cy="540" r="3" fill="${ACCENT_DIM}"/>
    <circle cx="820" cy="460" r="3" fill="${ACCENT_DIM}"/>

    <circle cx="980" cy="320" r="2" fill="${ACCENT_DIM}"/>
    <circle cx="1040" cy="80" r="2" fill="${ACCENT_DIM}"/>
    <circle cx="700" cy="280" r="2" fill="${ACCENT_DIM}"/>
  </g>
`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  ${motif}

  <!-- prompt eyebrow -->
  <text x="80" y="130" font-family="JetBrains Mono, monospace" font-size="22" fill="${ACCENT_DIM}">luis@mywispy:~$ whoami</text>

  <!-- name (two lines) -->
  <text x="80" y="230" font-family="JetBrains Mono, monospace" font-size="58" font-weight="500" fill="${FG}" letter-spacing="-1.2">Luis Fernando</text>
  <text x="80" y="300" font-family="JetBrains Mono, monospace" font-size="58" font-weight="500" fill="${FG}" letter-spacing="-1.2">Pazzanese Pinheiro</text>

  <!-- title -->
  <text x="80" y="395" font-family="JetBrains Mono, monospace" font-size="34" fill="${ACCENT}">Computer Engineer</text>

  <!-- subtitle -->
  <text x="80" y="445" font-family="JetBrains Mono, monospace" font-size="22" fill="${FG_MUTED}">Embedded Systems · Cybersecurity · Low-level Programming</text>

  <!-- divider -->
  <line x1="80" y1="525" x2="135" y2="525" stroke="${ACCENT_DIM}" stroke-width="1.5"/>

  <!-- url -->
  <text x="80" y="565" font-family="JetBrains Mono, monospace" font-size="22" fill="${FG_DIM}">mywispy.com</text>
</svg>`;

mkdirSync(dirname(outPath), { recursive: true });
await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(outPath);

console.log(`Wrote ${outPath}`);
