import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../public/icons');
const publicDir = path.join(__dirname, '../public');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// ─── Icon Design ────────────────────────────────────────────────────────────
// Brand: Mem Deck – Memorized Deck Trainer
// Color: #007AFF (iOS system blue)
// Design: Blue background, white playing card, blue spade suit

// Regular icon (purpose: any) — rounded background, card + spade
const regularIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#1A9FFF"/>
      <stop offset="100%" stop-color="#0066DD"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect x="156" y="76" width="200" height="300" rx="16" fill="#FFFFFF"/>
  <path d="M256 160 c-8 12 -60 60 -60 100 c0 28 20 48 44 48 c8 0 12 -2 16 -4 c4 2 8 4 16 4 c24 0 44 -20 44 -48 c0 -40 -52 -88 -60 -100z" fill="#007AFF"/>
  <rect x="250" y="296" width="12" height="42" fill="#007AFF"/>
  <rect x="234" y="330" width="44" height="10" rx="3" fill="#007AFF"/>
</svg>`;

// Maskable icon (purpose: maskable) — full bleed, content inside 80% safe zone
const maskableIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#1A9FFF"/>
      <stop offset="100%" stop-color="#0066DD"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(0.68) translate(-256 -256)">
    <rect x="156" y="76" width="200" height="300" rx="16" fill="#FFFFFF"/>
    <path d="M256 160 c-8 12 -60 60 -60 100 c0 28 20 48 44 48 c8 0 12 -2 16 -4 c4 2 8 4 16 4 c24 0 44 -20 44 -48 c0 -40 -52 -88 -60 -100z" fill="#007AFF"/>
    <rect x="250" y="296" width="12" height="42" fill="#007AFF"/>
    <rect x="234" y="330" width="44" height="10" rx="3" fill="#007AFF"/>
  </g>
</svg>`;

// ─── Sizes ──────────────────────────────────────────────────────────────────
const regularSizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const maskableSizes = [192, 512];

// ─── Generate ───────────────────────────────────────────────────────────────
async function generateIcons() {
  console.log('🎴 Generating PWA icons for Mem Deck...\n');

  // Clean old per-size SVGs (replaced by master SVGs)
  const oldSvgs = fs.readdirSync(iconsDir).filter(f => f.match(/^icon-\d+x\d+\.svg$/));
  for (const svg of oldSvgs) {
    fs.unlinkSync(path.join(iconsDir, svg));
    console.log(`  Removed old ${svg}`);
  }

  // Write master SVGs
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), regularIconSVG);
  console.log('  ✓ icons/icon.svg');

  fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), maskableIconSVG);
  console.log('  ✓ icons/icon-maskable.svg');

  // Write favicon SVG (same design as regular icon)
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), regularIconSVG);
  console.log('  ✓ favicon.svg');

  console.log('');

  // Generate regular PNG icons (purpose: any)
  console.log('Regular icons (purpose: any):');
  for (const size of regularSizes) {
    await sharp(Buffer.from(regularIconSVG))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`  ✓ icon-${size}x${size}.png`);
  }

  console.log('');

  // Generate maskable PNG icons (purpose: maskable)
  console.log('Maskable icons (purpose: maskable):');
  for (const size of maskableSizes) {
    await sharp(Buffer.from(maskableIconSVG))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-maskable-${size}x${size}.png`));
    console.log(`  ✓ icon-maskable-${size}x${size}.png`);
  }

  console.log('');

  // Generate apple-touch-icon (180x180, uses maskable design — no rounded corners)
  console.log('Apple touch icon:');
  await sharp(Buffer.from(maskableIconSVG))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('  ✓ icons/apple-touch-icon.png');

  console.log('');

  // Generate favicon PNG (32x32)
  console.log('Favicon:');
  await sharp(Buffer.from(regularIconSVG))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('  ✓ favicon-32x32.png');

  console.log('\n✅ All PWA icons generated successfully!');
  console.log(`   ${regularSizes.length} regular + ${maskableSizes.length} maskable + 1 apple-touch + 1 favicon = ${regularSizes.length + maskableSizes.length + 2} PNG files`);
}

generateIcons().catch((error) => {
  console.error('❌ Icon generation failed:', error);
  process.exit(1);
});
