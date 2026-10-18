import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const directory = resolve("public/social");
await mkdir(directory, { recursive: true });
const wave = (x, y, color, seed) =>
  Array.from({ length: 45 }, (_, index) => {
    const h =
      14 +
      Math.abs(Math.sin(index * 1.8 + seed) * Math.sin(index * 0.33)) * 100;
    return `<rect x="${x + index * 16}" y="${y - h / 2}" width="6" height="${h}" rx="3" fill="${color}" opacity="${0.45 + Math.abs(Math.sin(index)) * 0.5}"/>`;
  }).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
<rect width="1080" height="1350" fill="#e8e6d7"/>
<g stroke="#103135" stroke-opacity=".055">${Array.from({ length: 28 }, (_, i) => `<path d="M${i * 48} 0V1350M0 ${i * 48}H1080"/>`).join("")}</g>
<g font-family="Arial, Helvetica, sans-serif" fill="#103135">
<text x="80" y="110" font-size="25" letter-spacing="5" font-weight="700">CAPCAR</text><text x="1000" y="110" font-size="16" text-anchor="end" letter-spacing="2">SOUND STUDIO</text>
<text x="76" y="265" font-size="100" letter-spacing="-5">Your stock.</text><text x="76" y="370" font-size="100" letter-spacing="-5" fill="#925e49">Your shortlist.</text>
<text x="82" y="439" font-size="25">150 real engine &amp; exhaust recordings. One listening desk.</text>
<rect x="70" y="505" width="940" height="603" rx="34" fill="#0d282c"/>
<text x="112" y="568" font-size="17" fill="#cfaa96" letter-spacing="3">FIND YOUR NEXT SOUND</text>
<rect x="108" y="607" width="864" height="196" rx="20" fill="#183a3e" stroke="#45645e"/>
<rect x="133" y="634" width="39" height="39" rx="9" fill="#b7d4bd"/><text x="152" y="661" text-anchor="middle" font-size="22" font-weight="700">A</text>
<text x="192" y="661" font-size="25" fill="#e8e6d7">Your stock recording</text><text x="192" y="691" font-size="16" fill="#bbcec4">Add a clip from your own car</text>
${wave(163, 750, "#b7d4bd", 0)}
<rect x="108" y="826" width="864" height="196" rx="20" fill="#183a3e" stroke="#6c5146"/>
<rect x="133" y="853" width="39" height="39" rx="9" fill="#f0b69d"/><text x="152" y="880" text-anchor="middle" font-size="22" font-weight="700">B</text>
<text x="192" y="880" font-size="25" fill="#e8e6d7">Anything that catches your ear</text><text x="192" y="910" font-size="16" fill="#bbcec4">Pick a real recording. Hear the difference.</text>
${wave(163, 969, "#f0b69d", 2)}
<text x="112" y="1066" font-size="16" fill="#becfc5">SEARCH BY CAR</text><text x="403" y="1066" font-size="16" fill="#becfc5">COMPARE A / B</text><text x="700" y="1066" font-size="16" fill="#becfc5">PRIVATE FILES</text>
<text x="82" y="1181" font-size="30" font-weight="600">Hear your next move.</text><text x="82" y="1244" font-size="26">capcar.dev/sound-studio</text><circle cx="943" cy="1224" r="39" fill="#103135"/><path d="M927 1224h30m-12-12 12 12-12 12" stroke="#e8e6d7" stroke-width="3" fill="none"/>
<text x="82" y="1305" font-size="15" fill="#506763">Compare sound character. Recordings do not predict fitment or real-world volume.</text>
</g></svg>`;
await writeFile(resolve(directory, "capcar-sound-studio-instagram.svg"), svg);
await sharp(Buffer.from(svg))
  .png()
  .toFile(resolve(directory, "capcar-sound-studio-instagram.png"));
const share = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0d282c"/><g fill="#e8e6d7" font-family="Arial, Helvetica, sans-serif"><text x="80" y="90" font-size="22" letter-spacing="4">CAPCAR / SOUND STUDIO</text><text x="75" y="245" font-size="90" letter-spacing="-4">Hear your next move.</text><text x="80" y="320" font-size="28" fill="#f0b69d">150 real recordings. Your stock. Your shortlist.</text>${wave(80, 432, "#b7d4bd", 0)}<text x="80" y="555" font-size="24">capcar.dev/sound-studio</text><text x="1110" y="555" text-anchor="end" font-size="20">COMPARE A / B</text></g></svg>`;
await sharp(Buffer.from(share))
  .png()
  .toFile(resolve(directory, "capcar-sound-studio-share.png"));
console.log("Created 1080×1350 Instagram artwork and 1200×630 social preview.");
